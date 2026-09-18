#!/bin/bash

host="127.0.0.1"


check_ports=(21 80 443 8080 3306)

for i in "${check_ports[@]}"; do


if timeout 2 bash -c "echo > /dev/tcp/$host/$i" 2>/dev/null; then
    echo "Port $i on $host is OPEN"
else
    echo "Port $i on $host is CLOSED"
fi

done
