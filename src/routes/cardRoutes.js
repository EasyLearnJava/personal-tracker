const express = require('express');
const router = express.Router();
const CardService = require('../services/cardService');

// Get all cards
router.get('/', (req, res) => {
  try {
    const cards = CardService.getAllCards();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get card by ID
router.get('/:id', (req, res) => {
  try {
    const card = CardService.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new card
router.post('/', (req, res) => {
  try {
    const card = CardService.addCard(req.body);
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update card
router.put('/:id', (req, res) => {
  try {
    const card = CardService.updateCard(req.params.id, req.body);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete card
router.delete('/:id', (req, res) => {
  try {
    const success = CardService.deleteCard(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active cards
router.get('/active/list', (req, res) => {
  try {
    const cards = CardService.getActiveCards();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

