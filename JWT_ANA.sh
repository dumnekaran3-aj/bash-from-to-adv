#!/bin/bash


read -p "eneter a token here :: " base_token


read -p "enetr a target url :: " target_url


parts(){

local token=$1

header=$(echo "$token" | cut -d"." -f1)
payload=$(echo "$token" | cut -d"." -f2)

signature=$(echo "$token" | cut -d"." -f3)

echo "header part :: $header"

echo "payload part :: $payload"
echo "signature part :: $signature"


}

parts "$base_token"

decode_token(){

               read_header(){

               decode=$(echo "$header" | base64 -d 2>/dev/null)
               echo "decoded header :: $decode"
                    }
read_header

               read_payload(){

               decode_payload=$(echo "$header" | base64 -d 2>/dev/null)

              echo "$decode_payload"
                   }
read_payload



               read_sign(){

            sin_data=$(decode_sign=$(echo "$signature" | base64 -d 2>/dev/null | xxd -p)
            echo "$sig_data"
                   }


read_sign


             }

#decode_token




JWT_vulna(){

local url=$1

STATUS=$(curl -s  /dev/null -w "{http_code}" "${url}")
echo "status is :: $STATUS"


}




