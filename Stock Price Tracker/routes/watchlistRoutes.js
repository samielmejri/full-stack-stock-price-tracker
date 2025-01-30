const express = require("express");
const router = express.Router();
const { addStockToWatchlist, removeStockFromWatchlist, getWatchlist } = require("../controllers/watchlistController");
const { authMiddleware } = require("../middlewares/auth");

// Add stock to watchlist (Protected)
router.post("/add", authMiddleware, addStockToWatchlist);

// Remove stock from watchlist (Protected)
router.delete("/remove", authMiddleware, removeStockFromWatchlist);

// Get user's watchlist (Protected)
router.get("/", authMiddleware, getWatchlist);

module.exports = router;
