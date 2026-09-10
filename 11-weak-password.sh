#!/bin/bash



weak_passwords=("admin" "12345" "password" "root")

username=("karan")



read -p "enter a password :: " input_weak_password
#10

is_weak="false"

for pass in "${weak_passwords[@]}"; do

if [ "$pass" == "$input_weak_password" ]; then
   is_weak="true"
fi
done



if [ "$is_weak" == "true" ]; then
    echo "password is weak"
else
    echo "password is not weak"
fi
