const API_BASE = '/api';

class ExpenseAPI {
  // ==================== AUTHENTICATION ====================

  static async register(email, password, fullName = '') {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    return response.json();
  }

  static async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  static async logout() {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  static async getCurrentUser() {
    const response = await fetch(`${API_BASE}/auth/me`);
    return response.json();
  }

  static async verifyToken(token) {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  }

  static async updateProfile(userId, updates) {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates })
    });
    return response.json();
  }

  // Expenses
  static async getExpenses() {
    const response = await fetch(`${API_BASE}/expenses`);
    return response.json();
  }

  static async getExpenseById(id) {
    const response = await fetch(`${API_BASE}/expenses/${id}`);
    return response.json();
  }

  static async createExpense(data) {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updateExpense(id, data) {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async deleteExpense(id) {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  static async getExpensesByDateRange(startDate, endDate) {
    const response = await fetch(`${API_BASE}/expenses/filter/daterange?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  // Categories
  static async getCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    return response.json();
  }

  static async addCategory(data) {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Reports
  static async getCategorySummary(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/summary/category?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getPaymentSummary(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/summary/payment?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getCardSummary(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/summary/card?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getDailyTrend(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/trend/daily?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getMonthlyTrend(year) {
    const response = await fetch(`${API_BASE}/reports/trend/monthly?year=${year}`);
    return response.json();
  }

  static async getTopExpenses(limit = 10) {
    const response = await fetch(`${API_BASE}/reports/top?limit=${limit}`);
    return response.json();
  }

  static async getStatistics(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/statistics?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getWeeklyTrend(startDate, endDate) {
    const response = await fetch(`${API_BASE}/reports/trend/weekly?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }

  static async getYearlyTrend() {
    const response = await fetch(`${API_BASE}/reports/trend/yearly`);
    return response.json();
  }

  static async getLast5YearsTrend() {
    const response = await fetch(`${API_BASE}/reports/trend/last-5-years`);
    return response.json();
  }

  static async getSummaryByPeriod(period) {
    const response = await fetch(`${API_BASE}/reports/summary/by-period?period=${period}`);
    return response.json();
  }

  // Income
  static async getIncome() {
    const response = await fetch(`${API_BASE}/income`);
    return response.json();
  }

  static async getIncomeById(id) {
    const response = await fetch(`${API_BASE}/income/${id}`);
    return response.json();
  }

  static async createIncome(data) {
    const response = await fetch(`${API_BASE}/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updateIncome(id, data) {
    const response = await fetch(`${API_BASE}/income/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async deleteIncome(id) {
    const response = await fetch(`${API_BASE}/income/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Payment Methods
  static async getPaymentMethods() {
    const response = await fetch(`${API_BASE}/payment-methods`);
    return response.json();
  }

  static async createPaymentMethod(data) {
    const response = await fetch(`${API_BASE}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updatePaymentMethod(id, data) {
    const response = await fetch(`${API_BASE}/payment-methods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async deletePaymentMethod(id) {
    const response = await fetch(`${API_BASE}/payment-methods/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Cards
  static async getCards() {
    const response = await fetch(`${API_BASE}/cards`);
    return response.json();
  }

  static async createCard(data) {
    const response = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updateCard(id, data) {
    const response = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async deleteCard(id) {
    const response = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Debts
  static async getDebts() {
    const response = await fetch(`${API_BASE}/debts`);
    return response.json();
  }

  static async getActiveDebts() {
    const response = await fetch(`${API_BASE}/debts/active`);
    return response.json();
  }

  static async getDebtById(id) {
    const response = await fetch(`${API_BASE}/debts/${id}`);
    return response.json();
  }

  static async createDebt(data) {
    const response = await fetch(`${API_BASE}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updateDebt(id, data) {
    const response = await fetch(`${API_BASE}/debts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async deleteDebt(id) {
    const response = await fetch(`${API_BASE}/debts/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  static async getDebtsByType(type) {
    const response = await fetch(`${API_BASE}/debts/type/${type}`);
    return response.json();
  }

  static async getDebtsByCard(cardId) {
    const response = await fetch(`${API_BASE}/debts/card/${cardId}`);
    return response.json();
  }

  static async getDebtSummary() {
    const response = await fetch(`${API_BASE}/debts/summary/all`);
    return response.json();
  }

  static async makeDebtPayment(debtId, amount) {
    const response = await fetch(`${API_BASE}/debts/${debtId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return response.json();
  }

  static async addExpenseToDebt(debtId, amount) {
    const response = await fetch(`${API_BASE}/debts/${debtId}/add-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return response.json();
  }

  // Get debts by card ID
  static async getDebtsByCard(cardId) {
    const response = await fetch(`${API_BASE}/debts/card/${cardId}`);
    return response.json();
  }

  // Get total debt for a card
  static async getCardTotalDebt(cardId) {
    const response = await fetch(`${API_BASE}/debts/card/${cardId}/total`);
    return response.json();
  }

  // Get all card debts with totals
  static async getAllCardDebts() {
    const response = await fetch(`${API_BASE}/debts/cards/all/summary`);
    return response.json();
  }

  // Create or update card debt
  static async initializeCardDebt(cardId, cardName, initialBalance = 0) {
    const response = await fetch(`${API_BASE}/debts/card/${cardId}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardName, initialBalance })
    });
    return response.json();
  }
}

