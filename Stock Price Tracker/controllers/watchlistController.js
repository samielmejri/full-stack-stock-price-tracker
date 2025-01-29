const Watchlist = require("../models/watchlist");
const History = require("../models/History");
const scraperService = require("../services/scraperService");
const { scrapeAndSaveStockData } = require("../services/scraperService");

/**
 * Add a stock to the user's watchlist
 */
const addStockToWatchlist = async (req, res) => {
  const { userId, symbol } = req.body;

  if (!userId || !symbol) {
    return res.status(400).json({ error: "User ID and stock symbol are required" });
  }

  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId },
      { $addToSet: { stocks: symbol.toUpperCase() } }, // Prevent duplicates
      { upsert: true, new: true }
    );
    res.json({ message: `${symbol.toUpperCase()} added to watchlist`, watchlist });
  } catch (error) {
    console.error("Error adding stock to watchlist:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Remove a stock from the user's watchlist
 */
const removeStockFromWatchlist = async (req, res) => {
  const { userId, symbol } = req.body;

  if (!userId || !symbol) {
    return res.status(400).json({ error: "User ID and stock symbol are required" });
  }

  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId },
      { $pull: { stocks: symbol.toUpperCase() } },
      { new: true }
    );

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    res.json({ message: `${symbol.toUpperCase()} removed from watchlist`, watchlist });
  } catch (error) {
    console.error("Error removing stock from watchlist:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieve user's watchlist along with stock data
 */
const getWatchlist = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    const stockData = await Promise.all(
      watchlist.stocks.map(async (symbol) => {
        try {
          // Fetch latest stock data
          const currentData = await scraperService.fetchStockData(symbol);

          // Ensure historical data is updated before retrieving it
          await scrapeAndSaveStockData(symbol);

          // Retrieve the last 7 days of stock history from the History model
          const today = new Date();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);

          const historicalRecord = await History.findOne({ symbol });

          let last7DaysHistory = historicalRecord?.prices?.filter((entry) => {
            const entryDate = new Date(entry.date);
            return entryDate >= sevenDaysAgo && entryDate <= today;
          }) || [];

          // Sort history data (earliest to latest)
          last7DaysHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

          return {
            symbol,
            currentPrice: currentData?.currentPrice || null,
            percentageChange: currentData?.percentageChange || null,
            history: last7DaysHistory,
          };
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error.message);
          return { symbol, error: "Failed to retrieve data" };
        }
      })
    );

    res.json({ userId, stocks: stockData });
  } catch (error) {
    console.error("Error retrieving watchlist:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addStockToWatchlist, removeStockFromWatchlist, getWatchlist };
