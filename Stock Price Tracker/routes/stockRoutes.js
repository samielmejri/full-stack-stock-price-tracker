const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Define routes
router.get('/search/:symbol', stockController.getStockData);
router.get('/history/:symbol', stockController.getHistoricalData);

module.exports = router;
