const puppeteer = require("puppeteer");

/**
 * Fetch current stock data for a given symbol.
 * @param {string} symbol - Stock symbol (e.g., AAPL, TSLA).
 * @returns {Object} - Stock data including current price and percentage change.
 */
exports.getStockData = async (symbol) => {
  const url = `https://finance.yahoo.com/quote/${symbol}`;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const stockData = await page.evaluate(() => {
      const priceSelector = 'fin-streamer[data-field="regularMarketPrice"]';
      const changeSelector = 'fin-streamer[data-field="regularMarketChangePercent"]';

      const priceElement = document.querySelector(priceSelector);
      const changeElement = document.querySelector(changeSelector);

      if (!priceElement || !changeElement) {
        throw new Error('Unable to locate stock data elements');
      }

      const currentPrice = parseFloat(priceElement.textContent.replace(/,/g, ''));
      const percentageChange = parseFloat(changeElement.textContent.replace('%', ''));

      return { currentPrice, percentageChange };
    });

    return {
      symbol,
      currentPrice: stockData.currentPrice,
      percentageChange: stockData.percentageChange,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Error scraping stock data for ${symbol}:`, error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};
