#!/usr/bin/env bash
destdir="$HOME/yellowmobile/cdr/dst"

# get last 50 file names and save in array fileName
mapfile -t fileName < <(echo "ls -1tr" | sftp myid@removeserver | tail -10)

# get files from array fileName and save in $destdir
for f in "${fileName[@]}"; do echo "get \"$f\" \"$destdir\""; done | sftp myid@removeserver