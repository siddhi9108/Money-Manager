require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to ensure DB connection
let dbConnectionPromise = null;

const ensureDbConnection = async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }
    await dbConnectionPromise;
    next();
  } catch (error) {
    dbConnectionPromise = null; // Reset so next request retries
    console.error('Database connection error:', error.message);
    res.status(503).json({ 
      error: 'Database connection failed', 
      message: error.message 
    });
  }
};

app.use(cors({ origin: '*' }));
app.use(express.json());

// Apply DB connection middleware to all routes except health check
app.use('/api', ensureDbConnection);

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API is running', status: 'active' });
});

// Health check endpoint (no DB required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'not set'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;

// Start server only in local development
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}