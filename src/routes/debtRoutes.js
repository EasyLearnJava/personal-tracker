const express = require('express');
const router = express.Router();
const DebtService = require('../services/debtService');

// Get all debts
router.get('/', (req, res) => {
  try {
    const debts = DebtService.getAllDebts();
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active debts only
router.get('/active', (req, res) => {
  try {
    const debts = DebtService.getActiveDebts();
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debt by ID
router.get('/:id', (req, res) => {
  try {
    const debt = DebtService.getDebtById(req.params.id);
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new debt
router.post('/', (req, res) => {
  try {
    const debt = DebtService.createDebt(req.body);
    res.status(201).json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update debt
router.put('/:id', (req, res) => {
  try {
    const debt = DebtService.updateDebt(req.params.id, req.body);
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    res.json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete debt
router.delete('/:id', (req, res) => {
  try {
    const success = DebtService.deleteDebt(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debts by type
router.get('/type/:type', (req, res) => {
  try {
    const debts = DebtService.getDebtsByType(req.params.type);
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debts by card
router.get('/card/:cardId', (req, res) => {
  try {
    const debts = DebtService.getDebtsByCard(req.params.cardId);
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get debt summary
router.get('/summary/all', (req, res) => {
  try {
    const summary = DebtService.getDebtSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a payment
router.post('/:id/payment', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    const debt = DebtService.makePayment(req.params.id, amount);
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    res.json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add expense to debt
router.post('/:id/add-expense', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid expense amount' });
    }
    const debt = DebtService.addExpenseToDebt(req.params.id, amount);
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    res.json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get debts by card ID
router.get('/card/:cardId', (req, res) => {
  try {
    const debts = DebtService.getDebtsByCardId(req.params.cardId);
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total debt for a card
router.get('/card/:cardId/total', (req, res) => {
  try {
    const total = DebtService.getCardTotalDebt(req.params.cardId);
    res.json({ cardId: req.params.cardId, totalDebt: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all card debts with totals
router.get('/cards/all/summary', (req, res) => {
  try {
    const cardDebts = DebtService.getAllCardDebts();
    res.json(cardDebts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update card debt
router.post('/card/:cardId/init', (req, res) => {
  try {
    const { cardName, initialBalance } = req.body;
    const debt = DebtService.createOrUpdateCardDebt(req.params.cardId, cardName, initialBalance || 0);
    res.status(201).json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

