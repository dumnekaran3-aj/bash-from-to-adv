#!/bin/bash

sensitive_keywords=("password" "secret" "token" "apiKey" "private")
local_url="http://localhost:8000"

endpoints=("/api/auth/me" "/api/health" "/api/admin" "/api/admin/dashboard" "/api/posts?page=1" "/api/config" "/api/users" "/fake/end" "/about" "/dashboard")


check_endpoint() {

local url=$1
local url_value=$(curl -s http://localhost:8000)
echo "conent detected endpoint :: $url_value"


echo "Checking: $url"

local full_url="${local_url}${endpoints[@]}"


local status=$(curl -s -o /dev/null -w "${http_code}" -L "$url")

local body=$(curl -s -L "${url}")


match_found=false

for i in "${sensitive_keywords[@]}"; do

    if grep -q "$i" <<< "$body"; then

       

       echo "Sensitive keyword '$i' detected!"
           match_found=true
   else
        
        echo "Sensitive keyword '$i' not fount ..."

   fi
done


if [ "$match_found" = true ]; then
        
        echo "dected url conent ::  $url"
        
        echo "$body"
        
    else
        echo " Clean: No sensitive data found."
    fi



}


for endpoint in "${endpoints[@]}";do

    check_endpoint "$local_url$endpoint"

done


