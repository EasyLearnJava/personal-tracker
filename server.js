const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const Logger = require('./src/utils/logger');
const db = require('./src/db/database');
const supabaseDb = require('./src/db/supabaseDb');
const expenseRoutes = require('./src/routes/expenseRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const paymentMethodRoutes = require('./src/routes/paymentMethodRoutes');
const cardRoutes = require('./src/routes/cardRoutes');
const debtRoutes = require('./src/routes/debtRoutes');
const authRoutes = require('./src/routes/authRoutes');
const logsRoutes = require('./src/routes/logsRoutes');

// Initialize database
db.initializeDatabase();
supabaseDb.initializeDatabase();

Logger.info('Application starting', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 4000,
  timestamp: new Date().toISOString()
});

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/debts', debtRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Expense Tracker API is running' });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'An error occurred',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  Logger.warn('404 Not Found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const server = app.listen(PORT, () => {
  const message = `🚀 Expense Tracker API running on http://localhost:${PORT}`;
  console.log(message);
  Logger.info('Server started successfully', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    Logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    Logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
});

