#!/bin/bash





base_url="backend-2xiu.onrender.com"





dates=$(echo | openssl s_client -connect "${base_url}":443 -servername "${base_url}" 2>/dev/null | openssl x509 -noout -dates)



if echo "$dates" | grep -qE "notAfter"; then

    exp_line=$(echo "$dates" | grep "notAfter")
    


    date_str=$(echo "$exp_line" | sed 's/notAfter=//')

    exp_sec=$(date -d "$date_str" +%s)
    current_sec=$(date +%s)



    diff_seconds=$((exp_sec - current_sec))
    diff_days=$((diff_seconds / 86400))

    
  if [ "$diff_days" -gt 30 ]; then


        echo "Certificate safe for $diff_days more days."
    else

        echo "Warning: Certificate expiring soon ($diff_days days left)  Please renew."
    fi



    echo "Finding only notafter :: $exp_line"
fi
