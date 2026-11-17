
import os
import requests
import jwt

url = "http://127.0.0.1:8000/api/auth/signin"
secret = os.getenv("JWT_SECRET")

res = requests.post(
    url,
    json={
        "email": "user1@test.com",
        "password": "user1@123"
    },
    timeout=10
)

res.raise_for_status()

token = res.json().get("token")

if not token:
    raise ValueError("JWT token not received")

try:
    payload = jwt.decode(
        token,
        secret,
        algorithms=["HS256"]
    )

    print("Signature valid")
    print(payload)

except jwt.InvalidSignatureError:
    print("Invalid JWT signature")

except jwt.InvalidTokenError as e:
    print(f"Invalid token: {e}")
