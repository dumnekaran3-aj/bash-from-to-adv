#!/bin/bash

read -p "enter a url :: " base_url

port() {

    local input_url=$1
    
   


    local clean_url=$(echo "$input_url" | sed -E 's|https?://||' | sed -E 's|/.*||')
    

    local port=(8000 22 443 21 8080 27017 5432 1433 1521)


for  target_port in "${port[@]}"; do



  echo "Checking connection to $clean_url on port $target_port..."

    


    if timeout 2 bash -c "echo > /dev/tcp/$clean_url/$target_port" 2>/dev/null; then

      
        echo "Port $target_port is opeen "

    else
        echo "Port $target_port is close or unreach.."

fi

done
    }


port "$base_url"
