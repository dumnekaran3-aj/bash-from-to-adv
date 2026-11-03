
import os

isexist = os.path.exists("target.txt")

if isexist:
    print("file exist!")

    with open("target.txt", "a") as f:
        f.write("192.0.11.0\n")


    with open("target.txt", "r") as f:
        content = f.read()



    print(f"data:: {content}")

else:
    print("file not exists!")

