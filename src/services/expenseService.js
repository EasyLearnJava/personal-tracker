const db = require('../db/database');
const Expense = require('../models/Expense');
const ActivityLogService = require('./activityLogService');

class ExpenseService {
  // Create a new expense
  static createExpense(expenseData) {
    const expenses = db.readExpenses();
    const expense = new Expense(expenseData);
    const expenseJson = expense.toJSON();
    expenses.push(expenseJson);
    db.writeExpenses(expenses);



    // Log activity
    ActivityLogService.logExpenseActivity({
      id: expenseJson.id,
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category
    });

    return expenseJson;
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

    const oldExpense = expenses[index];
    const updated = {
      ...oldExpense,
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
    const expenseIndex = expenses.findIndex(e => e.id === id);

    if (expenseIndex === -1) {
      return false; // Not found
    }

    const expense = expenses[expenseIndex];

    const filtered = expenses.filter(e => e.id !== id);
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

