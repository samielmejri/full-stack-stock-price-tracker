const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  prices: [
    {
      date: { type: Date, required: true },
      price: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('History', HistorySchema);