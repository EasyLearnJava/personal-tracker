const express = require('express');
const router = express.Router();
const PaymentHistoryService = require('../services/paymentHistoryService');

// Get all payment history
router.get('/', (req, res) => {
  try {
    const history = PaymentHistoryService.getAllPaymentHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by ID
router.get('/:id', (req, res) => {
  try {
    const history = PaymentHistoryService.getPaymentHistoryById(req.params.id);
    if (!history) {
      return res.status(404).json({ error: 'Payment history not found' });
    }
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by debt ID
router.get('/debt/:debtId', (req, res) => {
  try {
    const history = PaymentHistoryService.getPaymentHistoryByDebtId(req.params.debtId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by date range
router.get('/filter/daterange', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const history = PaymentHistoryService.getPaymentHistoryByDateRange(startDate, endDate);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by payment method
router.get('/filter/method/:method', (req, res) => {
  try {
    const history = PaymentHistoryService.getPaymentHistoryByMethod(req.params.method);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by account
router.get('/filter/account/:accountId', (req, res) => {
  try {
    const history = PaymentHistoryService.getPaymentHistoryByAccount(req.params.accountId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent payments
router.get('/recent/:limit', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const history = PaymentHistoryService.getRecentPayments(limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics
router.get('/stats/all', (req, res) => {
  try {
    const stats = PaymentHistoryService.getPaymentStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment history
router.post('/', (req, res) => {
  try {
    const history = PaymentHistoryService.createPaymentHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update payment history
router.put('/:id', (req, res) => {
  try {
    const history = PaymentHistoryService.updatePaymentHistory(req.params.id, req.body);
    if (!history) {
      return res.status(404).json({ error: 'Payment history not found' });
    }
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment history
router.delete('/:id', (req, res) => {
  try {
    const success = PaymentHistoryService.deletePaymentHistory(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Payment history not found' });
    }
    res.json({ message: 'Payment history deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total paid for debt
router.get('/debt/:debtId/total', (req, res) => {
  try {
    const total = PaymentHistoryService.getTotalPaidForDebt(req.params.debtId);
    res.json({ debtId: req.params.debtId, totalPaid: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total paid by method
router.get('/method/:method/total', (req, res) => {
  try {
    const total = PaymentHistoryService.getTotalPaidByMethod(req.params.method);
    res.json({ method: req.params.method, totalPaid: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total paid from account
router.get('/account/:accountId/total', (req, res) => {
  try {
    const total = PaymentHistoryService.getTotalPaidFromAccount(req.params.accountId);
    res.json({ accountId: req.params.accountId, totalPaid: total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

