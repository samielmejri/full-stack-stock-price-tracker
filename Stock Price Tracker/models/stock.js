const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  currentPrice: { type: Number, required: true },
  percentageChange: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  history: { type: Array, default: [] },
});

module.exports = mongoose.model('Stock', stockSchema);
