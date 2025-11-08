const db = require('../db/database');
const Budget = require('../models/Budget');
const CategoryService = require('./categoryService');

// Category metadata for auto-sync
const getCategoryMetadata = (categoryName) => {
  const metadata = {
    // Income
    "Paycheck": { icon: "💰", color: "#4CAF50" },
    "Business Income": { icon: "💼", color: "#2196F3" },
    "Rental Income": { icon: "🏠", color: "#FF9800" },
    "Stocks": { icon: "📈", color: "#9C27B0" },
    "Interest & Dividends": { icon: "💵", color: "#00BCD4" },
    "Tax Refunds & Cashbacks": { icon: "🎁", color: "#F44336" },
    "Other Income": { icon: "💸", color: "#607D8B" },

    // Business Expenses
    "Flower Purchases": { icon: "🌸", color: "#E91E63" },
    "Uber Delivery": { icon: "🚗", color: "#FF5722" },
    "Others": { icon: "📌", color: "#9E9E9E" },

    // Rental Expenses
    "HOA": { icon: "🏘️", color: "#8BC34A" },
    "Home Insurance": { icon: "🛡️", color: "#3F51B5" },
    "Home Warranty": { icon: "🔧", color: "#009688" },
    "Home Repairs": { icon: "🔨", color: "#FF6F00" },

    // Savings & Investing
    "Emergency Fund": { icon: "🚨", color: "#D32F2F" },
    "Retirement / 401(k)": { icon: "🏦", color: "#1976D2" },
    "Investing / Brokerage": { icon: "📊", color: "#388E3C" },
    "Next Trip / Vacation Fund": { icon: "✈️", color: "#F57C00" },
    "Upskilling / Education": { icon: "📚", color: "#7B1FA2" },
    "Major Purchase (Car / Home)": { icon: "🏡", color: "#C2185B" },
    "Debt Repayment": { icon: "💳", color: "#E64A19" },
    "Charity / Donations": { icon: "❤️", color: "#C62828" },
    "Environmental Causes": { icon: "🌍", color: "#00796B" }
  };

  return metadata[categoryName] || { icon: "📌", color: "#E0BBE4" };
};

// Sync category to Categories tab if it doesn't exist
const syncCategoryToTab = (categoryName) => {
  try {
    const existingCategory = CategoryService.getCategoryByName(categoryName);
    if (!existingCategory) {
      const metadata = getCategoryMetadata(categoryName);
      CategoryService.addCategory({
        name: categoryName,
        icon: metadata.icon,
        color: metadata.color
      });
    }
  } catch (error) {
    console.error('Error syncing category:', error);
  }
};

class BudgetService {
  // Create a new budget
  static createBudget(budgetData) {
    const budgets = db.readBudgets();
    const budget = new Budget(budgetData);
    const budgetJson = budget.toJSON();
    budgets.push(budgetJson);
    db.writeBudgets(budgets);
    return budgetJson;
  }

  // Get all budgets
  static getAllBudgets() {
    return db.readBudgets();
  }

  // Get budget by ID
  static getBudgetById(id) {
    const budgets = db.readBudgets();
    return budgets.find(b => b.id === id);
  }

  // Get budget by month (YYYY-MM format)
  static getBudgetByMonth(month) {
    const budgets = db.readBudgets();
    return budgets.find(b => b.month === month);
  }

  // Get budget by year and month
  static getBudgetByYearMonth(year, month) {
    const budgets = db.readBudgets();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    return budgets.find(b => b.month === monthStr);
  }

  // Update budget
  static updateBudget(id, updateData) {
    const budgets = db.readBudgets();
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...budgets[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    budgets[index] = updated;
    db.writeBudgets(budgets);
    return updated;
  }

  // Delete budget
  static deleteBudget(id) {
    const budgets = db.readBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    
    if (filtered.length === budgets.length) {
      return false;
    }

    db.writeBudgets(filtered);
    return true;
  }

  // Copy budget from one month to another
  static copyBudgetToMonth(sourceBudgetId, targetMonth) {
    const sourceBudget = this.getBudgetById(sourceBudgetId);
    if (!sourceBudget) {
      return null;
    }

    // Check if budget already exists for target month
    const existingBudget = this.getBudgetByMonth(targetMonth);
    if (existingBudget) {
      return null; // Budget already exists for this month
    }

    // Create new budget with copied items (reset actual amounts)
    const newBudgetData = {
      month: targetMonth,
      year: parseInt(targetMonth.split('-')[0]),
      items: sourceBudget.items.map(item => ({
        id: undefined, // Will generate new ID
        category: item.category,
        budgetAmount: item.budgetAmount,
        actualAmount: 0, // Reset actual amount for new month
        notes: item.notes
      })),
      notes: `Copied from ${sourceBudget.month}`,
      isActive: true
    };

    return this.createBudget(newBudgetData);
  }

  // Add budget item
  static addBudgetItem(budgetId, itemData) {
    const budget = this.getBudgetById(budgetId);
    if (!budget) {
      return null;
    }

    // Sync category to Categories tab
    syncCategoryToTab(itemData.category);

    const newItem = {
      id: itemData.id || require('uuid').v4(),
      category: itemData.category,
      group: itemData.group || 'Other',
      budgetAmount: parseFloat(itemData.budgetAmount) || 0,
      actualAmount: parseFloat(itemData.actualAmount) || 0,
      notes: itemData.notes || '',
      createdAt: new Date().toISOString()
    };

    budget.items.push(newItem);
    budget.totalBudget = budget.items.reduce((sum, item) => sum + parseFloat(item.budgetAmount || 0), 0);
    budget.totalSpent = budget.items.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0);
    budget.updatedAt = new Date().toISOString();

    return this.updateBudget(budgetId, budget);
  }

  // Update budget item
  static updateBudgetItem(budgetId, itemId, itemData) {
    const budget = this.getBudgetById(budgetId);
    if (!budget) {
      return null;
    }

    const itemIndex = budget.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return null;
    }

    // If category name is being updated, sync the new category
    if (itemData.category && itemData.category !== budget.items[itemIndex].category) {
      syncCategoryToTab(itemData.category);
    }

    budget.items[itemIndex] = {
      ...budget.items[itemIndex],
      ...itemData,
      updatedAt: new Date().toISOString()
    };

    budget.totalBudget = budget.items.reduce((sum, item) => sum + parseFloat(item.budgetAmount || 0), 0);
    budget.totalSpent = budget.items.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0);
    budget.updatedAt = new Date().toISOString();

    return this.updateBudget(budgetId, budget);
  }

  // Delete budget item
  static deleteBudgetItem(budgetId, itemId) {
    const budget = this.getBudgetById(budgetId);
    if (!budget) {
      return null;
    }

    budget.items = budget.items.filter(i => i.id !== itemId);
    budget.totalBudget = budget.items.reduce((sum, item) => sum + parseFloat(item.budgetAmount || 0), 0);
    budget.totalSpent = budget.items.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0);
    budget.updatedAt = new Date().toISOString();

    return this.updateBudget(budgetId, budget);
  }

  // Get current month budget
  static getCurrentMonthBudget() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;
    return this.getBudgetByMonth(monthStr);
  }

  // Get next month
  static getNextMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    let nextMonth = parseInt(month) + 1;
    let nextYear = parseInt(year);

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  }

  // Get previous month
  static getPreviousMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    let prevMonth = parseInt(month) - 1;
    let prevYear = parseInt(year);

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }
}

module.exports = BudgetService;

