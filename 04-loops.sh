#!/bin/bash

for i in {1..20..5}; do
    echo "Step value: $i"
done

echo "for loop "


for file in *.sh; do
    echo "script found :: $file"
done

echo "while with cover"

count=1

while [ $count -le 3 ]; do

echo "while count : $count"

count=$((count + 1))

done



