const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  prices: [
    {
      date: { type: Date, required: true },
      price: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('History', HistorySchema);
