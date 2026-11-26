

read -p "enter a  domine name :: " basedomine


get_whois_profile() {
    local domain="$1"



    # Step 1: whois ek hi baar call karo, store karo

    whois_output=$(whois "$domain")


    # Step 2: usi variable se Domain Name: lines ke numbers nikalo
    mapfile -t linenums < <(echo "$whois_output" | grep -n "Domain Name:" | cut -d: -f1)


    echo "len : ${#linenums[@]}"


    if [ ${#linenums[@]} -eq 2 ]; then
        split_point=${linenums[1]}
        echo "Split point: line $split_point"

        registry_block=$(echo "$whois_output" | awk -v boundary="$split_point" 'NR < boundary')
        registrar_block=$(echo "$whois_output" | awk -v boundary="$split_point" 'NR >= boundary')

        echo "=== REGISTRY BLOCK ==="
        echo "$registry_block"
 
       echo "=== REGISTRAR BLOCK ==="
        echo "$registrar_block"

    elif [ ${#linenums[@]} -eq 1 ]; then
        echo "Only one block found (no referral)"


    else
        echo "Lookup failed — no Domain Name match"
    fi
}

get_whois_profile "$basedomine"
