const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

// Add stock to watchlist
router.post('/add', watchlistController.addToWatchlist);

// Remove stock from watchlist
router.delete('/remove', watchlistController.removeFromWatchlist);

// Get user watchlist
router.get('/', watchlistController.getWatchlist);

module.exports = router;
