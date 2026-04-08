#!/bin/bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--token) TOKEN="$2"; shift ;;
        -u|--url) URL="$2"; shift ;;
        -ip|--ip) IP="$2"; shift ;;
    esac
    shift
done

if [ -z "$TOKEN" ] || [ -z "$URL" ]; then
    echo "Usage: sudo bash install.sh -t <token> -u <url>"
    exit 1
fi

echo "--- Installing Agent ---"
INSTALL_DIR="/opt/server-monitor"
mkdir -p $INSTALL_DIR

if ! command -v python3 &> /dev/null; then
    apt update && apt install -y python3
fi

echo "Downloading agent..."
curl -sSL "$URL/scripts/agent.py" -o "$INSTALL_DIR/agent.py"

IP_STR=""
if [ -n "$IP" ]; then
    IP_STR="--ip $IP"
fi

cat <<EOF > /etc/systemd/system/server-monitor-agent.service
[Unit]
Description=Server Monitor Agent
After=network.target

[Service]
ExecStart=/usr/bin/python3 -u $INSTALL_DIR/agent.py -t $TOKEN -u $URL $IP_STR
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now server-monitor-agent
systemctl status server-monitor-agent --no-pager

echo "--- Done! ---"
