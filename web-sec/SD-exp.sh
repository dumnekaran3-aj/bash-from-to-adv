
#!/bin/bash 


read -p "enter a base url :: " base_url

sensitive_keys=("X-Powered-By" "Strict-Transport-Security" "X-Content-Type-Options")

sensitive_keywords=("admin" "secreate" "API-key" "balance" "apikey")

endpoint=("/api/config" "/api/health" "/api/users" "/api/dashboard" "api/user/profile/" "/api/posts" "/api/auth/me" "/api/comments" "/api/auth/signin" )

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

if [ "$status" -eq 429 ]; then
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
local base=$1

for ep in "${endpoint[@]}"; do

    body=$(curl -s "${base}${ep}")


    for i in "${sensitive_keywords[@]}"; do


       if grep -qi "$i" <<< "$body"; then
            echo "sensitive data leaking at $ep :: $i"
            echo "finded body :: $body"


        fi
    done
done

}

#over_fecth "$base_url"

bodydata(){

local url=$1

for end in "${endpoint[@]}"; do
  
body=$(curl -s "${url}${end}")
echo "$body"
done


}



cleaning_data(){

echo "------------------------------------------------"
echo "-----------security header--------"
                chack_header "$base_url"
echo "-------------------------------------------------"
echo "---------------rate-limit-----------------------"

                  rate_limit "${base_url}${endpoint[@]}"

echo "------------------------------------------------"
echo "--------------over-fecthing-data-----------------"
                    over_fecth "${base_url}"

echo "-------------------------------------------------"
echo "----------------url body res---------------------"
                     bodydata "${base_url}" 

}


cleaning_data











