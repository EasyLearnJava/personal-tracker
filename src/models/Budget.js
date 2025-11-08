const { v4: uuidv4 } = require('uuid');

class Budget {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.month = data.month; // Format: YYYY-MM (e.g., "2025-11")
    this.year = data.year; // e.g., 2025
    this.items = data.items || []; // Array of budget items
    this.totalBudget = data.totalBudget || 0;
    this.totalSpent = data.totalSpent || 0;
    this.notes = data.notes || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      month: this.month,
      year: this.year,
      items: this.items,
      totalBudget: this.totalBudget,
      totalSpent: this.totalSpent,
      notes: this.notes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  addItem(item) {
    this.items.push({
      id: item.id || uuidv4(),
      category: item.category, // e.g., "Mortgage", "Insurance - Home", "Insurance - Car", "Electricity"
      group: item.group || 'Other', // Category group for organization
      budgetAmount: parseFloat(item.budgetAmount) || 0,
      actualAmount: parseFloat(item.actualAmount) || 0,
      notes: item.notes || '',
      createdAt: item.createdAt || new Date().toISOString()
    });
    this.updateTotals();
  }

  updateItem(itemId, updates) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      this.updateTotals();
    }
  }

  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.updateTotals();
  }

  updateTotals() {
    this.totalBudget = this.items.reduce((sum, item) => sum + parseFloat(item.budgetAmount || 0), 0);
    this.totalSpent = this.items.reduce((sum, item) => sum + parseFloat(item.actualAmount || 0), 0);
  }

  getRemainingBudget() {
    return this.totalBudget - this.totalSpent;
  }

  getPercentageSpent() {
    if (this.totalBudget === 0) return 0;
    return (this.totalSpent / this.totalBudget) * 100;
  }

  getItemPercentageSpent(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || item.budgetAmount === 0) return 0;
    return (item.actualAmount / item.budgetAmount) * 100;
  }
}

module.exports = Budget;

