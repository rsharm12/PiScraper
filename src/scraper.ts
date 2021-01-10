import axios from "axios";
import login from "facebook-chat-api";
import dotenv from "dotenv";
import { validateBestBuy, validateWalmart, validateAmazon, validateGameStop } from "./validators";
import setRandomInterval from "set-random-interval";

// setup dotenv first
dotenv.config();

type Company = "Amazon" | "Walmart" | "BestBuy" | "GameStop" | "AmazonDigital";

const Companies: Record<
  Company,
  { url: string; validator: (_: string) => boolean; withUserAgent?: boolean }
> = {
  Amazon: {
    url: "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG/",
    validator: validateAmazon,
  },
  AmazonDigital: {
    url: "https://www.amazon.com/PlayStation-5-Digital/dp/B08FC6MR62/",
    validator: validateAmazon,
  },
  BestBuy: {
    url: "https://www.bestbuy.com/site/playstation-5/ps5-consoles/pcmcat1587395025973.c",
    validator: validateBestBuy,
    withUserAgent: false,
  },
  GameStop: {
    url: "https://www.gamestop.com/video-games/playstation-5/consoles",
    validator: validateGameStop,
  },
  Walmart: {
    url: "https://www.walmart.com/ip/PlayStation5-Console/363472942",
    validator: validateWalmart,
  },
};

function sendMessage(message: string) {
  login({ email: process.env.FB_USER, password: process.env.FB_PASS }, (err, api) => {
    if (err) return console.error(err);

    api.sendMessage(message, process.env.FB_THREAD_ID);
  });
}

function sendSuccessMessage(company: Company) {
  const currentDate = new Date();
  const message = `🟢 PS5 Available at ${company} on ${currentDate.toLocaleString()} ${
    Companies[company].url
  }`;
  console.log(message);
  sendMessage(message);
}

async function loadWebsite(url: string, withUserAgent: boolean) {
  try {
    const headers = withUserAgent
      ? {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        }
      : undefined;
    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`${error} for ${url} - returning false...`);
    return false;
  }
}

async function scrape(url: string, cb: (html: string) => boolean, withUserAgent = true) {
  const html = await loadWebsite(url, withUserAgent);
  return html ? cb(html) : false;
}

async function runScraper() {
  let isFound = false;

  await Promise.all(
    Object.entries(Companies).map(async ([company, { url, validator, withUserAgent }]) => {
      const isAvailable = await scrape(url, validator, withUserAgent);
      if (isAvailable) {
        isFound = true;
        sendSuccessMessage(company as Company);
      }
    })
  );

  const returnMessage = isFound ? "PS5 Found!" : "No PS5 Found ):";
  console.log(returnMessage);
}

function initialize(isResuming: boolean) {
  let count = 0;
  const interval = 62 * 1000;
  const offset = 2000;

  const currentDate = new Date();
  const message = isResuming
    ? `Polling ended ): Restarting script execution at ${currentDate.toLocaleString()}...`
    : `Hello, I'm a robot, and I'll help you find a PS5 from one of ${Object.keys(Companies).join(
        ", "
      )}. My current polling interval is 1 minute. Beginning script execution at ${currentDate.toLocaleString()}...`;

  console.log(message);

  setRandomInterval(
    () => {
      console.log(`Running scraper at ${new Date()}, iteration ${count++}`);
      runScraper();
    },
    interval - offset,
    interval + offset
  );
}

initialize(true);
