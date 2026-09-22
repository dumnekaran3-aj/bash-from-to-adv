
#!/bin/bash



keywords=("balance" "password" "email" "secret_key")


base_url="http://localhost:8000/api/user"


idor_scan(){

local base=$1
local status=$(curl -s -o /dev/null "${http_code}" -L "${url}")




    for id in {1..10}; do
       
       local url="${base}/${id}/profile"
    local body=$(curl -s -L "$url")
           echo "$url"
          echo "ID $id -> $body"
          

     for  key in "${keywords[@]}"; do

 
         if grep -q "$key" <<< "$body"; then

            echo "idor possible :: detected keywords :: $key"

         if [ "$status" == "200" ]; then

             echo "api is not ACTIVE...."
          fi   
         fi

done
done

}


idor_scan "$base_url"
