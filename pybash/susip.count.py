



import re



with open("access.log", "w") as f:

    f.write("2026-10-29T11:07:44Z - GET /api/health - IP: 127.0.0.1\n")

    f.write("2026-10-29T11:08:00Z - GET /api/user/1' UNION SELECT 1,2-- - IP: 192.168.1.5\n")


counts = {}


with open("access.log", "r") as f:
    for line in f:
        match = re.search(r"UNION|SELECT|OR\s*=|--|#", line, re.IGNORECASE)

        if match:
            words = line.split()



            for i in range(len(words)):


                if words[i] == "IP:":
                    ip = words[i+1]


            counts[ip] = counts.get(ip, 0) + 1



for ip, count in counts.items():
    if count >= 3:

        print(f"HIGH priority: {ip} - {count} attempts")



    else:
        print(f"LOW priority: {ip} - {count} attempts")
