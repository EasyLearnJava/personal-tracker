const db = require('../db/database');
const Expense = require('../models/Expense');

class ExpenseService {
  // Create a new expense
  static createExpense(expenseData) {
    const expenses = db.readExpenses();
    const expense = new Expense(expenseData);
    expenses.push(expense.toJSON());
    db.writeExpenses(expenses);
    return expense.toJSON();
  }

  // Get all expenses
  static getAllExpenses() {
    return db.readExpenses();
  }

  // Get expense by ID
  static getExpenseById(id) {
    const expenses = db.readExpenses();
    return expenses.find(e => e.id === id);
  }

  // Update expense
  static updateExpense(id, updateData) {
    const expenses = db.readExpenses();
    const index = expenses.findIndex(e => e.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...expenses[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    expenses[index] = updated;
    db.writeExpenses(expenses);
    return updated;
  }

  // Delete expense
  static deleteExpense(id) {
    const expenses = db.readExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    
    if (filtered.length === expenses.length) {
      return false; // Not found
    }

    db.writeExpenses(filtered);
    return true;
  }

  // Get expenses by date range
  static getExpensesByDateRange(startDate, endDate) {
    const expenses = db.readExpenses();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  // Get expenses by category
  static getExpensesByCategory(category) {
    const expenses = db.readExpenses();
    return expenses.filter(e => e.category === category);
  }

  // Get expenses by payment method
  static getExpensesByPaymentMethod(paymentMethod) {
    const expenses = db.readExpenses();
    return expenses.filter(e => e.paymentMethod === paymentMethod);
  }

  // Get expenses by card
  static getExpensesByCard(cardName) {
    const expenses = db.readExpenses();
    return expenses.filter(e => e.cardName === cardName);
  }

  // Get total expenses
  static getTotalExpenses() {
    const expenses = db.readExpenses();
    return expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  }

  // Get expenses by frequency
  static getExpensesByFrequency(frequency) {
    const expenses = db.readExpenses();
    return expenses.filter(e => e.frequency === frequency);
  }
}

module.exports = ExpenseService;

