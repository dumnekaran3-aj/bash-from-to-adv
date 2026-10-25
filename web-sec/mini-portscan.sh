#!/bin/bash


#s1

read -p "enetr a internet protocol/host :: " host

read -p "starting with :: " start
read -p "ending with :: " end
echo "port count defult : 0"

port_count=0

for port in $(seq $start $end); do


scan=$(timeout 0 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null)


if [ $? -eq 0 ]; then


echo "$port is OPEN "

port_count=$((port_count +1))
echo "port count :: $port_count"

fi


done

echo "final result :: finded port count : $port_count"


if [ "$port_count" -eq 0 ]; then

echo "all port are CLOSEdd"

fi
