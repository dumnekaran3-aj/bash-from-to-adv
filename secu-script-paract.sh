#!/bin/bash

check_port() {


    local host=$1


    local port=$2
    if timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
        echo "Port $port on $host is OPEN"
            return 0
    else

        echo "Port $port on $host is CLOSED"
             return 1
    fi

}




hosts_list=("172.20.37.198" "127.0.0.1" "localhost")

check_ports=(21 443 8080 5000 80 8000)


open_count=0

for i in "${check_ports[@]}"; do

    for j in "${hosts_list[@]}"; do

        check_port "$j" "$i"       


        if [ $? -eq 0 ]; then           
            open_count=$(( open_count + 1 ))


        fi


    done
done

echo "Total open ports found: $open_count"
