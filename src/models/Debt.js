const { v4: uuidv4 } = require('uuid');

class Debt {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name; // e.g., "Car Loan", "Home Loan", "Credit Card - Costco"
    this.type = data.type; // 'car_loan', 'home_loan', 'credit_card', 'student_loan', 'personal_loan', 'other'
    this.creditor = data.creditor; // e.g., "Chase Bank", "Wells Fargo", "Citi"
    this.originalAmount = data.originalAmount; // Total amount borrowed
    this.currentBalance = data.currentBalance; // Current outstanding balance
    this.minimumPayment = data.minimumPayment || 0; // Minimum monthly payment
    this.interestRate = data.interestRate || 0; // Annual interest rate (%)
    this.dueDate = data.dueDate; // Monthly due date (1-31)
    this.startDate = data.startDate; // When the debt started
    this.targetPayoffDate = data.targetPayoffDate || null; // Target date to pay off
    this.cardId = data.cardId || null; // Reference to card if it's a credit card debt
    this.cardName = data.cardName || null; // Card name for display
    this.notes = data.notes || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      creditor: this.creditor,
      originalAmount: this.originalAmount,
      currentBalance: this.currentBalance,
      minimumPayment: this.minimumPayment,
      interestRate: this.interestRate,
      dueDate: this.dueDate,
      startDate: this.startDate,
      targetPayoffDate: this.targetPayoffDate,
      cardId: this.cardId,
      cardName: this.cardName,
      notes: this.notes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Debt;

