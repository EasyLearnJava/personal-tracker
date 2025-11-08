const db = require('../db/database');
const Expense = require('../models/Expense');
const DebtService = require('./debtService');
const ActivityLogService = require('./activityLogService');

class ExpenseService {
  // Create a new expense
  static createExpense(expenseData) {
    const expenses = db.readExpenses();
    const expense = new Expense(expenseData);
    const expenseJson = expense.toJSON();
    expenses.push(expenseJson);
    db.writeExpenses(expenses);

    // If expense is on a credit card, update debt
    if (expenseData.paymentMethod === 'credit_card' && expenseData.cardName) {
      console.log('[ExpenseService] Processing credit card expense:', {
        cardName: expenseData.cardName,
        amount: expenseData.amount,
        paymentMethod: expenseData.paymentMethod
      });

      // Find or create debt for this card
      const debts = db.readDebts();
      console.log('[ExpenseService] Available debts:', debts.map(d => ({
        id: d.id,
        creditor: d.creditor,
        cardName: d.cardName,
        type: d.type,
        currentBalance: d.currentBalance
      })));

      // Look for debt by creditor (card name) or cardName field
      let cardDebt = debts.find(d =>
        (d.creditor === expenseData.cardName || d.cardName === expenseData.cardName) &&
        d.type === 'credit_card'
      );

      console.log('[ExpenseService] Found card debt:', cardDebt ? {
        id: cardDebt.id,
        creditor: cardDebt.creditor,
        cardName: cardDebt.cardName,
        currentBalance: cardDebt.currentBalance
      } : 'NOT FOUND');

      if (cardDebt) {
        // Update existing card debt
        console.log('[ExpenseService] Adding expense to existing debt:', cardDebt.id);
        DebtService.addExpenseToDebt(cardDebt.id, parseFloat(expenseData.amount));
      } else {
        // Create new card debt with 0 balance
        console.log('[ExpenseService] Creating new card debt');
        const newDebt = DebtService.createOrUpdateCardDebt(
          expenseData.cardName,
          expenseData.cardName,
          0
        );
        // Add the expense amount to the newly created debt
        if (newDebt && newDebt.id) {
          console.log('[ExpenseService] Adding expense to new debt:', newDebt.id);
          DebtService.addExpenseToDebt(newDebt.id, parseFloat(expenseData.amount));
        }
      }
    }

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

    // Handle credit card debt updates
    // If old expense was on credit card, reduce the debt
    if (oldExpense.paymentMethod === 'credit_card' && oldExpense.cardName) {
      const debts = db.readDebts();
      let cardDebt = debts.find(d =>
        (d.creditor === oldExpense.cardName || d.cardName === oldExpense.cardName) &&
        d.type === 'credit_card'
      );
      if (cardDebt) {
        // Reduce debt by old amount
        DebtService.addExpenseToDebt(cardDebt.id, -parseFloat(oldExpense.amount));
      }
    }

    // If new expense is on credit card, increase the debt
    if (updateData.paymentMethod === 'credit_card' && updateData.cardName) {
      const debts = db.readDebts();
      let cardDebt = debts.find(d =>
        (d.creditor === updateData.cardName || d.cardName === updateData.cardName) &&
        d.type === 'credit_card'
      );
      if (cardDebt) {
        // Add debt by new amount
        DebtService.addExpenseToDebt(cardDebt.id, parseFloat(updateData.amount));
      } else {
        // Create new card debt if it doesn't exist
        const newDebt = DebtService.createOrUpdateCardDebt(
          updateData.cardName,
          updateData.cardName,
          0
        );
        if (newDebt && newDebt.id) {
          DebtService.addExpenseToDebt(newDebt.id, parseFloat(updateData.amount));
        }
      }
    }

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

    // If expense was on credit card, reduce the debt
    if (expense.paymentMethod === 'credit_card' && expense.cardName) {
      const debts = db.readDebts();
      let cardDebt = debts.find(d =>
        (d.creditor === expense.cardName || d.cardName === expense.cardName) &&
        d.type === 'credit_card'
      );
      if (cardDebt) {
        // Reduce debt by expense amount
        DebtService.addExpenseToDebt(cardDebt.id, -parseFloat(expense.amount));
      }
    }

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

