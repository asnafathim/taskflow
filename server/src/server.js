const path = require('path');
// Load .env from server directory reliably regardless of working directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware: Enable CORS for frontend requests
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Middleware: Parse incoming JSON request bodies
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbActive = getDBStatus();
  res.status(200).json({
    status: 'ok',
    server: 'TaskFlow API running',
    database: dbActive ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount Authentication API routes
app.use('/api/auth', authRoutes);

// Mount Task API routes
app.use('/api/tasks', taskRoutes);

// Catch-all 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server immediately, then connect to MongoDB
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow Server running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
  });
  await connectDB();
};

startServer();

module.exports = app;
