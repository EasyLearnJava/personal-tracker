const { v4: uuidv4 } = require('uuid');

class Expense {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.amount = data.amount;
    this.category = data.category;
    this.description = data.description;
    this.date = data.date || new Date().toISOString();
    this.paymentMethod = data.paymentMethod; // 'credit_card', 'debit_card', 'bank_transfer', 'cash'
    this.cardName = data.cardName; // e.g., 'Visa', 'Mastercard', 'Bank Account'
    this.frequency = data.frequency; // 'once', 'daily', 'weekly', 'monthly', 'yearly'
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    this.isRecurring = data.isRecurring || false;
    this.recurringEndDate = data.recurringEndDate || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: this.date,
      paymentMethod: this.paymentMethod,
      cardName: this.cardName,
      frequency: this.frequency,
      notes: this.notes,
      tags: this.tags,
      isRecurring: this.isRecurring,
      recurringEndDate: this.recurringEndDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Expense;

