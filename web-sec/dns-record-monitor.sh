#!/bin/bash


read -p "eneter a domain :: " domain


dns_record(){

local dom=$1

spf=$(dig TXT +short "$dom" | grep "v=spf1")

if [ -z "$spf" ]; then

echo "No spf record found"

elif echo "$spf" | grep -q -- "-all"; then

echo "spf is STRONG /hard"

else
    echo "spf is weak..."

fi


}

dns_record "$domain"
