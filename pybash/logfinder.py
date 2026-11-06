
import re

import os

with open("access.log", "r") as f:
    
    isexsits =  os.path.exist("access.log")

     if isexsits:

        for line in f:

           match = re.search(r"UNION|SELECT|OR\s*=|--|#", line , re.IGNORECASE)


           if match :
               print("find susp {line.strip()}")

      else:

          print("file desent exist ..")




