#!/bin/bash

base_url="http://localhost:8000"

endpoints=("/api/health" "/api/users" "/api/admin" "/api/login" "/api/admin/dashboard" "/random-fake-route")

check_endpoint() {
    local url=$1
    local status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
    echo "$url -> $status"
    if [ "$status" == "200" ]; then
        echo "  ⚠️  WARNING: $url is publicly accessible (200 OK) — verify this should be public!"
    fi
}

for endpoint in "${endpoints[@]}"; do
    check_endpoint "$base_url$endpoint"
done
