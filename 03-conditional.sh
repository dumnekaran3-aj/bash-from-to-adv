#!/bin/bash

num=15

if [ $num -gt 10 ]; then
  echo "$num is greter than 10"


elif [ $num -eq 10 ]; then
   echo "$num is exctly of 10"

else
    echo "$num is less than 10"

fi

if [ -f "02-varbile.sh" ]; then
  echo "02-varbile.sh file exist"

else
    echo "file not found"
fi
