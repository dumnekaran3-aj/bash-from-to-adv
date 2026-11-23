import subprocess
import json

result = subprocess.run(
    ["termux-wifi-connectioninfo"],
    capture_output=True,
    text=True
)

if result.returncode == 0:
    data = json.loads(result.stdout)
    print(data)
else:
    print(result.stderr)
