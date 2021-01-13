import cheerio from "cheerio";
import { ITargetData } from "./interfaces";

export function validateBestBuy(html: string) {
  const $ = cheerio.load(html);
  const allButtons = $("button.add-to-cart-button").toArray();
  return allButtons.some((item) => !Object.keys(item.attribs).includes("disabled"));
}

export function validateWalmart(html: string) {
  const $ = cheerio.load(html);
  const isAvailable = !!$("h1.prod-ProductTitle");
  return isAvailable;
}

export function validateAmazon(html: string) {
  const $ = cheerio.load(html);
  const isBuyButtonEnabled = !!$("#add-to-cart-button").val();
  const isInStockTextVisible = $("#availability").children("span").text().includes("In Stock");
  return isBuyButtonEnabled || isInStockTextVisible;
}

export function validateGameStop(html: string) {
  const $ = cheerio.load(html);
  const allButtons = $("button.add-to-cart").toArray();
  return allButtons.some((item) => !Object.keys(item.attribs).includes("disabled"));
}

export function validateTarget(targetResponse: ITargetData) {
  const fulfillment = targetResponse.data.product.fulfillment;
  if (!fulfillment || fulfillment.is_out_of_stock_in_all_store_locations) {
    return false;
  }

  const availabilityOptions = [
    fulfillment.scheduled_delivery,
    fulfillment.shipping_options,
    fulfillment.store_options[0].ship_to_store,
    fulfillment.store_options[0].order_pickup,
    fulfillment.store_options[0].in_store_only,
  ];

  return availabilityOptions
    .map((a) => a.availability_status)
    .some((status) => {
      const isFound = status !== "UNAVAILABLE" && status !== "OUT_OF_STOCK";
      isFound && console.log("Target PS5 reported found with status - " + status);
      return isFound;
    });
}
