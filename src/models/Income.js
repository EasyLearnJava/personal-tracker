const { v4: uuidv4 } = require('uuid');

class Income {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.amount = data.amount;
    this.source = data.source; // e.g., 'Salary', 'Freelance', 'Investment', 'Bonus'
    this.description = data.description;
    this.date = data.date || new Date().toISOString();
    this.frequency = data.frequency; // 'once', 'daily', 'weekly', 'monthly', 'yearly'
    this.isRecurring = data.isRecurring || false;
    this.recurringEndDate = data.recurringEndDate || null;
    this.notes = data.notes || '';
    this.bankAccountId = data.bankAccountId || null; // Bank account to deposit to
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      source: this.source,
      description: this.description,
      date: this.date,
      frequency: this.frequency,
      isRecurring: this.isRecurring,
      recurringEndDate: this.recurringEndDate,
      notes: this.notes,
      bankAccountId: this.bankAccountId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Income;

