// here are my endpoints : 
// Endpoints:
// * /stocks/search: Accept a stock symbol and return current stock data
// (scraped from Yahoo Finance).
// * /stocks/history: Return historical price data for a stock.
// * /stocks/watchlist: Add/remove stocks to/from the user’s watchlist and
// retrieve watchlist data.

// when i tried this api endpoint "http://localhost:5000/api/watchlist/user123" , i got this response :  
// {
//     "userId": "user123",
//     "stocks": [
//         {
//             "symbol": "AAPL",
//             "currentPrice": 238.26,
//             "percentageChange": 3.65,
//             "history": [
//                 {
//                     "_id": "679a3b55512fff78e157517e",
//                     "price": 126.69,
//                     "percentageChange": -11.17
//                 },
//                 {
//                     "_id": "679a3b55512fff78e157517f",
//                     "price": 126.65,
//                     "percentageChange": -11.2
//                 },
//                 {
//                     "_id": "679a3b55512fff78e1575180",
//                     "price": 126.64,
//                     "percentageChange": -11.2
//                 },
// .......

// which displays wrong price values for the history part and also it showed more than the last 7 days (it should display only the last 7 days) and i already implemented the scraping of historical stock prices and their dates of the last 7 days correctly in these files : 
// controllers / stockController.js : 
// const Stock = require("../models/stock");
// const scraperService = require("../services/scraperService");

// // GET /api/stocks/search/:symbol
// const getStockData = async (req, res) => {
//   try {
//       // Access the symbol parameter and apply toUpperCase()
//       const symbol = req.params.symbol.toUpperCase();

//       // Fetch the stock data from scraperService
//       const stockData = await scraperService.fetchStockData(symbol);

//       // Validate the scraped stock data
//       if (!stockData || isNaN(stockData.currentPrice) || isNaN(stockData.percentageChange)) {
//           return res.status(500).json({ error: "Failed to fetch valid stock data." });
//       }

//       // Check if data already exists in the database
//       const existingStock = await Stock.findOne({ symbol });

//       if (
//           existingStock &&
//           existingStock.history.some(
//               (entry) =>
//                   entry.price === stockData.currentPrice &&
//                   entry.percentageChange === stockData.percentageChange
//           )
//       ) {
//           return res.json({
//               symbol: symbol,
//               currentPrice: stockData.currentPrice,
//               percentageChange: stockData.percentageChange,
//               lastUpdated: existingStock.lastUpdated
//           }); // Return currentPrice and percentageChange only
//       }

//       // Save or update stock data
//       const updatedStock = await Stock.findOneAndUpdate(
//           { symbol },
//           {
//               $push: {
//                   history: {
//                       price: stockData.currentPrice,
//                       percentageChange: stockData.percentageChange,
//                   },
//               },
//               currentPrice: stockData.currentPrice,
//               percentageChange: stockData.percentageChange,
//               lastUpdated: new Date(),
//           },
//           { upsert: true, new: true }
//       );

//       res.json({
//           symbol: symbol,
//           currentPrice: stockData.currentPrice,
//           percentageChange: stockData.percentageChange,
//           lastUpdated: updatedStock.lastUpdated
//       });
//   } catch (err) {
//       console.error("Error in getStockData:", err.message);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // GET /api/stocks/history/:symbol
// const getHistoricalData = async (req, res) => {
//   try {
//     const symbol = req.params.symbol.toUpperCase();
//     const history = await History.findOne({ symbol });

//     if (history && history.prices.length) {
//       // ✅ Filter data for the last 7 days
//       const sevenDaysAgo = new Date();
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//       const filteredHistory = history.prices.filter(stock => new Date(stock.date) >= sevenDaysAgo);
      
//       if (filteredHistory.length === 0) {
//         return res.status(404).json({ error: 'No historical data found for the last 7 days.' });
//       }

//       return res.json(filteredHistory);
//     }

//     res.status(404).json({ error: 'No historical data found' });
//   } catch (err) {
//     console.error("Error in getHistoricalData:", err.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



// module.exports = { getStockData, getHistoricalData };

// and controllers / watchlistController.js : 
// const Watchlist = require("../models/watchlist");
// const Stock = require("../models/stock");
// const scraperService = require("../services/scraperService");
// const { scrapeAndSaveStockData } = require("../services/scraperService");

