#!/bin/bash
#
# @author Rahul Sharma
# This script orchestrates and monitors the scraper job to counteract general 
# network instability on the Raspberry Pi. Note that it utilizes 
# the `nohup` command to allow freely connecting/disconnecting ssh sessions
#
# run `nohup monitor.sh &` to start the job
#W

NODE_VERSION=$(node --version)
OUTPUT_FILENAME="scraper.out"

start_scraper () {
    kill -9 `pgrep node`
    rm -rf $OUTPUT_FILENAME
    nohup npm start > "$OUTPUT_FILENAME" &
}

if [[ "$NODE_VERSION" != *"12"* ]]; then
    echo "$NODE_VERSION is not supported, please use Node 12"
    exit 1
fi 

start_scraper

# check every minute
while true; do 
    sleep 60;
    if [ ! -z $(awk "/ECONNRESET|ECONNFAILURE/" "$OUTPUT_FILENAME") ]; then
     start_scraper
    fi 
done
