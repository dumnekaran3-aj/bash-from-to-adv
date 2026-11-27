

import subprocess

domine = input("enter a domine ::")



     scansv = subprocess.run(["nmap", "-sV", "domine"],
     capture_output=True , text=True)
     print(scansv.stdout)

