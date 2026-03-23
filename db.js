const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  // Reuse existing connection in serverless environment
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully');
    console.log(`📍 Database Host: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Connection URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
    isConnected = false;
    throw err; // Throw error instead of process.exit for serverless
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ Database error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Database disconnected');
  isConnected = false;
});

module.exports = connectDB;