// /**
//  * Add a stock to the user's watchlist
//  */
// const addStockToWatchlist = async (req, res) => {
//   const { userId, symbol } = req.body;

//   if (!userId || !symbol) {
//     return res.status(400).json({ error: "User ID and stock symbol are required" });
//   }

//   try {
//     const watchlist = await Watchlist.findOneAndUpdate(
//       { userId },
//       { $addToSet: { stocks: symbol.toUpperCase() } }, // Prevent duplicates
//       { upsert: true, new: true }
//     );
//     res.json({ message: `${symbol.toUpperCase()} added to watchlist`, watchlist });
//   } catch (error) {
//     console.error("Error adding stock to watchlist:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// /**
//  * Remove a stock from the user's watchlist
//  */
// const removeStockFromWatchlist = async (req, res) => {
//   const { userId, symbol } = req.body;

//   if (!userId || !symbol) {
//     return res.status(400).json({ error: "User ID and stock symbol are required" });
//   }

//   try {
//     const watchlist = await Watchlist.findOneAndUpdate(
//       { userId },
//       { $pull: { stocks: symbol.toUpperCase() } },
//       { new: true }
//     );

//     if (!watchlist) {
//       return res.status(404).json({ error: "Watchlist not found" });
//     }

//     res.json({ message: `${symbol.toUpperCase()} removed from watchlist`, watchlist });
//   } catch (error) {
//     console.error("Error removing stock from watchlist:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// /**
//  * Retrieve user's watchlist along with stock data
//  */
// const getWatchlist = async (req, res) => {
//   const { userId } = req.params;

//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }

//   try {
//     const watchlist = await Watchlist.findOne({ userId });

//     if (!watchlist) {
//       return res.status(404).json({ error: "Watchlist not found" });
//     }

//     const stockData = await Promise.all(
//       watchlist.stocks.map(async (symbol) => {
//         // Scrape latest stock data
//         const currentData = await scraperService.fetchStockData(symbol);

//         // Scrape and update historical data in the database
//         await scrapeAndSaveStockData(symbol);
//         const historicalData = await Stock.findOne({ symbol });

//         return {
//           symbol,
//           currentPrice: currentData?.currentPrice || null,
//           percentageChange: currentData?.percentageChange || null,
//           history: historicalData?.history || [],
//         };
//       })
//     );

//     res.json({ userId, stocks: stockData });
//   } catch (error) {
//     console.error("Error retrieving watchlist:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// module.exports = { addStockToWatchlist, removeStockFromWatchlist, getWatchlist };

// and models / History.js 
// const mongoose = require('mongoose');

// const HistorySchema = new mongoose.Schema({
//   symbol: { type: String, required: true, unique: true },
//   prices: [
//     {
//       date: { type: Date, required: true },
//       price: { type: Number, required: true },
//     },
//   ],
// });

// module.exports = mongoose.model('History', HistorySchema);

// and models / stock.js : 
// const mongoose = require('mongoose');

// const stockSchema = new mongoose.Schema({
//   symbol: { type: String, required: true, unique: true },
//   currentPrice: { type: Number, required: true },
//   percentageChange: { type: Number, required: true },
//   lastUpdated: { type: Date, default: Date.now },
//   history: [
//     {
//       date: { type: Date, required: true },
//       price: { type: Number, required: true },
//     },
//   ],
// });

// module.exports = mongoose.model('Stock', stockSchema);

// and models / watchlist.js : 
// const mongoose = require("mongoose");

// const WatchlistSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true }, // Unique watchlist per user
//   stocks: [{ type: String, uppercase: true }], // List of stock symbols
// });

// module.exports = mongoose.model("Watchlist", WatchlistSchema);

// and routes / stockRoutes.js : 
// const express = require("express");
// const router = express.Router();
// const stockController = require("../controllers/stockController");
// const { scrapeAndSaveStockData } = require("../services/scraperService"); 
// const History = require("../models/History");

// // Define routes
// // 1. Fetch stock data
// router.get("/search/:symbol", stockController.getStockData);

// // 2. Fetch historical stock data from the database
// router.get("/history/:symbol", async (req, res) => {
//     try {
//       const { symbol } = req.params;
  
//       // ✅ Scrape and update database
//       await scrapeAndSaveStockData(symbol);
  
