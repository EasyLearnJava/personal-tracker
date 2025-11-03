const express = require('express');
const router = express.Router();
const Logger = require('../utils/logger');

// Get all logs
router.get('/all', (req, res) => {
  try {
    const logs = Logger.readLogs('all');
    res.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get error logs
router.get('/error', (req, res) => {
  try {
    const logs = Logger.readLogs('error');
    res.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get info logs
router.get('/info', (req, res) => {
  try {
    const logs = Logger.readLogs('info');
    res.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get debug logs
router.get('/debug', (req, res) => {
  try {
    const logs = Logger.readLogs('debug');
    res.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear logs
router.post('/clear', (req, res) => {
  try {
    Logger.clearLogs();
    Logger.info('Logs cleared by user');
    res.json({
      success: true,
      message: 'Logs cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get log file paths
router.get('/paths', (req, res) => {
  try {
    const paths = Logger.getLogFiles();
    res.json({
      success: true,
      paths: paths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

