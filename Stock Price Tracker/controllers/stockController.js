const Stock = require('../models/stock');
const scraperService = require('../services/scraperService');

// GET /api/stocks/search/:symbol
const getStockData = async (req, res) => {
  try {
    const { symbol } = req.params;

    // Fetch the stock data from the scraper
    const stockData = await scraperService.getStockData(symbol);

    if (!stockData) {
      return res.status(404).json({ error: `Stock symbol '${symbol}' not found.` });
    }

    // Save or update the stock data in the database
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

    res.json(updatedStock);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stocks/history/:symbol
const getHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;

    const stock = await Stock.findOne({ symbol }, { history: 1, _id: 0 });

    if (!stock || !stock.history.length) {
      return res.status(404).json({ error: `Historical data for '${symbol}' not found.` });
    }

    res.json(stock.history);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getStockData, getHistoricalData };
