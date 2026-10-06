
#!/bin/bash 


read -p "enter a base url :: " base_url
sensitive_keys=("X-Powered-By" "Strict-Transport-Security" "X-Content-Type-Options")

sensitive_keywords=("admin" "secreate" "API-key" "balance" "apikey")

chack_header(){
local url=$1

header=$(curl -s -I "${url}")

for head in "${sensitive_keys[@]}"; do

       if echo "$header" | grep -qi "$head"; then
          echo "leaking sensitive data : $head"

       else
           echo "no sensitive data leak:: $head"

      fi
done

}

#chack_header "$base_url"

rate_limit(){

local url=$1
rate_limit=false

for i in {1..20}; do

status=$(curl -s -o /dev/null -w "%{http_code}" "${url}")

echo "req : $i , status ;: $status"

if [ "$status" -eq 404 ] || [ "$status" -eq 429 ]; then
        rate_limit=true
    fi

done

if [ "$rate_limit" = true ]; then
    echo "rate limit is active"
else
    echo "rate limit not avl"
fi

}
#rate_limit "$base_url"

over_fecth(){
local url=$1

body=$(curl -s "${url}/api/config")

for i in "${sensitive_keywords[@]}"; do

    if grep -qi "$i" <<< "$body"; then

    echo "sensitive data leaking .. $i"
else

    echo "no sensitive data leaking $body"

fi

done
}


#over_fecth "$base_url"



cleaning_data(){

echo "------------------------------------------------"
echo "-----------security header--------"
                chack_header "$base_url"
echo"-------------------------------------------------"
echo "---------------rate-limit-----------------------"

                  rate_limit "$base_url"

echo "------------------------------------------------"
echo "--------------over-fecthing-data-----------------"
                    over_fecth "$base_url"

echo "-------------------------------------------------"

}


cleaning_data










