import cheerio from "cheerio";

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
