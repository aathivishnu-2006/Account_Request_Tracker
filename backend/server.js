/**
 * Accountant Request Tracker - Main Backend Server (server.js)
 * 
 * Beginner Explanation:
 * This is the main entry point of our Node.js/Express backend server.
 * It initializes Express, connects to the database, mounts API endpoints,
 * starts the automated background reminder service, and starts listening on Port 5000.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, isMongo, getFallbackRequests, saveFallbackRequests } = require('./db');
const requestRoutes = require('./routes/requestRoutes');
const { initReminderCron } = require('./utils/reminderCron');

// Load environment configuration
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enables cross-origin requests from React frontend
app.use(express.json()); // Parses incoming JSON request bodies

// Mount API routes
app.use('/api', requestRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    app: 'Accountant Request Tracker API',
    mode: isMongo() ? 'MongoDB (Mongoose)' : 'Embedded Persistent JSON Engine',
    version: '1.0.0'
  });
});

// Auto-seed sample data on first launch if empty
const autoSeedIfEmpty = () => {
  const requests = getFallbackRequests();
  if (requests.length === 0 && !isMongo()) {
    console.log('📦 Empty database detected. Populating initial sample requests...');
    const seed = require('./seed');
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Auto seed initial dataset if empty
  autoSeedIfEmpty();

  // Start background cron job for overdue request reminders
  initReminderCron();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Accountant Request Tracker Backend Server Running!`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`📊 Request API: http://localhost:${PORT}/api/requests`);
    console.log(`🚨 Overdue API: http://localhost:${PORT}/api/requests/overdue`);
    console.log(`=======================================================`);
  });
};

startServer();
