const db = require('../db/database');
const Income = require('../models/Income');

class IncomeService {
  // Create a new income
  static createIncome(incomeData) {
    const incomes = db.readIncome();
    const income = new Income(incomeData);
    incomes.push(income.toJSON());
    db.writeIncome(incomes);
    return income.toJSON();
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

    const updated = {
      ...incomes[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    incomes[index] = updated;
    db.writeIncome(incomes);
    return updated;
  }

  // Delete income
  static deleteIncome(id) {
    const incomes = db.readIncome();
    const filtered = incomes.filter(i => i.id !== id);
    
    if (filtered.length === incomes.length) {
      return false;
    }

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

