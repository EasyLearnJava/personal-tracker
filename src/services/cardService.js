const db = require('../db/database');
const Card = require('../models/Card');

class CardService {
  // Get all cards
  static getAllCards() {
    return db.readCards();
  }

  // Get card by ID
  static getCardById(id) {
    const cards = db.readCards();
    return cards.find(c => c.id === id);
  }

  // Add new card
  static addCard(cardData) {
    const cards = db.readCards();
    const newCard = new Card(cardData);
    cards.push(newCard.toJSON());
    db.writeCards(cards);
    return newCard.toJSON();
  }

  // Update card
  static updateCard(id, updateData) {
    const cards = db.readCards();
    const index = cards.findIndex(c => c.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...cards[index],
      ...updateData
    };

    cards[index] = updated;
    db.writeCards(cards);
    return updated;
  }

  // Delete card
  static deleteCard(id) {
    const cards = db.readCards();
    const filtered = cards.filter(c => c.id !== id);
    
    if (filtered.length === cards.length) {
      return false;
    }

    db.writeCards(filtered);
    return true;
  }

  // Get active cards
  static getActiveCards() {
    const cards = db.readCards();
    return cards.filter(c => c.isActive);
  }

  // Get cards by payment method
  static getCardsByPaymentMethod(paymentMethodId) {
    const cards = db.readCards();
    return cards.filter(c => c.paymentMethodId === paymentMethodId);
  }
}

module.exports = CardService;

