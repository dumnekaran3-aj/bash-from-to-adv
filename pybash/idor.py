

import requests

target = input("enter a target url (without end) : ").strip().rstrip("/")

with open("collected_ids.txt", "r") as f:
    for line in f:
        ids = line.strip()
     
        if not ids:
            continue
  


        try:
            res = requests.get(f"{target}/api/user/{ids}", timeout=5)
            status = res.status_code



            if status == 200:
                print(f"target id {ids} idor possible..")


            else:
                print(f" id {ids} idor not possible (Status: {status})")



        except requests.exceptions.RequestException as e:

            print(f" Request error for ID {ids}: {e}")

