const axios = require("axios");
const cheerio = require("cheerio");

exports.scrapeHistoricalData = async (symbol) => {
  const url = `https://finance.yahoo.com/quote/${symbol}/history?p=${symbol}`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const historicalData = [];

    // Select rows in the historical table
    $("table tbody tr").each((index, row) => {
      const columns = $(row).find("td");

      if (columns.length >= 7) {
        const date = $(columns[0]).text().trim();
        const closePrice = $(columns[4]).text().trim();

        if (date && closePrice && !isNaN(closePrice)) {
          historicalData.push({
            date,
            closePrice: parseFloat(closePrice.replace(/,/g, "")),
          });
        }
      }
    });

    return historicalData;
  } catch (err) {
    console.error("Error scraping historical data:", err.message);
    return [];
  }
};
