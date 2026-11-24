

import shodan

import subprocess

api = shodan.Shodan("U6tgBtRh2WGcGCT73nQOvdBXNzypmuBU")



ip = subprocess.run(["curl", "ifconfig.me"], capture_output=True, text=True).stdout.strip()



result  = api.host(ip)

print(result['ports'], result['org'], result['data'])




