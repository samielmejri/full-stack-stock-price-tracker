const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");

const SYMBOL = "AAPL"; // Change this to any stock symbol you want
const INTERVAL = "1d"; // Daily data
const RANGE = "5d"; // Last 5 days

// Connect to MongoDB
connectDB();

// Stock Schema with Unique Index on (symbol, date)
const stockSchema = new mongoose.Schema({
  symbol: String,
  date: { type: Date, required: true },
  price: Number,
});
stockSchema.index({ symbol: 1, date: 1 }, { unique: true }); // Prevents duplicate entries
const Stock = mongoose.model("Stock", stockSchema);

// Fetch historical stock data using Yahoo Finance API
const fetchStockData = async (symbol) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${INTERVAL}&range=${RANGE}`;
    const response = await axios.get(url);
    
    const { timestamp, indicators } = response.data.chart.result[0];
    const prices = indicators.quote[0].close;

    return timestamp.map((time, index) => ({
      symbol,
      date: new Date(time * 1000), // Convert timestamp to date
      price: prices[index],
    }));
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    return [];
  }
};

// Insert Data with Upsert (Prevent Duplicates)
const insertStockData = async (data) => {
  for (const stock of data) {
    try {
      await Stock.updateOne(
        { symbol: stock.symbol, date: stock.date }, // Find matching symbol and date
        { $set: stock }, // Update if exists, insert if not
        { upsert: true } // Prevents duplicates
      );
    } catch (error) {
      if (error.code !== 11000) {
        console.error("❌ Database Error:", error.message);
      }
    }
  }
};

// Run script directly
(async () => {
  console.log(`Fetching historical data for ${SYMBOL}...`);

  const stockData = await fetchStockData(SYMBOL);

  if (stockData.length > 0) {
    console.log("Scraped Data:", stockData);
    await insertStockData(stockData);
    console.log("✅ Data inserted/updated successfully.");
  } else {
    console.log("❌ No data found.");
  }

  mongoose.connection.close();
})();