//       // ✅ Fetch updated historical data from History model
//       const history = await History.findOne({ symbol });
  
//       if (!history || history.prices.length === 0) {
//         return res.status(404).json({ error: "No historical data found." });
//       }
  
//       res.json(history.prices); // ✅ Return only historical prices
//     } catch (error) {
//       console.error("Error fetching historical data:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   });
  
//   module.exports = router;

// and routes / watchlistRoutes.js : 
// const express = require("express");
// const router = express.Router();
// const watchlistController = require("../controllers/watchlistController");

// // Add stock to watchlist
// router.post("/add", watchlistController.addStockToWatchlist);

// // Remove stock from watchlist
// router.post("/remove", watchlistController.removeStockFromWatchlist);

// // Get user's watchlist with stock data
// router.get("/:userId", watchlistController.getWatchlist);

// module.exports = router;

// and scraper / stockScraper.js : 
// const puppeteer = require("puppeteer");

// const fetchStockData = async (symbol) => {
//   const url = `https://finance.yahoo.com/quote/${symbol}`;

//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded" });

//     // Log the HTML content of the page for verification
//     const pageContent = await page.content();
//     console.log(pageContent);

//     // Wait for specific elements that we need to scrape
//     await page.waitForSelector("[data-symbol]");
//     await page.waitForSelector(".Trsdu\\(0\\.3s\\)");

//     const stockData = await page.evaluate(() => {
//       const symbol = document.querySelector("[data-symbol]").getAttribute("data-symbol");
//       const currentPrice = document.querySelector(".Trsdu\\(0\\.3s\\)").textContent;
//       const percentageChange = document.querySelector(".Fw\\(600\\)").textContent;

//       return {
//         symbol,
//         currentPrice: parseFloat(currentPrice.replace(",", "")),
//         percentageChange,
//         lastUpdated: new Date().toISOString(),
//       };
//     });

//     await browser.close();
//     return stockData;
//   } catch (error) {
//     console.error(`Failed to scrape stock data for symbol: ${symbol}. Error: ${error.message}`);
//     return null;
//   }
// };

// module.exports = fetchStockData;

// and services / scraperService.js : 
// const puppeteer = require("puppeteer");
// const { scrapeHistoricalData } = require("./scraperHistorical"); // Import scrapeHistoricalData
// const History = require("../models/History");

// /**
//  * Function to fetch stock data using Puppeteer.
//  * @param {string} symbol - The stock symbol (e.g., "AAPL").
//  * @returns {Object|null} - The current stock price and percentage change.
//  */
// const fetchStockData = async (symbol) => {
//   const url = `https://finance.yahoo.com/quote/${symbol}`;

//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded" });

//     const stockData = await page.evaluate(() => {
//       const priceSelector = 'span[data-testid="qsp-price"]';
//       const changeSelector = 'span[data-testid="qsp-price-change-percent"]';

//       const priceElement = document.querySelector(priceSelector);
//       const changeElement = document.querySelector(changeSelector);

//       if (!priceElement || !changeElement) {
//         console.log("Could not find price or change element!");
//         return null;
//       }

//       const currentPrice = parseFloat(
//         priceElement.textContent.replace(/[^0-9.-]+/g, "")
//       );
//       const percentageChangeText = changeElement.textContent.replace(
//         /[^0-9.-]+/g,
//         ""
//       );
//       const percentageChange = parseFloat(percentageChangeText);

//       return { currentPrice, percentageChange };
//     });

//     await browser.close();
//     return stockData || null;
//   } catch (error) {
//     console.error("Error scraping stock data:", error);
//     return null;
//   }
// };

// /**
//  * Function to scrape and save historical stock data.
//  * @param {string} symbol - The stock symbol (e.g., "AAPL").
//  */

// const scrapeAndSaveStockData = async (symbol) => {
//   console.log(`Scraping historical data for ${symbol}...`);

//   try {
//     let historicalData = await scrapeHistoricalData(symbol);

//     if (historicalData.length > 0) {
//       console.log(`Successfully scraped ${historicalData.length} records for ${symbol}.`);

//       // ✅ Get the last 7 actual days (excluding older data)
//       const today = new Date();
//       const sevenDaysAgo = new Date();
//       sevenDaysAgo.setDate(today.getDate() - 8); // 7 days before today

