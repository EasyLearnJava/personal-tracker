const db = require('../db/database');
const BankAccount = require('../models/BankAccount');

class BankAccountService {
  // Create a new bank account
  static createBankAccount(accountData) {
    const accounts = db.readBankAccounts();
    const account = new BankAccount(accountData);
    accounts.push(account.toJSON());
    db.writeBankAccounts(accounts);
    return account.toJSON();
  }

  // Get all bank accounts
  static getAllBankAccounts() {
    return db.readBankAccounts();
  }

  // Get active bank accounts
  static getActiveBankAccounts() {
    const accounts = db.readBankAccounts();
    return accounts.filter(a => a.isActive);
  }

  // Get bank account by ID
  static getBankAccountById(id) {
    const accounts = db.readBankAccounts();
    return accounts.find(a => a.id === id);
  }

  // Get bank account by name
  static getBankAccountByName(name) {
    const accounts = db.readBankAccounts();
    return accounts.find(a => a.accountName === name);
  }

  // Update bank account
  static updateBankAccount(id, updateData) {
    const accounts = db.readBankAccounts();
    const index = accounts.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...accounts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    accounts[index] = updated;
    db.writeBankAccounts(accounts);
    return updated;
  }

  // Delete bank account
  static deleteBankAccount(id) {
    const accounts = db.readBankAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    
    if (filtered.length === accounts.length) {
      return false;
    }

    db.writeBankAccounts(filtered);
    return true;
  }

  // Deduct amount from account (for payments)
  static deductFromAccount(id, amount) {
    const account = this.getBankAccountById(id);
    if (!account) {
      return null;
    }

    const newBalance = Math.max(0, account.currentBalance - amount);
    return this.updateBankAccount(id, {
      currentBalance: newBalance
    });
  }

  // Add amount to account (for income/deposits)
  static addToAccount(id, amount) {
    const account = this.getBankAccountById(id);
    if (!account) {
      return null;
    }

    const newBalance = account.currentBalance + amount;
    return this.updateBankAccount(id, {
      currentBalance: newBalance
    });
  }

  // Get total balance across all accounts
  static getTotalBalance() {
    const accounts = db.readBankAccounts();
    return accounts
      .filter(a => a.isActive)
      .reduce((sum, a) => sum + parseFloat(a.currentBalance || 0), 0);
  }

  // Get total balance for active accounts
  static getActiveTotalBalance() {
    const accounts = db.readBankAccounts();
    return accounts
      .filter(a => a.isActive)
      .reduce((sum, a) => sum + parseFloat(a.currentBalance || 0), 0);
  }

  // Get account summary
  static getAccountSummary(id) {
    const account = this.getBankAccountById(id);
    if (!account) {
      return null;
    }

    return {
      ...account,
      balanceChange: account.currentBalance - account.initialBalance,
      percentageChange: account.initialBalance > 0 
        ? ((account.currentBalance - account.initialBalance) / account.initialBalance * 100).toFixed(2)
        : 0
    };
  }

  // Get all account summaries
  static getAllAccountSummaries() {
    const accounts = db.readBankAccounts();
    return accounts.map(account => ({
      ...account,
      balanceChange: account.currentBalance - account.initialBalance,
      percentageChange: account.initialBalance > 0 
        ? ((account.currentBalance - account.initialBalance) / account.initialBalance * 100).toFixed(2)
        : 0
    }));
  }

  // Check if account has sufficient balance
  static hasSufficientBalance(id, amount) {
    const account = this.getBankAccountById(id);
    if (!account) {
      return false;
    }
    return account.currentBalance >= amount;
  }

  // Get low balance accounts
  static getLowBalanceAccounts(threshold = 1000) {
    const accounts = db.readBankAccounts();
    return accounts.filter(a => a.isActive && a.currentBalance < threshold);
  }
}

module.exports = BankAccountService;

