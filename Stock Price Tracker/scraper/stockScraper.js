const puppeteer = require("puppeteer");

const fetchStockData = async (symbol) => {
  const url = `https://finance.yahoo.com/quote/${symbol}`;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Log the HTML content of the page for verification
    const pageContent = await page.content();
    console.log(pageContent);

    // Wait for specific elements that we need to scrape
    await page.waitForSelector("[data-symbol]");
    await page.waitForSelector(".Trsdu\\(0\\.3s\\)");

    const stockData = await page.evaluate(() => {
      const symbol = document.querySelector("[data-symbol]").getAttribute("data-symbol");
      const currentPrice = document.querySelector(".Trsdu\\(0\\.3s\\)").textContent;
      const percentageChange = document.querySelector(".Fw\\(600\\)").textContent;

      return {
        symbol,
        currentPrice: parseFloat(currentPrice.replace(",", "")),
        percentageChange,
        lastUpdated: new Date().toISOString(),
      };
    });

    await browser.close();
    return stockData;
  } catch (error) {
    console.error(`Failed to scrape stock data for symbol: ${symbol}. Error: ${error.message}`);
    return null;
  }
};

module.exports = fetchStockData;
