const db = require('../db/database');
const ExpenseService = require('./expenseService');

class ReportService {
  // Helper function to get date range based on period
  static getDateRangeByPeriod(period) {
    const today = new Date();
    let startDate, endDate = today;

    switch (period) {
      case 'weekly':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case 'last_5_years':
        startDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        break;
      case 'all':
        startDate = new Date('2000-01-01');
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }
  // Get summary by category
  static getSummaryByCategory(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const summary = {};

    expenses.forEach(expense => {
      if (!summary[expense.category]) {
        summary[expense.category] = {
          category: expense.category,
          total: 0,
          count: 0,
          percentage: 0
        };
      }
      summary[expense.category].total += parseFloat(expense.amount);
      summary[expense.category].count += 1;
    });

    const grandTotal = Object.values(summary).reduce((sum, item) => sum + item.total, 0);
    
    Object.keys(summary).forEach(key => {
      summary[key].percentage = grandTotal > 0 ? ((summary[key].total / grandTotal) * 100).toFixed(2) : 0;
    });

    return Object.values(summary).sort((a, b) => b.total - a.total);
  }

  // Get summary by payment method
  static getSummaryByPaymentMethod(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const summary = {};

    expenses.forEach(expense => {
      if (!summary[expense.paymentMethod]) {
        summary[expense.paymentMethod] = {
          paymentMethod: expense.paymentMethod,
          total: 0,
          count: 0
        };
      }
      summary[expense.paymentMethod].total += parseFloat(expense.amount);
      summary[expense.paymentMethod].count += 1;
    });

    return Object.values(summary).sort((a, b) => b.total - a.total);
  }

  // Get summary by card
  static getSummaryByCard(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const summary = {};

    expenses.forEach(expense => {
      if (!summary[expense.cardName]) {
        summary[expense.cardName] = {
          cardName: expense.cardName,
          total: 0,
          count: 0
        };
      }
      summary[expense.cardName].total += parseFloat(expense.amount);
      summary[expense.cardName].count += 1;
    });

    return Object.values(summary).sort((a, b) => b.total - a.total);
  }

  // Get daily spending trend
  static getDailySpendingTrend(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const trend = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!trend[date]) {
        trend[date] = 0;
      }
      trend[date] += parseFloat(expense.amount);
    });

    return Object.entries(trend)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Get weekly spending trend
  static getWeeklySpendingTrend(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const trend = {};

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const weekStart = new Date(expenseDate);
      weekStart.setDate(expenseDate.getDate() - expenseDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!trend[weekKey]) {
        trend[weekKey] = 0;
      }
      trend[weekKey] += parseFloat(expense.amount);
    });

    return Object.entries(trend)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  // Get monthly spending trend
  static getMonthlySpendingTrend(year) {
    const expenses = db.readExpenses();
    const trend = {};

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === year) {
        const month = String(expenseDate.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        if (!trend[key]) {
          trend[key] = 0;
        }
        trend[key] += parseFloat(expense.amount);
      }
    });

    return Object.entries(trend)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // Get yearly spending trend
  static getYearlySpendingTrend() {
    const expenses = db.readExpenses();
    const trend = {};

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getFullYear();

      if (!trend[year]) {
        trend[year] = 0;
      }
      trend[year] += parseFloat(expense.amount);
    });

    return Object.entries(trend)
      .map(([year, amount]) => ({ year: parseInt(year), amount }))
      .sort((a, b) => a.year - b.year);
  }

  // Get last 5 years spending trend
  static getLast5YearsSpendingTrend() {
    const expenses = db.readExpenses();
    const trend = {};
    const today = new Date();
    const fiveYearsAgo = today.getFullYear() - 5;

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getFullYear();

      if (year >= fiveYearsAgo) {
        if (!trend[year]) {
          trend[year] = 0;
        }
        trend[year] += parseFloat(expense.amount);
      }
    });

    return Object.entries(trend)
      .map(([year, amount]) => ({ year: parseInt(year), amount }))
      .sort((a, b) => a.year - b.year);
  }

  // Get top expenses
  static getTopExpenses(limit = 10) {
    const expenses = db.readExpenses();
    return expenses
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, limit);
  }

  // Get overall statistics
  static getOverallStatistics(startDate, endDate) {
    const expenses = ExpenseService.getExpensesByDateRange(startDate, endDate);
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const average = expenses.length > 0 ? (total / expenses.length).toFixed(2) : 0;
    const max = expenses.length > 0 ? Math.max(...expenses.map(e => parseFloat(e.amount))) : 0;
    const min = expenses.length > 0 ? Math.min(...expenses.map(e => parseFloat(e.amount))) : 0;

    return {
      total: total.toFixed(2),
      average,
      max,
      min,
      count: expenses.length
    };
  }
}

module.exports = ReportService;

