const puppeteer = require("puppeteer");
const { scrapeHistoricalData } = require("./scraperHistorical"); // Import scrapeHistoricalData
const History = require("../models/History");

/**
 * Function to fetch stock data using Puppeteer.
 * @param {string} symbol - The stock symbol (e.g., "AAPL").
 * @returns {Object|null} - The current stock price and percentage change.
 */
const fetchStockData = async (symbol) => {
  const url = `https://finance.yahoo.com/quote/${symbol}`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const stockData = await page.evaluate(() => {
      const priceSelector = 'span[data-testid="qsp-price"]';
      const changeSelector = 'span[data-testid="qsp-price-change-percent"]';

      const priceElement = document.querySelector(priceSelector);
      const changeElement = document.querySelector(changeSelector);

      if (!priceElement || !changeElement) {
        console.log("Could not find price or change element!");
        return null;
      }

      const currentPrice = parseFloat(
        priceElement.textContent.replace(/[^0-9.-]+/g, "")
      );
      const percentageChangeText = changeElement.textContent.replace(
        /[^0-9.-]+/g,
        ""
      );
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

/**
 * Function to scrape and save historical stock data.
 * @param {string} symbol - The stock symbol (e.g., "AAPL").
 */

const scrapeAndSaveStockData = async (symbol) => {
  console.log(`Scraping historical data for ${symbol}...`);

  try {
    let historicalData = await scrapeHistoricalData(symbol);

    if (historicalData.length > 0) {
      console.log(`Successfully scraped ${historicalData.length} records for ${symbol}.`);

      // ✅ Get the last 7 actual days (excluding older data)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 8); // 7 days before today

      historicalData = historicalData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo && entryDate <= today;
      });

      // Sort ascending (earliest date first)
      historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

      await History.findOneAndUpdate(
        { symbol },
        { $set: { prices: historicalData } },
        { upsert: true, new: true }
      );
    } else {
      console.error(`No data found for ${symbol}.`);
    }
  } catch (error) {
    console.error(`Error scraping and saving historical data for ${symbol}:`, error.message);
  }
};




module.exports = { fetchStockData, scrapeAndSaveStockData };
