const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  currentPrice: { type: Number, required: true },
  percentageChange: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  history: [
    {
      date: { type: Date, required: true },
      price: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('Stock', stockSchema);