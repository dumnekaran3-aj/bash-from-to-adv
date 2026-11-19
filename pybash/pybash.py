


import subprocess

result = result = subprocess.run(["nmap", "-p", "1-100", "127.0.0.1"], capture_output=True, text=True)

print(result.stdout)
