


with open("collected_ids.txt", "w") as f:
    for i in range(1, 500):
        f.write(f"{i}\n")

with open("collected_ids.txt", "r") as f:
    lines = f.readlines()
    if len(lines) == 499:
        print(f"[+] Data added successfully! Total IDs: {len(lines)}")
    else:
        print("[-] Please fix test.py")

