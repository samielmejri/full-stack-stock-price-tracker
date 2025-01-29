const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Unique watchlist per user
  stocks: [{ type: String, uppercase: true }], // List of stock symbols
});

module.exports = mongoose.model("Watchlist", WatchlistSchema);