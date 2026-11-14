import os 
import re
import requests
import subprocess


url = input("inter a url :: ")


res = requests.get(url)

status = res.status_code

info = res.text

sock = socket.socket(soket.AF_INET , socket.STREAM)
with open("data.txt", "w") as f:

if status == 200:

   print(f"res is done")
    sock.connect_ex(url)

    f.write(status , info)
  
elif status == 500:

     print("server is crashed..")
     f.write(status , info)

else status == 404:

     print("site not found..")
     f.write(status , info)




