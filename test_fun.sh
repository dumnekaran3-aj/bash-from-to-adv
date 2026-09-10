#!/bin/bash

multiplay(){

local result=$(( $1 * $2 ))

echo "$result"



}
answer=$(multiplay 6 7)
echo "ans is the : $answer"
