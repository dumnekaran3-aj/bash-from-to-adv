#!/bin/bash

check_age(){

local age=$(( $1 ))

  echo "$age"           #5 line

if [ $age -lt 13 ]; then
    echo "child"


elif [ $age -le 19 ]; then
     echo "teenager .."

else
    echo "adult"

fi



}

#check_age 14
#check_age 21
#check_age 7


count_vowels() {
    local count=$(echo "$1" | grep -o "[aeiouAEIOU]" | wc -l)
    echo "$1 has $count vowels"
}

#count_vowels "Karan"

read -p "Enter your name: " user_name
read -p "Enter your age: " user_age

check_age "$user_age"
count_vowels "$user_name"

for i in 1 2 3; do
    echo "Welcome check $i for $user_name"
done

if [ -f "hosts.txt" ]; then
    echo "hosts.txt file exists"
else
    echo "hosts.txt file not found"
fi
