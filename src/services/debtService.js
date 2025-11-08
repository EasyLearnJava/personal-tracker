const db = require('../db/database');
const Debt = require('../models/Debt');
const PaymentHistoryService = require('./paymentHistoryService');
const BankAccountService = require('./bankAccountService');
const ActivityLogService = require('./activityLogService');

class DebtService {
  // Create a new debt
  static createDebt(debtData) {
    const debts = db.readDebts();
    const debt = new Debt(debtData);
    debts.push(debt.toJSON());
    db.writeDebts(debts);
    return debt.toJSON();
  }

  // Get all debts
  static getAllDebts() {
    return db.readDebts();
  }

  // Get active debts only
  static getActiveDebts() {
    const debts = db.readDebts();
    return debts.filter(d => d.isActive);
  }

  // Get debt by ID
  static getDebtById(id) {
    const debts = db.readDebts();
    return debts.find(d => d.id === id);
  }

  // Update debt
  static updateDebt(id, updateData) {
    const debts = db.readDebts();
    const index = debts.findIndex(d => d.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...debts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    debts[index] = updated;
    db.writeDebts(debts);
    return updated;
  }

  // Delete debt
  static deleteDebt(id) {
    const debts = db.readDebts();
    const filtered = debts.filter(d => d.id !== id);
    
    if (filtered.length === debts.length) {
      return false;
    }

    db.writeDebts(filtered);
    return true;
  }

  // Get debts by type
  static getDebtsByType(type) {
    const debts = db.readDebts();
    return debts.filter(d => d.type === type && d.isActive);
  }

  // Get debts by card
  static getDebtsByCard(cardId) {
    const debts = db.readDebts();
    return debts.filter(d => d.cardId === cardId && d.isActive);
  }

  // Calculate total debt
  static getTotalDebt() {
    const debts = db.readDebts();
    return debts
      .filter(d => d.isActive)
      .reduce((sum, d) => sum + (d.currentBalance || 0), 0);
  }

  // Calculate total minimum payments
  static getTotalMinimumPayments() {
    const debts = db.readDebts();
    return debts
      .filter(d => d.isActive)
      .reduce((sum, d) => sum + (d.minimumPayment || 0), 0);
  }

  // Get debt summary
  static getDebtSummary() {
    const debts = db.readDebts();
    const activeDebts = debts.filter(d => d.isActive);
    
    return {
      totalDebts: activeDebts.length,
      totalBalance: activeDebts.reduce((sum, d) => sum + (d.currentBalance || 0), 0),
      totalMinimumPayment: activeDebts.reduce((sum, d) => sum + (d.minimumPayment || 0), 0),
      debtsByType: this.getDebtsByTypeCount(activeDebts),
      highestDebt: activeDebts.length > 0 ? Math.max(...activeDebts.map(d => d.currentBalance)) : 0,
      lowestDebt: activeDebts.length > 0 ? Math.min(...activeDebts.map(d => d.currentBalance)) : 0
    };
  }

  // Helper: Get count of debts by type
  static getDebtsByTypeCount(debts) {
    const types = {};
    debts.forEach(d => {
      types[d.type] = (types[d.type] || 0) + 1;
    });
    return types;
  }

  // Make a payment on debt with history tracking
  static makePayment(debtId, paymentAmount, paymentData = {}) {
    const debt = this.getDebtById(debtId);
    if (!debt) {
      return null;
    }

    const newBalance = Math.max(0, debt.currentBalance - paymentAmount);
    const updatedDebt = this.updateDebt(debtId, {
      currentBalance: newBalance,
      isActive: newBalance > 0 ? debt.isActive : false
    });

    // Record payment history
    if (updatedDebt) {
      const paymentHistory = PaymentHistoryService.createPaymentHistory({
        debtId: debtId,
        debtName: debt.name,
        amount: paymentAmount,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || 'bank_transfer',
        sourceAccount: paymentData.sourceAccount || 'Bank Account',
        sourceAccountId: paymentData.sourceAccountId || null,
        notes: paymentData.notes || '',
        status: 'completed'
      });

      // Deduct from bank account if specified
      if (paymentData.sourceAccountId) {
        BankAccountService.deductFromAccount(paymentData.sourceAccountId, paymentAmount);
      }

      // Log activity
      ActivityLogService.logPaymentActivity({
        debtId: debtId,
        debtName: debt.name,
        amount: paymentAmount
      });
    }

    return updatedDebt;
  }

  // Add expense to credit card debt
  static addExpenseToDebt(debtId, expenseAmount) {
    const debt = this.getDebtById(debtId);
    if (!debt) {
      return null;
    }

    const newBalance = debt.currentBalance + expenseAmount;
    return this.updateDebt(debtId, {
      currentBalance: newBalance
    });
  }

  // Get debts by card ID
  static getDebtsByCardId(cardId) {
    const debts = db.readDebts();
    return debts.filter(d => d.cardId === cardId && d.isActive);
  }

  // Get total debt for a specific card
  static getCardTotalDebt(cardId) {
    const debts = this.getDebtsByCardId(cardId);
    return debts.reduce((total, debt) => total + debt.currentBalance, 0);
  }

  // Get all card debts with totals
  static getAllCardDebts() {
    const debts = db.readDebts();
    const cardDebts = {};

    debts.forEach(debt => {
      if (debt.cardId && debt.isActive) {
        if (!cardDebts[debt.cardId]) {
          cardDebts[debt.cardId] = {
            cardId: debt.cardId,
            cardName: debt.cardName,
            totalDebt: 0,
            debts: []
          };
        }
        cardDebts[debt.cardId].totalDebt += debt.currentBalance;
        cardDebts[debt.cardId].debts.push(debt);
      }
    });

    return Object.values(cardDebts);
  }

  // Create or update card debt (for credit card tracking)
  static createOrUpdateCardDebt(cardId, cardName, initialBalance = 0) {
    const debts = db.readDebts();

    // Check if debt already exists for this card
    const existingDebt = debts.find(d => d.cardId === cardId && d.type === 'credit_card');

    if (existingDebt) {
      return existingDebt;
    }

    // Create new card debt
    const debtData = {
      name: `${cardName} - Credit Card Debt`,
      type: 'credit_card',
      creditor: cardName,
      originalAmount: initialBalance,
      currentBalance: initialBalance,
      minimumPayment: 0,
      interestRate: 0,
      dueDate: 15,
      startDate: new Date().toISOString().split('T')[0],
      cardId: cardId,
      cardName: cardName
    };

    return this.createDebt(debtData);
  }
}

module.exports = DebtService;

