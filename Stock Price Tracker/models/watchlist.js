const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // References the User model
    ref: "User",
    required: true,
    unique: true, // Ensures one watchlist per user
  },
  stocks: [
    {
      type: String,
      uppercase: true, // Converts stock symbols to uppercase
      trim: true, // Removes whitespace around stock symbols
    },
  ],
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Add a method to check if a stock already exists in the watchlist
WatchlistSchema.methods.containsStock = function (stockSymbol) {
  return this.stocks.includes(stockSymbol.toUpperCase());
};

// Add a method to add a stock to the watchlist
WatchlistSchema.methods.addStock = function (stockSymbol) {
  const uppercasedSymbol = stockSymbol.toUpperCase();
  if (!this.containsStock(uppercasedSymbol)) {
    this.stocks.push(uppercasedSymbol);
  }
};

// Add a method to remove a stock from the watchlist
WatchlistSchema.methods.removeStock = function (stockSymbol) {
  const uppercasedSymbol = stockSymbol.toUpperCase();
  this.stocks = this.stocks.filter((stock) => stock !== uppercasedSymbol);
};

module.exports = mongoose.model("Watchlist", WatchlistSchema);
