#!/bin/bash

THRESHOLD=5


TIME_WINDOW="5 minutes ago"
ALERT_LOG="suspicious_ips.log"

declare -A ip_count

logput=$(journalctl -u ssh --since "$TIME_WINDOW" --no-pager | grep -i "Failed password")

if [ -n "$logput" ]; then


    while read -r line; do


        ip=$(echo "$line" | awk '{for(i=1;i<=NF;i++) if($i=="from") print $(i+1)}')

        if [ -n "$ip" ]; then
            ip_count["$ip"]=$(( ${ip_count["$ip"]:-0} + 1 ))
    
    fi
    done <<< "$logput"
fi


for ip in "${!ip_count[@]}"; do
    count=${ip_count[$ip]}
    if [ "$count" -ge "$THRESHOLD" ]; then
        echo "Suspicious: $ip"


        echo "$(date): $ip flagged with $count attempts" >> "$ALERT_LOG"
    fi
done
