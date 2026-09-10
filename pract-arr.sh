#!/bin/bash

target_hosts=("localhost" "127.0.0.1" "192.168.99.99")

weak_port=(8080 21)


dict="hosts.txt"


ports=$(IFS=','; echo "${weak_port[*]}")



for i in "${target_hosts[@]}"; do

    if grep -q "$i" "$dict"; then
        echo "Found $i in $dict"


        nmap -sT -p "$ports" "$i"


    else
        echo "$i not found in $dict"

        



    fi

done
