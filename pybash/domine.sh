


read -p "enter a domine :: " basedomine

get_whois_profile() {
    local domain="$1"
    whois "$domain" | grep -iE "Creation Date:|Registrar:|Name Server:|DNSSEC:"
}


get_whois_profile "$basedomine"
