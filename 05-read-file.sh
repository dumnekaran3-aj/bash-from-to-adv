#!/bin/bash

while read -r line; do
echo "processing ip  :: $line"

done < hosts.txt
