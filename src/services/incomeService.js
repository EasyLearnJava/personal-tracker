const db = require('../db/database');
const Income = require('../models/Income');
const BankAccountService = require('./bankAccountService');
const ActivityLogService = require('./activityLogService');

class IncomeService {
  // Create a new income
  static createIncome(incomeData) {
    const incomes = db.readIncome();
    const income = new Income(incomeData);
    const incomeJson = income.toJSON();
    incomes.push(incomeJson);
    db.writeIncome(incomes);

    // If bank account is specified, deposit the income
    if (incomeData.bankAccountId) {
      BankAccountService.addToAccount(incomeData.bankAccountId, parseFloat(incomeData.amount));
    }

    // Log activity
    ActivityLogService.logIncomeActivity({
      id: incomeJson.id,
      source: incomeData.source,
      amount: incomeData.amount
    });

    return incomeJson;
  }

  // Get all income
  static getAllIncome() {
    return db.readIncome();
  }

  // Get income by ID
  static getIncomeById(id) {
    const incomes = db.readIncome();
    return incomes.find(i => i.id === id);
  }

  // Update income
  static updateIncome(id, updateData) {
    const incomes = db.readIncome();
    const index = incomes.findIndex(i => i.id === id);

    if (index === -1) {
      return null;
    }

    const oldIncome = incomes[index];
    const updated = {
      ...oldIncome,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Handle bank account updates
    // If old income was deposited to a bank account, reduce the balance
    if (oldIncome.bankAccountId) {
      BankAccountService.addToAccount(oldIncome.bankAccountId, -parseFloat(oldIncome.amount));
    }

    // If new income is deposited to a bank account, increase the balance
    if (updateData.bankAccountId) {
      BankAccountService.addToAccount(updateData.bankAccountId, parseFloat(updateData.amount));
    }

    incomes[index] = updated;
    db.writeIncome(incomes);
    return updated;
  }

  // Delete income
  static deleteIncome(id) {
    const incomes = db.readIncome();
    const incomeIndex = incomes.findIndex(i => i.id === id);

    if (incomeIndex === -1) {
      return false;
    }

    const income = incomes[incomeIndex];

    // If income was deposited to a bank account, reduce the balance
    if (income.bankAccountId) {
      BankAccountService.addToAccount(income.bankAccountId, -parseFloat(income.amount));
    }

    const filtered = incomes.filter(i => i.id !== id);
    db.writeIncome(filtered);
    return true;
  }

  // Get income by date range
  static getIncomeByDateRange(startDate, endDate) {
    const incomes = db.readIncome();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return incomes.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate >= start && incomeDate <= end;
    });
  }

  // Get income by source
  static getIncomeBySource(source) {
    const incomes = db.readIncome();
    return incomes.filter(i => i.source === source);
  }

  // Get total income
  static getTotalIncome() {
    const incomes = db.readIncome();
    return incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  }

  // Get total income by date range
  static getTotalIncomeByDateRange(startDate, endDate) {
    const incomes = this.getIncomeByDateRange(startDate, endDate);
    return incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  }

  // Get income summary by source
  static getIncomeSummaryBySource(startDate, endDate) {
    const incomes = this.getIncomeByDateRange(startDate, endDate);
    const summary = {};

    incomes.forEach(income => {
      if (!summary[income.source]) {
        summary[income.source] = {
          source: income.source,
          total: 0,
          count: 0
        };
      }
      summary[income.source].total += parseFloat(income.amount);
      summary[income.source].count += 1;
    });

    return Object.values(summary).sort((a, b) => b.total - a.total);
  }
}

module.exports = IncomeService;

