


read -p "enter a domine :: " basedomine

get_whois_profile() {
    local domain="$1"
   whois "$domain" | grep -n "Domain Name:" | cut -d: -f1
}


get_whois_profile "$basedomine"
