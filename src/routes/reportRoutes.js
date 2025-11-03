const express = require('express');
const router = express.Router();
const ReportService = require('../services/reportService');

// Get summary by category
router.get('/summary/category', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = ReportService.getSummaryByCategory(startDate, endDate);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary by payment method
router.get('/summary/payment', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = ReportService.getSummaryByPaymentMethod(startDate, endDate);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary by card
router.get('/summary/card', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = ReportService.getSummaryByCard(startDate, endDate);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily spending trend
router.get('/trend/daily', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const trend = ReportService.getDailySpendingTrend(startDate, endDate);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly spending trend
router.get('/trend/monthly', (req, res) => {
  try {
    const { year } = req.query;
    const trend = ReportService.getMonthlySpendingTrend(parseInt(year));
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top expenses
router.get('/top', (req, res) => {
  try {
    const { limit } = req.query;
    const expenses = ReportService.getTopExpenses(limit ? parseInt(limit) : 10);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall statistics
router.get('/statistics', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = ReportService.getOverallStatistics(startDate, endDate);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly spending trend
router.get('/trend/weekly', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const trend = ReportService.getWeeklySpendingTrend(startDate, endDate);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get yearly spending trend
router.get('/trend/yearly', (req, res) => {
  try {
    const trend = ReportService.getYearlySpendingTrend();
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get last 5 years spending trend
router.get('/trend/last-5-years', (req, res) => {
  try {
    const trend = ReportService.getLast5YearsSpendingTrend();
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary by period
router.get('/summary/by-period', (req, res) => {
  try {
    const { period } = req.query;
    const dateRange = ReportService.getDateRangeByPeriod(period);
    const summary = ReportService.getSummaryByCategory(dateRange.start, dateRange.end);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

