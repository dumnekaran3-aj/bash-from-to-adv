#!/bin/bash


echo -n "karan" | sha256sum

echo -n "karan" | md5sum

hash=$(printf '%s' "$password" | md5sum |awk '{print $1}')
echo "$hash"
