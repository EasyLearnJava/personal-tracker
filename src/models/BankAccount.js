const { v4: uuidv4 } = require('uuid');

class BankAccount {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.accountName = data.accountName; // e.g., 'Checking Account', 'Savings Account'
    this.accountType = data.accountType; // 'checking', 'savings', 'money_market', 'other'
    this.bankName = data.bankName; // e.g., 'Chase', 'Bank of America'
    this.accountNumber = data.accountNumber || ''; // Last 4 digits or masked
    this.initialBalance = data.initialBalance || 0; // Starting balance
    this.currentBalance = data.currentBalance || data.initialBalance || 0; // Current balance
    this.currency = data.currency || 'USD'; // Currency code
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      accountName: this.accountName,
      accountType: this.accountType,
      bankName: this.bankName,
      accountNumber: this.accountNumber,
      initialBalance: this.initialBalance,
      currentBalance: this.currentBalance,
      currency: this.currency,
      isActive: this.isActive,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Calculate balance change
  getBalanceChange() {
    return this.currentBalance - this.initialBalance;
  }

  // Check if balance is low
  isLowBalance(threshold = 1000) {
    return this.currentBalance < threshold;
  }
}

module.exports = BankAccount;

