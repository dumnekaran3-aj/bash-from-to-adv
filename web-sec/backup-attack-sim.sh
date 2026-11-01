#!/bin/bash

target_dir="$HOME/backups"

ls -la "$target_dir"


for F in "$TARGET_DIR"/*; do

    rm -f "$F"

if [ $? -eq 0 ]; then


echo "ditroy file : $F"
distro=$((distro+1))


else

echo "protected file $F"

prot=$((prot+1))


fi

done

echo "attack simulation complet $distro |0 destroyed, $prot protected"
highlight=$(grep -i -qE "removerd | remove | delete")

echo "$highlight"
