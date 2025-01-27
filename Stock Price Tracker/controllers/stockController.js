const Stock = require("../models/stock");
const scraperService = require("../services/scraperService");

// GET /api/stocks/search/:symbol
const getStockData = async (req, res) => {
  try {
      // Access the symbol parameter and apply toUpperCase()
      const symbol = req.params.symbol.toUpperCase();

      // Fetch the stock data from scraperService
      const stockData = await scraperService.fetchStockData(symbol);

      // Validate the scraped stock data
      if (!stockData || isNaN(stockData.currentPrice) || isNaN(stockData.percentageChange)) {
          return res.status(500).json({ error: "Failed to fetch valid stock data." });
      }

      // Check if data already exists in the database
      const existingStock = await Stock.findOne({ symbol });

      if (
          existingStock &&
          existingStock.history.some(
              (entry) =>
                  entry.price === stockData.currentPrice &&
                  entry.percentageChange === stockData.percentageChange
          )
      ) {
          return res.json({
              symbol: symbol,
              currentPrice: stockData.currentPrice,
              percentageChange: stockData.percentageChange,
              lastUpdated: existingStock.lastUpdated
          }); // Return currentPrice and percentageChange only
      }

      // Save or update stock data
      const updatedStock = await Stock.findOneAndUpdate(
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
          { upsert: true, new: true }
      );

      res.json({
          symbol: symbol,
          currentPrice: stockData.currentPrice,
          percentageChange: stockData.percentageChange,
          lastUpdated: updatedStock.lastUpdated
      });
  } catch (err) {
      console.error("Error in getStockData:", err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stocks/history/:symbol
const getHistoricalData = async (req, res) => {
  try {
      // Access the symbol parameter and apply toUpperCase()
      const symbol = req.params.symbol.toUpperCase();

      // Fetch historical data from database
      const stock = await Stock.findOne({ symbol });

      if (stock && stock.history.length) {
          return res.json(stock.history);
      }

      // If no data in DB, you could scrape historical data if necessary (not shown here)
      res.status(404).json({ error: 'No historical data found' });

  } catch (err) {
      console.error("Error in getHistoricalData:", err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getStockData, getHistoricalData };
