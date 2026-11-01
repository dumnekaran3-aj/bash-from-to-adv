#!/bin/bash


read -p "eneter a domine ===> :: " domine




subdomine(){

local url=$1

for dom in $(cat subdomine.txt);do

res=$(dig +short +time=2 +tries=1 "$dom.$url")

if [ -n "$res" ]; then
    echo "FOUND: $dom.$url -> $res"
fi


done

}

subdomine "$domine"

