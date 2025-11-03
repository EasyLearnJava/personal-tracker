const express = require('express');
const router = express.Router();
const ExpenseService = require('../services/expenseService');

// Get all expenses
router.get('/', (req, res) => {
  try {
    const expenses = ExpenseService.getAllExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
router.get('/:id', (req, res) => {
  try {
    const expense = ExpenseService.getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new expense
router.post('/', (req, res) => {
  try {
    const expense = ExpenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', (req, res) => {
  try {
    const expense = ExpenseService.updateExpense(req.params.id, req.body);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', (req, res) => {
  try {
    const success = ExpenseService.deleteExpense(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by date range
router.get('/filter/daterange', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by category
router.get('/filter/category/:category', (req, res) => {
  try {
    const expenses = ExpenseService.getExpensesByCategory(req.params.category);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by payment method
router.get('/filter/payment/:method', (req, res) => {
  try {
    const expenses = ExpenseService.getExpensesByPaymentMethod(req.params.method);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

