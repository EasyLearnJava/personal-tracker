const API_BASE = '/api';

class ExpenseAPI {
  // ==================== HELPER METHODS ====================

  /**
   * Get headers with user ID for authenticated requests
   */
  static getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = { 'Content-Type': 'application/json' };
    if (user && user.id) {
      headers['x-user-id'] = user.id;
    }
    return headers;
  }

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
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return errorData;
      }

      const data = await response.json();
      console.log('Login successful:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.'
      };
    }
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



  // ==================== TASKS ====================

  // Get all tasks
  static async getTasks() {
    const response = await fetch(`${API_BASE}/tasks`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Get task by ID
  static async getTaskById(id) {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Create task
  static async createTask(data) {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create task failed:', errorData);
        return { success: false, error: errorData.error || 'Failed to create task' };
      }

      const result = await response.json();
      console.log('Task created successfully:', result);
      return result;
    } catch (error) {
      console.error('Create task error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  // Update task
  static async updateTask(id, data) {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update task failed:', errorData);
        return { success: false, error: errorData.error || 'Failed to update task' };
      }

      const result = await response.json();
      console.log('Task updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Update task error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  // Delete task
  static async deleteTask(id) {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Get tasks by status
  static async getTasksByStatus(status) {
    const response = await fetch(`${API_BASE}/tasks/filter/status?status=${status}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Get tasks by priority
  static async getTasksByPriority(priority) {
    const response = await fetch(`${API_BASE}/tasks/filter/priority?priority=${priority}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Get overdue tasks
  static async getOverdueTasks() {
    const response = await fetch(`${API_BASE}/tasks/filter/overdue`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Get task statistics
  static async getTaskStatistics() {
    const response = await fetch(`${API_BASE}/tasks/stats/summary`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Update task status
  static async updateTaskStatus(id, status) {
    const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  // ==================== USERS ====================

  // Get all users for task assignment
  static async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) {
        console.error('Failed to fetch users');
        return [];
      }
      const data = await response.json();
      console.log('Users fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // ==================== PAYMENT HISTORY ====================

  // Get all payment history
  static async getPaymentHistory() {
    const response = await fetch(`${API_BASE}/payment-history`);
    return response.json();
  }

  // Get payment history by debt ID
  static async getPaymentHistoryByDebt(debtId) {
    const response = await fetch(`${API_BASE}/payment-history/debt/${debtId}`);
    return response.json();
  }

  // Get recent payments
  static async getRecentPayments(limit = 10) {
    const response = await fetch(`${API_BASE}/payment-history/recent/${limit}`);
    return response.json();
  }

  // Get payment statistics
  static async getPaymentStatistics() {
    const response = await fetch(`${API_BASE}/payment-history/stats/all`);
    return response.json();
  }

  // ==================== BANK ACCOUNTS ====================

  // Get all bank accounts
  static async getBankAccounts() {
    const response = await fetch(`${API_BASE}/bank-accounts`);
    return response.json();
  }

  // Get active bank accounts
  static async getActiveBankAccounts() {
    const response = await fetch(`${API_BASE}/bank-accounts/active/list`);
    return response.json();
  }

  // Get bank account by ID
  static async getBankAccountById(id) {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`);
    return response.json();
  }

  // Get total balance
  static async getTotalBalance() {
    const response = await fetch(`${API_BASE}/bank-accounts/balance/total`);
    return response.json();
  }

  // Create bank account
  static async createBankAccount(accountData) {
    const response = await fetch(`${API_BASE}/bank-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    return response.json();
  }

  // Update bank account
  static async updateBankAccount(id, accountData) {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    return response.json();
  }

  // Deduct from account
  static async deductFromAccount(id, amount) {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return response.json();
  }

  // Add to account
  static async addToAccount(id, amount) {
    const response = await fetch(`${API_BASE}/bank-accounts/${id}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return response.json();
  }

  // ==================== ACTIVITY LOG ====================

  // Get all activity logs
  static async getActivityLogs() {
    const response = await fetch(`${API_BASE}/activity-log`);
    return response.json();
  }

  // Get recent activity logs
  static async getRecentActivityLogs(limit = 20) {
    const response = await fetch(`${API_BASE}/activity-log/recent/${limit}`);
    return response.json();
  }

  // Get activity statistics
  static async getActivityStatistics() {
    const response = await fetch(`${API_BASE}/activity-log/stats/all`);
    return response.json();
  }

  // Get activity logs by type
  static async getActivityLogsByType(type) {
    const response = await fetch(`${API_BASE}/activity-log/type/${type}`);
    return response.json();
  }

  // ==================== BUDGET METHODS ====================

  // Get all budgets
  static async getBudgets() {
    const response = await fetch(`${API_BASE}/budgets`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    return data.data || [];
  }

  // Get budget by ID
  static async getBudgetById(id) {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    return data.data;
  }

  // Get budget by month
  static async getBudgetByMonth(month) {
    const response = await fetch(`${API_BASE}/budgets/month/${month}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    return data.data;
  }

  // Create budget
  static async createBudget(budgetData) {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });
    const data = await response.json();
    return data.data;
  }

  // Update budget
  static async updateBudget(id, budgetData) {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(budgetData)
    });
    const data = await response.json();
    return data.data;
  }

  // Delete budget
  static async deleteBudget(id) {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Copy budget to another month
  static async copyBudget(id, targetMonth) {
    const response = await fetch(`${API_BASE}/budgets/${id}/copy`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ targetMonth })
    });
    const data = await response.json();
    return data.data;
  }

  // Add budget item
  static async addBudgetItem(budgetId, itemData) {
    const response = await fetch(`${API_BASE}/budgets/${budgetId}/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    const data = await response.json();
    return data.data;
  }

  // Update budget item
  static async updateBudgetItem(budgetId, itemId, itemData) {
    const response = await fetch(`${API_BASE}/budgets/${budgetId}/items/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    const data = await response.json();
    return data.data;
  }

  // Delete budget item
  static async deleteBudgetItem(budgetId, itemId) {
    const response = await fetch(`${API_BASE}/budgets/${budgetId}/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }
}

