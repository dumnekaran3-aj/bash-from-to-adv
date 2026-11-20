import whois


dom = input("enter a domine :: ")


res = whois.whois(dom)
print(res)

print("----------------")

print(res.creation_date)
print(res.expiration_date)

print(res.registar)

