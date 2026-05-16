const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Uses MONGO_URI from environment variables
 * Includes retry logic for production resilience
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 7+ no longer needs these options, but keeping for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Retry connection after 5 seconds
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
