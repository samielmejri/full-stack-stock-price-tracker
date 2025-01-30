require("dotenv").config(); // Load environment variables

const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
require('./services/schedulerService'); // Start the scheduler

// Route imports
const stockRoutes = require('./routes/stockRoutes');
const watchlistRoutes = require("./routes/watchlistRoutes");
const authRoutes = require('./routes/authRoutes'); // New auth routes

// Middleware imports
const authMiddleware = require('./middlewares/auth'); // JWT middleware

// Services
const scraperService = require("./services/scraperService");
const Stock = require("./models/stock"); // Stock model

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/stocks', stockRoutes); // Stock routes

// Protected watchlist routes (require authentication)
app.use("/api/watchlist", watchlistRoutes); 

// Error handler (should be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));