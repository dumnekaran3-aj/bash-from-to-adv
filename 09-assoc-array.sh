#!/bin/bash

declare -A services
services[21]="FTP"
services[22]="SSH"
services[80]="HTTP"
services[443]="HTTPS"
services[3306]="MySQL"
services[8080]="HTTP-Alt"


for port in "${!services[@]}"; do
    echo "Port $port -> ${services[$port]}"
done
