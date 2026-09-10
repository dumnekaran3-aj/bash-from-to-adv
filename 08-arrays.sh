#!/bin/bash

ports=(22 80 443 8080)

echo "tot port ::  ${#ports[@]}"

echo "First port: ${ports[0]}"

for port in "${ports[@]}"; do
    echo "chacking  ports :: $port"
done

ports+=(3306)

echo " added new  ports and all is :: ${#ports[@]}"

echo "total ports in array :: ${ports[@]}"

echo "==========================================================================="
echo "=============================karan-defender================================"

port_user=("karan" "aryan" "sammu")

for user in "${port_user[@]}"; do
    echo "users find :: $user"
done

echo "total user find ${#port_user[@]}"

echo "===================================================================="
echo " expected for prediction :: ${ports[10]} | no value and no error .."
