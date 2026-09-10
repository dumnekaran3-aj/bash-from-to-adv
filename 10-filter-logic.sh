#!/bin/bash



open_ports=(22 80 443 3306 6379 8080 27017)
dangerous_ports=(3306 6379 27017 9200)


for port in "${open_ports[@]}"; do
    is_danger="false"

for dport in "${dangerous_ports[@]}"; do

    if [ $"$port" == "$dport" ]; then
       is_danger="true"
    fi


done


if [ "$is_danger" == "true" ]; then

   echo "port $port is danger is public"

else
    echo "port $port is looks normal"

fi

done


