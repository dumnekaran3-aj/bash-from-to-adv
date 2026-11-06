import socket 



hostname = input("enter a hostname :: ")

limit = int(input("inter a port limit : "))


for l in range(1,limit):

    sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    sock.settimeout(1)

    res = sock.connect_ex((hostname, l))

    if res == 0:

       print("open PORT",l)


    else:

        print("port closed " , l)

sock.close()
