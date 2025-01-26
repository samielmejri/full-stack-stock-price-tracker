const cron = require('node-cron');
const scraperService = require('./scraperService');
const Stock = require('../models/stock');

// Schedule the scraper to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled stock data update...');

  const symbols = ['AAPL', 'GOOG', 'AMZN']; // List of stock symbols to scrape

  for (const symbol of symbols) {
    try {
      const stockData = await scraperService.getStockData(symbol);
      if (stockData) {
        await Stock.findOneAndUpdate(
          { symbol },
          {
            $push: {
              history: {
                price: stockData.currentPrice,
                percentageChange: stockData.percentageChange,
              },
            },
            currentPrice: stockData.currentPrice,
            percentageChange: stockData.percentageChange,
            lastUpdated: new Date(),
          },
          { upsert: true }
        );
        console.log(`Stock data for ${symbol} updated successfully.`);
      }
    } catch (error) {
      console.error(`Failed to update stock data for ${symbol}: ${error.message}`);
    }
  }
});
