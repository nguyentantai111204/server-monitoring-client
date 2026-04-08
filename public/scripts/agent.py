#!/usr/bin/env python3
import os
import sys
import json
import time
import argparse
import subprocess
import socket
import urllib.request
from urllib.error import HTTPError, URLError

# Configuration
AGENT_TOKEN = ""
BACKEND_URL = ""
MANUAL_IP = None
METRIC_INTERVAL = 30
POLL_INTERVAL = 10

prev_cpu_times = None

def get_cpu_usage():
    global prev_cpu_times
    try:
        with open("/proc/stat", "r") as f:
            line = f.readline()
            if not line.startswith("cpu "): return 0.0
            parts = [float(x) for x in line.split()[1:8]]
            idle = parts[3] + parts[4]
            non_idle = sum(parts) - idle
            
            if prev_cpu_times is None:
                prev_cpu_times = (idle, non_idle)
                return 0.0
            
            p_idle, p_non_idle = prev_cpu_times
            total_diff = (idle + non_idle) - (p_idle + p_non_idle)
            idle_diff = idle - p_idle
            prev_cpu_times = (idle, non_idle)
            
            if total_diff == 0: return 0.0
            return round(100 * (total_diff - idle_diff) / total_diff, 2)
    except: return 0.0

def get_ram_usage():
    try:
        mem = {}
        with open("/proc/meminfo", "r") as f:
            for line in f:
                parts = line.split(":")
                if len(parts) == 2:
                    mem[parts[0].strip()] = int(parts[1].split()[0])
        total = mem.get("MemTotal", 0)
        avail = mem.get("MemAvailable", mem.get("MemFree", 0))
        if total == 0: return 0.0
        return round(100 * (total - avail) / total, 2)
    except: return 0.0

def get_disk_usage():
    try:
        st = os.statvfs('/')
        total = st.f_blocks * st.f_frsize
        free = st.f_bavail * st.f_frsize
        if total == 0: return 0.0
        return round(100 * (total - free) / total, 2)
    except: return 0.0

def get_network_usage():
    try:
        net_in = net_out = 0
        with open("/proc/net/dev", "r") as f:
            for line in f.readlines()[2:]:
                parts = line.split(":")
                if "lo" in parts[0]: continue
                stats = parts[1].split()
                net_in += int(stats[0])
                net_out += int(stats[8])
        return {"networkIn": net_in, "networkOut": net_out}
    except: return {"networkIn": 0, "networkOut": 0}

def get_top_processes():
    try:
        # Standard ps command that works on most modern Linux systems
        cmd = "ps -eo pid,user,%cpu,%mem,comm --sort=-%cpu | head -n 16"
        res = subprocess.check_output(cmd, shell=True, text=True).strip().splitlines()
        processes = []
        for line in res[1:]:
            p = line.split(None, 4)
            if len(p) < 5: continue
            processes.append({
                "pid": int(p[0]), "user": p[1],
                "cpu": float(p[2].replace(',', '.')), "mem": float(p[3].replace(',', '.')),
                "command": p[4].strip()
            })
        return processes
    except: return []

def api_request(method, endpoint, data=None):
    url = f"{BACKEND_URL.rstrip('/')}{endpoint}"
    headers = {"x-agent-token": AGENT_TOKEN, "Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, res.read().decode("utf-8")
    except HTTPError as e: return e.code, e.read().decode("utf-8")
    except: return 0, ""

def get_ip_address():
    if MANUAL_IP:
        return MANUAL_IP
    try:
        # Try to find the primary interface IP by creating a dummy UDP connection
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "0.0.0.0"

def push_metrics():
    net = get_network_usage()
    payload = {
        "cpuUsage": get_cpu_usage(),
        "ramUsage": get_ram_usage(),
        "diskUsage": get_disk_usage(),
        "networkIn": net["networkIn"],
        "networkOut": net["networkOut"],
        "ipAddress": get_ip_address(),
        "topProcesses": get_top_processes()
    }
    status, body = api_request("POST", "/api/metrics/push", payload)
    if status == 201:
        print(f"[OK] Metrics pushed. CPU: {payload['cpuUsage']}% | RAM: {payload['ramUsage']}%")
    else:
        print(f"[ERR] Failed to push: {status}")

def poll_commands():
    status, body = api_request("GET", "/api/commands/agent/poll")
    if status == 200 and body:
        try:
            response_json = json.loads(body)
            cmd_data = response_json.get("data")
            if cmd_data:
                print(f"[*] Received command: {cmd_data.get('commandType')}")
                execute_command(cmd_data)
        except Exception as e:
            print(f"[ERR] Error in poll_commands: {str(e)}")
            print(f"[DEBUG] Body was: {body}")

def execute_command(cmd):
    cid = cmd.get("id")
    ctype = cmd.get("commandType")
    payload = cmd.get("payload") or {}
    
    if ctype == "GET_ACTIVE_USERS":
        # More robust command to get logged-in users
        cmd_str = "who || w -h || users"
    elif ctype == "UPDATE_AGENT":
        # Special case if needed, but for now we follow general cmd
        cmd_str = payload.get("cmd") if isinstance(payload, dict) else str(payload)
    else:
        cmd_str = payload.get("cmd") if isinstance(payload, dict) else str(payload)
    
    if not cmd_str:
        print(f"[ERR] No command string for {ctype}")
        api_request("PUT", f"/api/commands/agent/{cid}/result", {"status": "FAILED", "resultLog": f"No command provided for {ctype}"})
        return

    print(f"[*] Executing [{cid}] ({ctype}): {cmd_str}")
    try:
        res = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=30)
        output = res.stdout + res.stderr
        status = "SUCCESS" if res.returncode == 0 else "FAILED"
        if not output.strip() and status == "SUCCESS":
            output = "(No output)"
    except Exception as e:
        output, status = str(e), "FAILED"
        print(f"[ERR] Execution failed: {output}")

    print(f"[*] Sending result for [{cid}]: {status}")
    res_status, res_body = api_request("PUT", f"/api/commands/agent/{cid}/result", {"status": status, "resultLog": output})
    if res_status in [200, 201]:
        print(f"[+] Command [{cid}] done & reported: {status}")
    else:
        print(f"[ERR] Failed to report result [{cid}]: {res_status} | {res_body}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-t", "--token", required=True)
    parser.add_argument("-u", "--url", required=True)
    parser.add_argument("--ip", help="Manually specify IP address")
    args = parser.parse_args()
    
    AGENT_TOKEN, BACKEND_URL, MANUAL_IP = args.token, args.url, args.ip
    print(f"--- Agent running | URL: {BACKEND_URL} ---")
    
    last_metric = last_poll = 0
    while True:
        now = time.time()
        if now - last_poll >= POLL_INTERVAL:
            poll_commands()
            last_poll = now
        if now - last_metric >= METRIC_INTERVAL:
            push_metrics()
            last_metric = now
        time.sleep(1)
