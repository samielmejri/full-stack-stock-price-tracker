const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const { scrapeAndSaveStockData } = require("../services/scraperService"); 
const History = require("../models/History");

// Define routes
// 1. Fetch stock data
router.get("/search/:symbol", stockController.getStockData);

// 2. Fetch historical stock data from the database
router.get("/history/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
  
      // ✅ Scrape and update database
      await scrapeAndSaveStockData(symbol);
  
      // ✅ Fetch updated historical data from History model
      const history = await History.findOne({ symbol });
  
      if (!history || history.prices.length === 0) {
        return res.status(404).json({ error: "No historical data found." });
      }
  
      res.json(history.prices); // ✅ Return only historical prices
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });
  
  module.exports = router;