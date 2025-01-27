require("dotenv").config(); // Load environment variables

const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
require('./services/schedulerService'); // Start the scheduler
const stockRoutes = require('./routes/stockRoutes');
const scraperService = require("./services/scraperService"); // Correct relative path

const app = express();
app.use(express.json());

app.use(errorHandler);

// Connect to database
connectDB();

// Temporary script to clear stock history
const Stock = require("./models/stock"); // Correct path to the Stock model

// API Routes
app.use('/api/stocks', stockRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
