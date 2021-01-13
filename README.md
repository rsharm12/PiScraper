# PiScraper

Scrape retail websites to determine availability of high-demand items e.g. PS5 using a Raspberry Pi. User is notified via Facebook Messenger through the `facebook-chat-api` (https://github.com/Schmavery/facebook-chat-api)

Included is a script that utilizes `nohup` in order to kick off the scraper job and allows freely SSHing into/out of the Pi.

## Prequisites
1. NodeJS v12
2. Bash shell
3. Raspberry Pi or similar

Note: this tool can functionally work on any machine outside of Raspberry Pi prerequisites.

## Usage
1. create a `.env` file with the following structure
```
FB_USER=<FB Messenger Username>
FB_PASS=<FB Messenger Password>
FB_THREAD_ID=<messenger thread ID to send notifications>
FB_ADMIN_THREAD_ID=<admin thread ID to send heartbeat>
```

2. `npm install`
3. Following options are available
    - `npm start`
    - `npm run debug` (to debug)
    - `nohup src/monitor.sh &` (to kick off monitoring job)


