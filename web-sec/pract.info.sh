#!/bin/bash


read -p "inter your name :: " target_url

endpoints=("/api/users" "/api/admin" "/api/user" "/api/dashboard")

ports=(21 22 443 8080 5000 80 8000)

special_endpoint=("/api/user/")

open_pass="karan"

info(){


url=$1
port=$2

status=$(curl -s /dev/null/ "${http_code}" -L "${url}")
body=$(curl -s /dev/null/ -L "${url}")


if [ "$open_pass" == "karan" ]; then


   for p in "$ports[@]"; do

          if timeout 2 bash -c "echo > /dev/tcp/$url/$port" 2>/dev/null; then
        echo "Port $port on $url is OPEN"
            return 0
    else

        echo "Port $port on $host is CLOSED"
             return 1
    fi

      if [ "$port" == "OPEN" ]; then

          echo "security risk please close ports  if open"



    else 


        echo "password is wrong"

fi



}
