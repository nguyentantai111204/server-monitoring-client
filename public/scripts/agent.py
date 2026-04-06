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

def push_metrics():
    net = get_network_usage()
    payload = {
        "cpuUsage": get_cpu_usage(),
        "ramUsage": get_ram_usage(),
        "diskUsage": get_disk_usage(),
        "networkIn": net["networkIn"],
        "networkOut": net["networkOut"],
        "ipAddress": socket.gethostbyname(socket.gethostname()),
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
            cmd_data = json.loads(body).get("data")
            if cmd_data: execute_command(cmd_data)
        except: pass

def execute_command(cmd):
    cid = cmd.get("id")
    payload = cmd.get("payload")
    cmd_str = payload.get("cmd") if isinstance(payload, dict) else str(payload)
    
    print(f"[*] Executing [{cid}]: {cmd_str}")
    try:
        res = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=30)
        output = res.stdout + res.stderr
        status = "SUCCESS" if res.returncode == 0 else "FAILED"
    except Exception as e:
        output, status = str(e), "FAILED"

    api_request("PUT", f"/api/commands/agent/{cid}/result", {"status": status, "resultLog": output})
    print(f"[+] Command [{cid}] done: {status}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-t", "--token", required=True)
    parser.add_argument("-u", "--url", required=True)
    args = parser.parse_args()
    
    AGENT_TOKEN, BACKEND_URL = args.token, args.url
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
