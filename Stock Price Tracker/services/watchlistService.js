const { scrapeAndSaveStockData } = require("./scraperService");
const Watchlist = require("../models/watchlist");

/**
 * Function to add a stock symbol to the watchlist.
 * @param {string} symbol - The stock symbol (e.g., "AAPL").
 * @returns {Object} - The saved watchlist entry.
 */
const addToWatchlist = async (symbol) => {
  try {
    const existingEntry = await Watchlist.findOne({ symbol });

    if (existingEntry) {
      console.log(`${symbol} already exists in the watchlist.`);
      return existingEntry;
    }

    const watchlistEntry = new Watchlist({ symbol });
    const savedEntry = await watchlistEntry.save();
    console.log(`${symbol} added to the watchlist.`);
    return savedEntry;
  } catch (error) {
    console.error(`Error adding ${symbol} to the watchlist:`, error.message);
    throw error;
  }
};

/**
 * Function to remove a stock symbol from the watchlist.
 * @param {string} symbol - The stock symbol (e.g., "AAPL").
 * @returns {Object|null} - The removed watchlist entry.
 */
const removeFromWatchlist = async (symbol) => {
  try {
    const deletedEntry = await Watchlist.findOneAndDelete({ symbol });

    if (!deletedEntry) {
      console.log(`${symbol} not found in the watchlist.`);
      return null;
    }

    console.log(`${symbol} removed from the watchlist.`);
    return deletedEntry;
  } catch (error) {
    console.error(`Error removing ${symbol} from the watchlist:`, error.message);
    throw error;
  }
};

/**
 * Function to scrape and update historical data for all stocks in the watchlist.
 */
const updateWatchlistHistoricalData = async () => {
  try {
    const watchlist = await Watchlist.find();

    if (!watchlist || watchlist.length === 0) {
      console.log("No stocks in the watchlist.");
      return;
    }

    for (const entry of watchlist) {
      console.log(`Updating historical data for ${entry.symbol}...`);
      await scrapeAndSaveStockData(entry.symbol);
    }

    console.log("Watchlist historical data update completed.");
  } catch (error) {
    console.error("Error updating watchlist historical data:", error.message);
    throw error;
  }
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistHistoricalData,
};
