#!/bin/bash


read -p "eneter a domine ===> :: " domine




subdomine(){

local url=$1

for dom in "${wordlist[@]}"; do

res=$(dig +short +time=2 +tries=1 "$sub.$domain")

echo "$res"
done >> subdomine.txt

}

subdomine "$domine"

