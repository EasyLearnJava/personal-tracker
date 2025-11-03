const express = require('express');
const router = express.Router();
const IncomeService = require('../services/incomeService');

// Get all income
router.get('/', (req, res) => {
  try {
    const income = IncomeService.getAllIncome();
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get income by ID
router.get('/:id', (req, res) => {
  try {
    const income = IncomeService.getIncomeById(req.params.id);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new income
router.post('/', (req, res) => {
  try {
    const income = IncomeService.createIncome(req.body);
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update income
router.put('/:id', (req, res) => {
  try {
    const income = IncomeService.updateIncome(req.params.id, req.body);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete income
router.delete('/:id', (req, res) => {
  try {
    const success = IncomeService.deleteIncome(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get income by date range
router.get('/filter/daterange', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const income = IncomeService.getIncomeByDateRange(startDate, endDate);
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

