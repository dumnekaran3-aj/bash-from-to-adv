#!/bin/bash

TARGET="http://127.0.0.1:8000/api/auth/signup"
IDS_FILE="collected_ids.txt"

rm -f "$IDS_FILE"

for i in $(seq 1 10); do
    username="user$i"
    password="${username}@123"

    response=$(curl -s -X POST "$TARGET" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"email\":\"$username@test.com\",\"password\":\"$password\"}")

    id=$(echo "$response" | jq -r '.user.id')
    echo "$id" >> "$IDS_FILE"
    echo "Created: $username / $password (ID: $id)"
done
