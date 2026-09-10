#!/bin/bash

correct_name="karan"
correct_pass="12345"
correct_token="abcdefghijklmnopqrstuvwxyz"

read -p "inter your name :: " name
read -sp "inter your password :: " password
echo ""
read -p "inter a token :: " token

if [ "$name" != "$correct_name" ]; then
    echo "user name is wrong..."



elif [ "$password" != "$correct_pass" ]; then
    echo "password is wrong ..."

elif [ "$token" == "$correct_token" ]; then
    echo "token reading success full"


    
    echo -e "\nhey .. $name , thank ou to submitt appliction \nyour current repo.. is $HOME pls come back again .."
    echo "pass :: *****"



    echo "username is :: $name"


    echo "token is :: *************************************"


else
    echo "invalid Token ..."
    
fi
