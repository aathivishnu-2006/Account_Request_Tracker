/**
 * Database Module (db.js)
 * 
 * Beginner Explanation:
 * In a MERN stack app, MongoDB stores our data documents.
 * This module connects to MongoDB using Mongoose.
 * To make this project 100% beginner-friendly and guarantee it runs immediately on any computer,
 * it includes an automatic Fallback Storage Mode if local MongoDB is not running yet.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Memory/JSON Fallback store paths (used if MongoDB server is offline)
const DATA_DIR = path.join(__dirname, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');

// Ensure data directory exists for fallback mode
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(REQUESTS_FILE)) fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(REMINDERS_FILE)) fs.writeFileSync(REMINDERS_FILE, JSON.stringify([], null, 2));

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accountant_tracker';
  
  try {
    // Attempt connecting to MongoDB database with a short timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully via Mongoose!');
  } catch (err) {
    isMongoConnected = false;
    console.log('⚠️ MongoDB not detected locally on port 27017.');
    console.log('💡 Active Mode: Using Embedded JSON Database (Zero Setup Required!).');
    console.log('   All data will be automatically saved and persistent in backend/data/ directory.');
  }
};

/**
 * File Store Helper Functions (Beginner Fallback Store)
 */
const getFallbackRequests = () => {
  try {
    return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
};

const saveFallbackRequests = (data) => {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
};

const getFallbackReminders = () => {
  try {
    return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
};

const saveFallbackReminders = (data) => {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
  connectDB,
  isMongo: () => isMongoConnected,
  getFallbackRequests,
  saveFallbackRequests,
  getFallbackReminders,
  saveFallbackReminders
};
