#!/bin/bash

source_dir="/mnt/c/Users/aryan/API-SCANNER/server"


backup_dir="$HOME/backups"
timestamp=$(date +%Y%m%d_%H%M%S)



mkdir -p "$backup_dir"

tar -czf "$backup_dir/server_backup_$timestamp.tar.gz" "$source_dir"
sha256sum "$backup_dir/server_backup_$timestamp.tar.gz" > "$backup_dir/server_backup_$timestamp.sha256"
