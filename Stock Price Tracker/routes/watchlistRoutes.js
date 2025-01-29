const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");

// Add stock to watchlist
router.post("/add", watchlistController.addStockToWatchlist);

// Remove stock from watchlist
router.delete("/remove", watchlistController.removeStockFromWatchlist);

// Get user's watchlist with stock data
router.get("/:userId", watchlistController.getWatchlist);

module.exports = router;