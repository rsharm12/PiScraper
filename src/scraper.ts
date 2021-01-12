import axios from "axios";
import login from "facebook-chat-api";
import dotenv from "dotenv";
import {
  validateBestBuy,
  validateWalmart,
  validateAmazon,
  validateGameStop,
  validateTarget,
} from "./validators";
import setRandomInterval from "set-random-interval";

// setup dotenv first
dotenv.config();

type Company = "Amazon" | "Walmart" | "BestBuy" | "GameStop" | "AmazonDigital";

// validators should return `true` if stock is available
const Companies: Record<
  Company,
  { url: string; validator: (_: any) => boolean; withUserAgent?: boolean }
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

const TARGET_DATA_URL =
  "https://redsky.target.com/redsky_aggregations/v1/web/pdp_fulfillment_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin={TCIN}&store_id={ID}&store_positions_store_id={ID}&has_store_positions_store_id=true&scheduled_delivery_store_id={ID}&pricing_store_id={ID}&fulfillment_test_mode=grocery_opu_team_member_test";

const TARGET_LOCATION_IDS = ["840", "1284", "1903", "867", "339"];

const TargetConfigurations = {
  Console: {
    url: "https://www.target.com/p/playstation-5-console/-/A-81114595",
    tcin: "81114595",
  },
  Digital: {
    url: "https://www.target.com/p/playstation-5-digital-edition-console/-/A-81114596",
    tcin: "81114596",
  },
};

function sendMessage(message: string, toAdmin?: boolean) {
  console.log(message);
  login({ email: process.env.FB_USER, password: process.env.FB_PASS }, (err, api) => {
    if (err) return console.error(err);

    api.sendMessage(message, toAdmin ? process.env.FB_ADMIN_THREAD_ID : process.env.FB_THREAD_ID);
  });
}

function sendSuccessMessage(company: Company) {
  const currentDate = new Date();
  const message = `🟢 PS5 Available at ${company} on ${currentDate.toLocaleString()} ${
    Companies[company].url
  }`;
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
    console.log(`${error} for ${url} - returning false...`);
    return false;
  }
}

async function scrape(url: string, cb: (html: any) => boolean, withUserAgent = true) {
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

  Object.entries(TargetConfigurations).forEach(async ([version, { url, tcin }]) => {
    const isFoundArray = await Promise.all(
      TARGET_LOCATION_IDS.map(async (id) => ({
        location: id,
        isFound: await scrape(
          TARGET_DATA_URL.replace("{TCIN}", tcin).replace(/{ID}/g, id),
          validateTarget
        ),
      }))
    );

    isFoundArray
      .filter((p) => p.isFound)
      .forEach((p) => {
        isFound = true;
        const currentDate = new Date();
        const message = `🟢 ${version} PS5 Available at location ${
          p.location
        } Target on ${currentDate.toLocaleString()} ${url}`;
        sendMessage(message);
      });
  });

  const returnMessage = isFound ? "PS5 Found!" : "No PS5 Found ):";
  console.log(returnMessage);
}

const SCRAPE_INTERVAL = 62 * 1000; // 62s for additional randomness;
const HEARTBEAT_INTERVAL = 60 * 60 * 1000;

function heartbeat() {
  const currentDate = new Date();
  sendMessage(`Heartbeat - ${currentDate.toLocaleString()}`, true);
}

function initialize() {
  let count = 0;
  const offset = 2000;

  heartbeat();
  setInterval(() => {
    heartbeat();
  }, HEARTBEAT_INTERVAL);

  setRandomInterval(
    () => {
      console.log(`Running scraper at ${new Date()}, iteration ${count++}`);
      runScraper();
    },
    SCRAPE_INTERVAL - offset,
    SCRAPE_INTERVAL + offset
  );
}

process.argv[2] === "debug" ? runScraper() : initialize();
