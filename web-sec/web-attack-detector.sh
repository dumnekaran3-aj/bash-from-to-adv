
#!/bin/bash




LOG_FILE="/mnt/c/Users/aryan/API-SCANNER/server/access.log"  
ALERT_LOG="suspicious.log"


att_detecter(){

local log=$1
declare -A suspicious_count


PATTERN="UNION|SELECT|OR.*=|--|#|<script>"




grep -Ei "$PATTERN" "$LOG_FILE" | while read -r line; do

echo "matching pattern :: "
  
 
ip=$(echo "$line" | awk '{for(i=1;i<=NF;i++) if($i=="IP:") print $(i+1)}')
 
        if [ -n "$ip" ]; then
            suspicious_count["$ip"]=$(( ${suspicious_count["$ip"]:-0} + 1 ))

echo "$(date): $line" >> "$ALERT_LOG"

if [ "${suspicious_count[$ip]}" -ge 3 ]; then

  echo "suspensicus ip detect  $ip sent ${suspicious_count[$ip]} HIGH priorityy"

else

    echo "LOW priroity Ip detect ::  $ip sent ${suspicious_count[$ip]}"

fi

    fi
  done

}

att_detecter "$LOG_FILE"
