const express = require('express');
const router = express.Router();
const PaymentMethodService = require('../services/paymentMethodService');

// Get all payment methods
router.get('/', (req, res) => {
  try {
    const methods = PaymentMethodService.getAllPaymentMethods();
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment method by ID
router.get('/:id', (req, res) => {
  try {
    const method = PaymentMethodService.getPaymentMethodById(req.params.id);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json(method);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new payment method
router.post('/', (req, res) => {
  try {
    const method = PaymentMethodService.addPaymentMethod(req.body);
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update payment method
router.put('/:id', (req, res) => {
  try {
    const method = PaymentMethodService.updatePaymentMethod(req.params.id, req.body);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json(method);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment method
router.delete('/:id', (req, res) => {
  try {
    const success = PaymentMethodService.deletePaymentMethod(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active payment methods
router.get('/active/list', (req, res) => {
  try {
    const methods = PaymentMethodService.getActivePaymentMethods();
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

