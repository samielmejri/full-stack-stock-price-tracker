const fetchStockData = require('./services/scraperService').fetchStockData;

const testScraper = async () => {
  const symbol = 'AAPL';  // Replace with any stock symbol you want to test
  console.log(`Testing stock data for: ${symbol}`);

  const stockData = await fetchStockData(symbol);
  
  if (stockData) {
    console.log(`Stock: ${symbol}`);
    console.log(`Current Price: $${stockData.currentPrice}`);
    console.log(`Percentage Change: ${stockData.percentageChange}%`);
  } else {
    console.log("Failed to scrape the stock data.");
  }
};

testScraper();
