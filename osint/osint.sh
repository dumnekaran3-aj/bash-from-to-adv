

read -p "enter domine :: " dom

read -p "enter a target port :: " port

scansv=$(nmap -sV "port" "$dom")

echo "$scansv"
