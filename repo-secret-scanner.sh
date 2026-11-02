#!/bin/bash




read -p "enter a repo url :: " repo

read -p "eneter a file path /tmp/ex :: " path


git clone "$repo" /tmp/"$path"

cd /tmp/target


if grep -rniE "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][a-zA-Z0-9_\-]{10,}['\"]" --exclude-dir=node_modules .; then

    echo "Secrets found!"



else

    echo "No secrets found"

fi



