#!/bin/bash

is_even() {
    local remainder=$(( $1 % 2 ))
    if [ $remainder -eq 0 ]; then
        echo "$1 is even"
    else
        echo "$1 is odd"
    fi
}

is_even 10
is_even 7

show_args(){

echo "total argue $#"
echo "all argue  $@"


}
show_args karan chokey sammu
