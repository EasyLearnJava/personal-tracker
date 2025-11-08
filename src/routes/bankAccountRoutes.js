const express = require('express');
const router = express.Router();
const BankAccountService = require('../services/bankAccountService');

// Get all bank accounts
router.get('/', (req, res) => {
  try {
    const accounts = BankAccountService.getAllBankAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active bank accounts
router.get('/active/list', (req, res) => {
  try {
    const accounts = BankAccountService.getActiveBankAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bank account by ID
router.get('/:id', (req, res) => {
  try {
    const account = BankAccountService.getBankAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get account summary
router.get('/:id/summary', (req, res) => {
  try {
    const summary = BankAccountService.getAccountSummary(req.params.id);
    if (!summary) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all account summaries
router.get('/summary/all', (req, res) => {
  try {
    const summaries = BankAccountService.getAllAccountSummaries();
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total balance
router.get('/balance/total', (req, res) => {
  try {
    const total = BankAccountService.getTotalBalance();
    res.json({ totalBalance: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active total balance
router.get('/balance/active', (req, res) => {
  try {
    const total = BankAccountService.getActiveTotalBalance();
    res.json({ activeTotalBalance: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low balance accounts
router.get('/balance/low', (req, res) => {
  try {
    const threshold = req.query.threshold || 1000;
    const accounts = BankAccountService.getLowBalanceAccounts(threshold);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new bank account
router.post('/', (req, res) => {
  try {
    const account = BankAccountService.createBankAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update bank account
router.put('/:id', (req, res) => {
  try {
    const account = BankAccountService.updateBankAccount(req.params.id, req.body);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete bank account
router.delete('/:id', (req, res) => {
  try {
    const success = BankAccountService.deleteBankAccount(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deduct from account
router.post('/:id/deduct', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const account = BankAccountService.deductFromAccount(req.params.id, amount);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add to account
router.post('/:id/add', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const account = BankAccountService.addToAccount(req.params.id, amount);
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check sufficient balance
router.post('/:id/check-balance', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const hasSufficient = BankAccountService.hasSufficientBalance(req.params.id, amount);
    res.json({ hasSufficientBalance: hasSufficient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

