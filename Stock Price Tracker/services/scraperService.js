// services/scraperService.js

const puppeteer = require('puppeteer');

const fetchStockData = async (symbol) => {
  const url = `https://finance.yahoo.com/quote/${symbol}`;

  try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Scraping the stock price and percentage change using correct selectors
      const stockData = await page.evaluate(() => {
          // Selector for the stock price
          const priceSelector = 'span[data-testid="qsp-price"]';

          // Selector for the percentage change (updated based on your HTML)
          const changeSelector = 'span[data-testid="qsp-price-change-percent"]';

          const priceElement = document.querySelector(priceSelector);
          const changeElement = document.querySelector(changeSelector);

          if (!priceElement || !changeElement) {
            console.log("Could not find price or change element!");
            return null;
          }

          // Extract the current price (removing any currency symbols and formatting)
          const currentPrice = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ''));

          // Extract the percentage change (removing % sign and formatting)
          const percentageChangeText = changeElement.textContent.replace(/[^0-9.-]+/g, ''); // removing any non-numeric characters
          const percentageChange = parseFloat(percentageChangeText);

          return { currentPrice, percentageChange };
      });

      await browser.close();
      return stockData || null;
  } catch (error) {
      console.error("Error scraping stock data:", error);
      return null;
  }
};

// Export the function so it can be used in other files
module.exports = { fetchStockData };
