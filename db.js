const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log('✅ Connected to MongoDB database successfully');
    console.log(`📍 Database Host: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Connection URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ Database error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Database disconnected');
});

module.exports = connectDB;