//       historicalData = historicalData.filter(entry => {
//         const entryDate = new Date(entry.date);
//         return entryDate >= sevenDaysAgo && entryDate <= today;
//       });

//       // Sort ascending (earliest date first)
//       historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

//       await History.findOneAndUpdate(
//         { symbol },
//         { $set: { prices: historicalData } },
//         { upsert: true, new: true }
//       );
//     } else {
//       console.error(`No data found for ${symbol}.`);
//     }
//   } catch (error) {
//     console.error(`Error scraping and saving historical data for ${symbol}:`, error.message);
//   }
// };


// module.exports = { fetchStockData, scrapeAndSaveStockData };

// and services / scraperHistorical.js : 
// const axios = require("axios");

// const scrapeHistoricalData = async (symbol) => {
//   const INTERVAL = "1d"; // Daily data
//   const RANGE = "7d"; // Limit to last 7 days

//   try {
//     const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${INTERVAL}&range=${RANGE}`;
//     const response = await axios.get(url);

//     const { timestamp, indicators } = response.data.chart.result[0];
//     const prices = indicators.quote[0].close;

//     return timestamp.map((time, index) => ({
//       date: new Date(time * 1000).toISOString().split("T")[0], // Convert timestamp to YYYY-MM-DD
//       price: prices[index],
//     }));
//   } catch (error) {
//     console.error("Error fetching stock data:", error.message);
//     return [];
//   }
// };

// module.exports = { scrapeHistoricalData };

// and my services / watchlistService.js : 
// const { scrapeAndSaveStockData } = require("./scraperService");
// const Watchlist = require("../models/watchlist");

// /**
//  * Function to add a stock symbol to the watchlist.
//  * @param {string} symbol - The stock symbol (e.g., "AAPL").
//  * @returns {Object} - The saved watchlist entry.
//  */
// const addToWatchlist = async (symbol) => {
//   try {
//     const existingEntry = await Watchlist.findOne({ symbol });

//     if (existingEntry) {
//       console.log(`${symbol} already exists in the watchlist.`);
//       return existingEntry;
//     }

//     const watchlistEntry = new Watchlist({ symbol });
//     const savedEntry = await watchlistEntry.save();
//     console.log(`${symbol} added to the watchlist.`);
//     return savedEntry;
//   } catch (error) {
//     console.error(`Error adding ${symbol} to the watchlist:`, error.message);
//     throw error;
//   }
// };

// /**
//  * Function to remove a stock symbol from the watchlist.
//  * @param {string} symbol - The stock symbol (e.g., "AAPL").
//  * @returns {Object|null} - The removed watchlist entry.
//  */
// const removeFromWatchlist = async (symbol) => {
//   try {
//     const deletedEntry = await Watchlist.findOneAndDelete({ symbol });

//     if (!deletedEntry) {
//       console.log(`${symbol} not found in the watchlist.`);
//       return null;
//     }

//     console.log(`${symbol} removed from the watchlist.`);
//     return deletedEntry;
//   } catch (error) {
//     console.error(`Error removing ${symbol} from the watchlist:`, error.message);
//     throw error;
//   }
// };

// /**
//  * Function to scrape historical data for all stocks in the watchlist.
//  * @returns {void}
//  */
// const updateWatchlistHistoricalData = async () => {
//   try {
//     const watchlist = await Watchlist.find();

//     if (!watchlist || watchlist.length === 0) {
//       console.log("No stocks in the watchlist.");
//       return;
//     }

//     for (const entry of watchlist) {
//       console.log(`Updating historical data for ${entry.symbol}...`);
//       await scrapeAndSaveStockData(entry.symbol);
//     }

//     console.log("Watchlist historical data update completed.");
//   } catch (error) {
//     console.error("Error updating watchlist historical data:", error.message);
//     throw error;
//   }
// };

// module.exports = {
//   addToWatchlist,
//   removeFromWatchlist,
//   updateWatchlistHistoricalData,
// };


// so please fix the history stock prices part in my watchlist api endpoint ( the watchlist should take my actual code that scrapes the actual stock prices and their percentage change and also the 7 last days history of the stock price and their dates (so you need to fix the watchlist feature code to just get the 2 already developped api endpoints i have (the search stock and history stock))
