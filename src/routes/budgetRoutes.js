const express = require('express');
const router = express.Router();
const BudgetService = require('../services/budgetService');

// Get all budgets
router.get('/', (req, res) => {
  try {
    const budgets = BudgetService.getAllBudgets();
    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get budget by ID
router.get('/:id', (req, res) => {
  try {
    const budget = BudgetService.getBudgetById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get budget by month (YYYY-MM format)
router.get('/month/:month', (req, res) => {
  try {
    const budget = BudgetService.getBudgetByMonth(req.params.month);
    res.json({
      success: true,
      data: budget || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current month budget
router.get('/current/month', (req, res) => {
  try {
    const budget = BudgetService.getCurrentMonthBudget();
    res.json({
      success: true,
      data: budget || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create budget
router.post('/', (req, res) => {
  try {
    const budget = BudgetService.createBudget(req.body);
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update budget
router.put('/:id', (req, res) => {
  try {
    const budget = BudgetService.updateBudget(req.params.id, req.body);
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete budget
router.delete('/:id', (req, res) => {
  try {
    const success = BudgetService.deleteBudget(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Copy budget to another month
router.post('/:id/copy', (req, res) => {
  try {
    const { targetMonth } = req.body;
    if (!targetMonth) {
      return res.status(400).json({
        success: false,
        error: 'targetMonth is required'
      });
    }
    const newBudget = BudgetService.copyBudgetToMonth(req.params.id, targetMonth);
    if (!newBudget) {
      return res.status(400).json({
        success: false,
        error: 'Budget already exists for target month or source budget not found'
      });
    }
    res.status(201).json({
      success: true,
      data: newBudget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add budget item
router.post('/:id/items', (req, res) => {
  try {
    const budget = BudgetService.addBudgetItem(req.params.id, req.body);
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update budget item
router.put('/:id/items/:itemId', (req, res) => {
  try {
    const budget = BudgetService.updateBudgetItem(req.params.id, req.params.itemId, req.body);
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget or item not found'
      });
    }
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete budget item
router.delete('/:id/items/:itemId', (req, res) => {
  try {
    const budget = BudgetService.deleteBudgetItem(req.params.id, req.params.itemId);
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget or item not found'
      });
    }
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

