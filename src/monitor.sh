#!/bin/bash
#
# @author Rahul Sharma
# This script orchestrates and monitors the scraper job to counteract general 
# network instability on the Raspberry Pi. Note that it utilizes 
# the `nohup` command to allow freely connecting/disconnecting ssh sessions
#
# run `nohup monitor.sh &` to start the job
#

NODE_VERSION=$(node --version)
OUTPUT_FILENAME="scraper.out"

start_scraper () {
    NODE_PROCESS_ID=$(pgrep node)
    kill -9 $NODE_PROCESS_ID
    echo "$NODE_PROCESS_ID killed successfully"
    rm -rf $OUTPUT_FILENAME
    echo "$OUTPUT_FILENAME deleted successfully"
    nohup npm start > "$OUTPUT_FILENAME" 2>&1 &
    echo "Scraper started!"
}

if [[ "$NODE_VERSION" != *"12"* ]]; then
    echo "$NODE_VERSION is not supported, please use Node 12"
    exit 1
fi 

start_scraper

# check every minute
while true; do 
    sleep 60;
    if grep -q "ECONNRESET\|ERR! login/" "$OUTPUT_FILENAME"; then
     echo "Connection issue detected! Restarting..."
     start_scraper
    fi 
done
