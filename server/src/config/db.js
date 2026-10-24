const mongoose = require('mongoose');

let isConnected = false;
let retryTimeout = null;

/**
 * Connect to MongoDB using Mongoose.
 * Supports MongoDB Atlas (cloud) or local MongoDB instance with auto-retry.
 */
const connectDB = async (retryDelay = 5000) => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️  MONGODB_URI is not defined in server/.env.');
    console.warn('👉 Please add your MongoDB Atlas URI or local MongoDB URI to server/.env');
    isConnected = false;
    return false;
  }

  try {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }

    const conn = await mongoose.connect(mongoURI, {
      dbName: 'taskflow',
      serverSelectionTimeoutMS: 8000
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`🔄 Re-attempting MongoDB connection in ${retryDelay / 1000}s...`);
    retryTimeout = setTimeout(() => connectDB(retryDelay), retryDelay);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
