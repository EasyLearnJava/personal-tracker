const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const Logger = require('../src/utils/logger');
const db = require('../src/db/database');
const supabaseDb = require('../src/db/supabaseDb');
const expenseRoutes = require('../src/routes/expenseRoutes');
const categoryRoutes = require('../src/routes/categoryRoutes');
const reportRoutes = require('../src/routes/reportRoutes');
const taskRoutes = require('../src/routes/taskRoutes');
const authRoutes = require('../src/routes/authRoutes');
const userRoutes = require('../src/routes/userRoutes');
const logsRoutes = require('../src/routes/logsRoutes');
const activityLogRoutes = require('../src/routes/activityLogRoutes');
const budgetRoutes = require('../src/routes/budgetRoutes');

// Initialize database - wrap in try-catch for Vercel
try {
  db.initializeDatabase();
  // supabaseDb.initializeDatabase() is async, so we don't await it here
  supabaseDb.initializeDatabase().catch(err => {
    console.error('Supabase initialization error:', err.message);
  });
} catch (error) {
  console.error('Database initialization error:', error.message);
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/budgets', budgetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Personal Tracker API is running' });
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

// Export for Vercel serverless - Vercel automatically handles Express apps
module.exports = app;

