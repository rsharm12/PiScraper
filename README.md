# PiScraper

Scrape retail websites to determine availability of high-demand items e.g. PS5 using a Raspberry Pi. User is notified via Discord through the `discord.js` API (https://github.com/discordjs)

Included is a script that utilizes `nohup` in order to kick off the scraper job and allows freely SSHing into/out of the Pi.

## Prequisites
1. NodeJS v12
2. Bash shell
3. Raspberry Pi or similar


## Usage
1. create a `.env` file with the following structure
```
DISCORD_TOKEN=<discord token>
DISCORD_ADMIN_CHANNEL=<channel ID for admins>
DISCORD_USER_CHANNEL=<channel ID to send notifications>
```

2. `npm install`
3. Following options are available
    - `npm start`
    - `npm run debug` (to debug)
    - `nohup src/monitor.sh &` (to kick off monitoring job)

## FAQ

1. Where can I find the Messenger thread ID?

    Navigate to `discord.com` and click on the thread that you would like the scraper to send messages to. The URL will be of the form `https://www.discord.com/channels/1234/4567`. The thread ID is the third path param in the URL, so in the above case - `4567`
       
2. Does this tool only work on the Raspberry Pi?

    No, it can run on any machine with NodeJS installed. However, the included script `monitor.sh` should only be used on a Unix-based system or a Raspberry Pi.
