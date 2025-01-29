const axios = require("axios");

const scrapeHistoricalData = async (symbol) => {
  const INTERVAL = "1d"; // Daily data
  const RANGE = "7d"; // Limit to last 7 days

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${INTERVAL}&range=${RANGE}`;
    const response = await axios.get(url);

    const { timestamp, indicators } = response.data.chart.result[0];
    const prices = indicators.quote[0].close;

    return timestamp.map((time, index) => ({
      date: new Date(time * 1000).toISOString().split("T")[0], // Convert timestamp to YYYY-MM-DD
      price: prices[index],
    }));
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    return [];
  }
};

module.exports = { scrapeHistoricalData };
