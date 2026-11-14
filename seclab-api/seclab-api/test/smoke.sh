#!/usr/bin/env bash
# Quick sanity check: secure endpoints sahi behave kar rahe hain ya nahi.
# Usage: bash test/smoke.sh [base_url]
B=${1:-http://127.0.0.1:3000}
pass=0; fail=0
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
tok()  { curl -s -X POST "$B/api/auth/signin" -H 'content-type: application/json' -d "{\"email\":\"$1\",\"password\":\"$2\"}" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p'; }
check() { if [ "$2" = "$3" ]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 (expected $3, got $2)"; fail=$((fail+1)); fi; }

ADMIN=$(tok admin@lab.local 'Admin@12345'); ALICE=$(tok alice@acme.test 'Alice@12345')
BOB_ORDER=$(curl -s "$B/api/admin/orders" -H "Authorization: Bearer $ADMIN" | sed -n 's/.*"id":"\(ord[^"]*\|[0-9a-f-]\{36\}\)","userId":"1003".*/\1/p' | head -1)

check "health public"                       "$(code $B/api/health)" 200
check "no token -> 401"                     "$(code $B/api/user)" 401
check "tampered token -> 401"               "$(code $B/api/user -H 'Authorization: Bearer abc.def.ghi')" 401
check "client -> admin dashboard 403"       "$(code $B/api/admin/dashboard -H "Authorization: Bearer $ALICE")" 403
check "admin -> admin dashboard 200"        "$(code $B/api/admin/dashboard -H "Authorization: Bearer $ADMIN")" 200
check "client -> /api/users 403"            "$(code $B/api/users -H "Authorization: Bearer $ALICE")" 403
check "alice edits bob profile -> 404"      "$(code -X POST $B/api/public/api/user/1003/profile -H "Authorization: Bearer $ALICE" -H 'content-type: application/json' -d '{"name":"hacked"}')" 404
check "profile mass-assign role -> 400"     "$(code -X POST $B/api/public/api/user/1002/profile -H "Authorization: Bearer $ALICE" -H 'content-type: application/json' -d '{"role":"admin"}')" 400
check "signup role=admin ignored"           "$(curl -s -X POST $B/api/signup -H 'content-type: application/json' -d '{"name":"Eve","email":"eve'$RANDOM'@x.test","password":"Passw0rdX","role":"admin"}' | grep -c '"role":"client"')" 1
check "alice reads bob order -> 404"        "$(code $B/api/client/orders/${BOB_ORDER:-none} -H "Authorization: Bearer $ALICE")" 404
check "NoSQLi on signin -> 400"             "$(code -X POST $B/api/auth/signin -H 'content-type: application/json' -d '{"email":{"$ne":null},"password":{"$ne":null}}')" 400
check "paas without key -> 401"             "$(code $B/api/paas/v1/records)" 401
echo; echo "passed=$pass failed=$fail"; [ $fail -eq 0 ]
