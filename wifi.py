from scapy.all import IP, TCP

ip = IP()
tcp = TCP()

print("Scapy working!")
print(ip.show())
print(tcp.show())
