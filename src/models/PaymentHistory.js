const { v4: uuidv4 } = require('uuid');

class PaymentHistory {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.debtId = data.debtId; // Reference to debt being paid
    this.debtName = data.debtName; // Debt name for display
    this.amount = data.amount; // Payment amount
    this.paymentDate = data.paymentDate || new Date().toISOString().split('T')[0]; // Date of payment
    this.paymentMethod = data.paymentMethod; // 'bank_transfer', 'cash', 'check', 'online', etc.
    this.sourceAccount = data.sourceAccount; // Which account paid (e.g., 'Checking Account', 'Savings')
    this.sourceAccountId = data.sourceAccountId || null; // Reference to bank account
    this.notes = data.notes || ''; // Additional notes
    this.status = data.status || 'completed'; // 'pending', 'completed', 'failed'
    this.transactionId = data.transactionId || null; // External transaction ID
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      debtId: this.debtId,
      debtName: this.debtName,
      amount: this.amount,
      paymentDate: this.paymentDate,
      paymentMethod: this.paymentMethod,
      sourceAccount: this.sourceAccount,
      sourceAccountId: this.sourceAccountId,
      notes: this.notes,
      status: this.status,
      transactionId: this.transactionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = PaymentHistory;

