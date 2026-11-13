#!/bin/bash


read -p "enter tagert :-" target

trace=$(ping $"target")

ping -c 1 "$target" | grep -oP '(?<=PING )[^ ]+ \([0-9.]+\)'



