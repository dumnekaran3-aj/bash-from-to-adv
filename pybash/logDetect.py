import re

with open("access.log", "w") as f:
    
    with open("access.log", "a") as f:
        f.write("\n2026-10-29T11:08:00Z - GET /api/user/1' UNION SELECT 1,2-- - IP: 192.168.1.5")
    
with open("access.log", "r") as f:
    for line in f:
        match = re.search(r"UNION|SELECT|OR\s*=|--|#", line, re.IGNORECASE)
        
        if match:
            print(f"Suspicious: {line.strip()}")
