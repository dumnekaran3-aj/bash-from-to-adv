#!/bin/bash

read -p "Enter an IP :: " HOST

read -p "Enter PORTS separated by space :: " -a PORTS

isAlive="false"
open_ports=()

reconsweep(){
    local ip=$1

    if ping -c 1 -w 2 "$ip" > /dev/null 2>&1; then
        isAlive="true"
        echo "IP $ip is alive.."



        record=$(nslookup "$ip" 2>/dev/null | grep -i "name")
        if [ -z "$record" ]; then

            record="No DNS record found"
        fi



        for port in "${PORTS[@]}"; do
            echo "Scanning port $port..."
            if timeout 1 bash -c "cat < /dev/null > /dev/tcp/$ip/$port" 2>/dev/null; then

                open_ports+=("$port")
            fi
        done


        echo "Host           :: $ip"

        echo "Alive          :: $isAlive"
        echo "DNS Record     :: $record"

        if [ ${#open_ports[@]} -eq 0 ]; then

            echo "Open Ports     :: None of the specified ports are open"
        else
            echo "Open Ports     :: ${open_ports[*]}"
        fi

    else
        echo "IP $ip is DEAD or blocking ping."
    fi
}

reconsweep "$HOST"




