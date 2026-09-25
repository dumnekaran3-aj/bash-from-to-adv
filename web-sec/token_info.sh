#!/bin/bash

read -p "eneter a token here ..." test_token

ttt="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTY4Y2NjYTBhNWZiZDJiMDYzYmE2NCIsImlhdCI6MTc4OTcyOTg4MCwiZXhwIjoxNzkwMzM0NjgwfQ.IXTDK8U2-bwbDJQxaJOjbmSr3cap_7039ooEal52DbE"


keywords=("balance" "password" "email" "secret_key" "secret" "token" "apiKey" "private" "admin" "role" "author" "public")


split_token() {
    local token=$1


    header_part=$(echo "$token" | cut -d"." -f1)
    payload_part=$(echo "$token" | cut -d"." -f2)

    signature_part=$(echo "$token" | cut -d"." -f3)
}



read_header_data() {
     
 echo "$header_part" | base64 -d 2>/dev/null
    echo ""
}

read_payload_data(){  
      
     decode=$(echo "$payload_part" | base64 -d 2>/dev/null)

     echo "decoded data ... $decode"

     for key in "${keywords[@]}"; do
        

          if grep -q "$key" <<< "$decode"; then
 
          echo "sesitive leaking .. $key"


         fi


     done

} 

read_signature_data(){

 decode_sign=$(echo "$signature_part" | base64 -d 2>/dev/null | xxd -p)

     

echo "clean signature :: $decode_sign"


}





split_token "$test_token"
read_header_data

read_payload_data
read_signature_data
