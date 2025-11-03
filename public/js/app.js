// ==================== AUTHENTICATION MANAGER ====================
class AuthManager {
  static currentUser = null;
  static accessToken = null;

  static async init() {
    // Check if user is already logged in
    const user = await this.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.showApp();
    } else {
      this.showLoginPage();
    }
  }

  static async register(email, password, fullName) {
    try {
      const result = await ExpenseAPI.register(email, password, fullName);
      if (result.success) {
        UI.showNotification('Registration successful! Please login.', 'success');
        this.switchToLogin();
        return true;
      } else {
        UI.showNotification(result.error || 'Registration failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      UI.showNotification('Registration failed', 'error');
      return false;
    }
  }

  static async login(email, password) {
    try {
      const result = await ExpenseAPI.login(email, password);
      if (result.success) {
        this.currentUser = result.user;
        this.accessToken = result.accessToken;
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        UI.showNotification('Login successful!', 'success');
        this.showApp();
        return true;
      } else {
        UI.showNotification(result.error || 'Login failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      UI.showNotification('Login failed', 'error');
      return false;
    }
  }

  static async logout() {
    try {
      await ExpenseAPI.logout();
      this.currentUser = null;
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      this.showLoginPage();
      UI.showNotification('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      UI.showNotification('Logout failed', 'error');
    }
  }

  static async getCurrentUser() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const result = await ExpenseAPI.getCurrentUser();
      if (result.success) {
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static showLoginPage() {
    document.getElementById('login-page').classList.add('active');
    document.querySelector('.app-container').style.display = 'none';
  }

  static showApp() {
    document.getElementById('login-page').classList.remove('active');
    document.querySelector('.app-container').style.display = 'flex';
    if (this.currentUser) {
      document.getElementById('user-name').textContent = this.currentUser.full_name || this.currentUser.email;
    }
  }

  static switchToLogin() {
    document.querySelector('[data-tab="login"]').classList.add('active');
    document.querySelector('[data-tab="register"]').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
  }

  static switchToRegister() {
    document.querySelector('[data-tab="register"]').classList.add('active');
    document.querySelector('[data-tab="login"]').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
  }
}

class ExpenseTrackerApp {
  constructor() {
    this.expenses = [];
    this.categories = [];
    this.income = [];
    this.paymentMethods = [];
    this.cards = [];
    this.debts = [];
    this.charts = {};
    this.currentEditingId = null;
    this.currentEditingType = null;
    this.dashboardPeriod = 'monthly';
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadData();
    this.loadDashboard();
  }

  async loadData() {
    try {
      this.expenses = await ExpenseAPI.getExpenses();
      this.categories = await ExpenseAPI.getCategories();
      this.income = await ExpenseAPI.getIncome();
      this.paymentMethods = await ExpenseAPI.getPaymentMethods();
      this.cards = await ExpenseAPI.getCards();
      this.debts = await ExpenseAPI.getDebts();
      this.populateCategorySelects();
      this.populatePaymentMethodSelects();
      this.populateCardSelects();
    } catch (error) {
      console.error('Error loading data:', error);
      UI.showNotification('Error loading data', 'error');
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        UI.switchView(view);
        this.loadView(view);
      });
    });

    // Add expense button
    document.getElementById('add-expense-btn').addEventListener('click', () => {
      this.currentEditingId = null;
      this.currentEditingType = 'expense';
      document.getElementById('modal-title').textContent = 'Add Expense';
      document.getElementById('expense-form').reset();
      // Set date to today in local timezone (not UTC)
      const today = new Date();
      const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      document.getElementById('expense-date').value = localDate.toISOString().split('T')[0];
      UI.showModal('expense-modal');
    });

    // Add category button
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.currentEditingId = null;
      this.currentEditingType = 'category';
      document.getElementById('category-modal-title').textContent = 'Add Category';
      document.getElementById('category-form').reset();
      UI.showModal('category-modal');
    });

    // Add income button
    document.getElementById('add-income-btn').addEventListener('click', () => {
      this.currentEditingId = null;
      this.currentEditingType = 'income';
      document.getElementById('income-modal-title').textContent = 'Add Income';
      document.getElementById('income-form').reset();
      // Set date to today in local timezone (not UTC)
      const today = new Date();
      const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      document.getElementById('income-date').value = localDate.toISOString().split('T')[0];
      UI.showModal('income-modal');
    });

    // Add payment method button
    document.getElementById('add-payment-method-btn').addEventListener('click', () => {
      this.currentEditingId = null;
      this.currentEditingType = 'payment-method';
      document.getElementById('payment-method-modal-title').textContent = 'Add Payment Method';
      document.getElementById('payment-method-form').reset();
      UI.showModal('payment-method-modal');
    });

    // Add card button
    document.getElementById('add-card-btn').addEventListener('click', () => {
      this.currentEditingId = null;
      this.currentEditingType = 'card';
      document.getElementById('card-modal-title').textContent = 'Add Card';
      document.getElementById('card-form').reset();
      UI.showModal('card-modal');
    });

    // Add debt button
    document.getElementById('add-debt-btn').addEventListener('click', () => {
      this.openDebtModal();
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        UI.hideModal(modal.id);
      });
    });

    // Form submissions
    document.getElementById('expense-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveExpense();
    });

    document.getElementById('category-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    document.getElementById('income-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveIncome();
    });

    document.getElementById('payment-method-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePaymentMethod();
    });

    document.getElementById('card-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCard();
    });

    // Filters
    document.getElementById('apply-filters').addEventListener('click', () => {
      this.loadExpensesView();
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      document.getElementById('filter-start-date').value = '';
      document.getElementById('filter-end-date').value = '';
      document.getElementById('filter-category').value = '';
      document.getElementById('filter-payment').value = '';
      this.loadExpensesView();
    });

    // Dashboard filter
    document.getElementById('dashboard-filter-period').addEventListener('change', () => {
      this.loadDashboard();
    });

    // Reports filter
    document.getElementById('reports-filter-period').addEventListener('change', () => {
      this.loadReportsView();
    });

    // Income filter
    document.getElementById('income-filter-period').addEventListener('change', () => {
      this.loadIncomeView();
    });

    // Settings buttons
    document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
    document.getElementById('export-csv-btn').addEventListener('click', () => this.exportCSV());
    document.getElementById('import-data-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
    document.getElementById('reset-data-btn').addEventListener('click', () => this.resetAllData());

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          UI.hideModal(modal.id);
        }
      });
    });

    // Modal cancel buttons
    document.getElementById('modal-cancel').addEventListener('click', () => {
      UI.hideModal('expense-modal');
    });

    // ==================== AUTHENTICATION EVENT LISTENERS ====================
    // Note: Auth event listeners are now set up globally in setupAuthEventListeners()
    // This ensures they work on the login page before the app is initialized
  }

  populateCategorySelects() {
    const categorySelect = document.getElementById('expense-category');
    const filterSelect = document.getElementById('filter-category');
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    filterSelect.innerHTML = '<option value="">All Categories</option>';

    this.categories.forEach(cat => {
      const option1 = document.createElement('option');
      option1.value = cat.id;
      option1.textContent = `${cat.icon} ${cat.name}`;
      categorySelect.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = cat.id;
      option2.textContent = `${cat.icon} ${cat.name}`;
      filterSelect.appendChild(option2);
    });
  }

  populatePaymentMethodSelects() {
    const paymentSelect = document.getElementById('expense-payment');
    paymentSelect.innerHTML = '<option value="">Select Payment Method</option>';

    this.paymentMethods.forEach(method => {
      const option = document.createElement('option');
      option.value = method.id;
      option.textContent = `${method.icon} ${method.name}`;
      paymentSelect.appendChild(option);
    });
  }

  populateCardSelects() {
    const cardSelect = document.getElementById('expense-card');
    cardSelect.innerHTML = '<option value="">Select Card/Account</option>';

    this.cards.forEach(card => {
      const option = document.createElement('option');
      option.value = card.name;
      option.textContent = `${card.name} (${card.provider}) •••• ${card.lastFourDigits || '****'}`;
      option.title = `${card.bankName || 'Bank'} - ${card.cardType}`;
      cardSelect.appendChild(option);
    });

    // Add Cash option
    const cashOption = document.createElement('option');
    cashOption.value = 'Cash';
    cashOption.textContent = '💵 Cash';
    cardSelect.appendChild(cashOption);
  }

  async loadView(viewName) {
    switch (viewName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'expenses':
        this.loadExpensesView();
        break;
      case 'reports':
        this.loadReportsView();
        break;
      case 'categories':
        this.loadCategoriesView();
        break;
      case 'income':
        this.loadIncomeView();
        break;
      case 'payment-methods':
        this.loadPaymentMethodsView();
        break;
      case 'cards':
        this.loadCardsView();
        break;
      case 'debts':
        this.loadDebtsView();
        break;
      case 'settings':
        this.loadSettingsView();
        break;
    }
  }

  // Helper method to get date range based on filter period
  getDateRangeByPeriod(period = 'current_month') {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    let start, end;

    switch (period) {
      case 'current_week': {
        const day = today.getDay();
        const diff = today.getDate() - day;
        start = new Date(today.setDate(diff));
        end = new Date(endOfToday);
        break;
      }
      case 'past_week': {
        end = new Date(today);
        end.setDate(end.getDate() - 1);
        start = new Date(end);
        start.setDate(start.getDate() - 6);
        break;
      }
      case 'current_month': {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(endOfToday);
        break;
      }
      case 'past_month': {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        break;
      }
      case 'current_year': {
        start = startOfYear;
        end = new Date(endOfToday);
        break;
      }
      case 'past_year': {
        const lastYear = today.getFullYear() - 1;
        start = new Date(lastYear, 0, 1);
        end = new Date(lastYear, 11, 31);
        break;
      }
      case 'past_5_years': {
        start = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        end = new Date(endOfToday);
        break;
      }
      case 'all':
      default: {
        start = new Date(2000, 0, 1);
        end = new Date(endOfToday);
        break;
      }
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  async loadDashboard() {
    const period = document.getElementById('dashboard-filter-period').value || 'current_month';
    const dateRange = this.getDateRangeByPeriod(period);

    try {
      const stats = await ExpenseAPI.getStatistics(dateRange.start, dateRange.end);
      document.getElementById('total-spent').textContent = UI.formatCurrency(stats.total);
      document.getElementById('avg-expense').textContent = UI.formatCurrency(stats.average);
      document.getElementById('max-expense').textContent = UI.formatCurrency(stats.max);
      document.getElementById('min-expense').textContent = UI.formatCurrency(stats.min);

      await this.loadCharts(dateRange.start, dateRange.end);
      this.loadUpcomingExpenses();
      this.loadUpcomingIncome();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  loadUpcomingExpenses() {
    const recurringExpenses = this.expenses.filter(e => e.isRecurring);
    const upcomingList = document.getElementById('upcoming-expenses-list');

    if (recurringExpenses.length === 0) {
      upcomingList.innerHTML = '<div class="upcoming-empty"><p>No upcoming recurring expenses</p></div>';
      return;
    }

    upcomingList.innerHTML = recurringExpenses
      .slice(0, 5)
      .map(expense => {
        const category = this.categories.find(c => c.id === expense.category);
        const nextDate = this.calculateNextOccurrence(expense.date, expense.frequency);
        return `
          <div class="upcoming-item">
            <div class="upcoming-item-left">
              <div class="upcoming-item-title">${category ? category.icon : '📌'} ${expense.description || 'Expense'}</div>
              <div class="upcoming-item-date">Next: ${UI.formatDate(nextDate)}</div>
            </div>
            <div class="upcoming-item-amount">${UI.formatCurrency(expense.amount)}</div>
          </div>
        `;
      })
      .join('');
  }

  loadUpcomingIncome() {
    const recurringIncome = this.income.filter(i => i.isRecurring);
    const upcomingList = document.getElementById('upcoming-income-list');

    if (recurringIncome.length === 0) {
      upcomingList.innerHTML = '<div class="upcoming-empty"><p>No upcoming recurring income</p></div>';
      return;
    }

    upcomingList.innerHTML = recurringIncome
      .slice(0, 5)
      .map(income => {
        const nextDate = this.calculateNextOccurrence(income.date, income.frequency);
        return `
          <div class="upcoming-item">
            <div class="upcoming-item-left">
              <div class="upcoming-item-title">💰 ${income.source}</div>
              <div class="upcoming-item-date">Next: ${UI.formatDate(nextDate)}</div>
            </div>
            <div class="upcoming-item-amount">${UI.formatCurrency(income.amount)}</div>
          </div>
        `;
      })
      .join('');
  }

  calculateNextOccurrence(lastDate, frequency) {
    const date = new Date(lastDate);
    const today = new Date();

    while (date <= today) {
      switch (frequency) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
        default:
          return date;
      }
    }

    return date;
  }

  async loadCharts(startDate, endDate) {
    try {
      const categorySummary = await ExpenseAPI.getCategorySummary(startDate, endDate);
      this.renderCategoryChart(categorySummary);

      const paymentSummary = await ExpenseAPI.getPaymentSummary(startDate, endDate);
      this.renderPaymentChart(paymentSummary);

      const monthlyTrend = await ExpenseAPI.getMonthlyTrend(new Date().getFullYear());
      this.renderTrendChart(monthlyTrend);
    } catch (error) {
      console.error('Error loading charts:', error);
    }
  }

  renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (this.charts.category) {
      this.charts.category.destroy();
    }

    this.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => {
          const cat = this.categories.find(c => c.id === d.category);
          return cat ? `${cat.icon} ${cat.name}` : 'Unknown';
        }),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: [
            '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
            '#A8E6CF', '#FF8B94', '#C7CEEA', '#B5EAD7',
            '#FFDAC1', '#E0BBE4'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderPaymentChart(data) {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    
    if (this.charts.payment) {
      this.charts.payment.destroy();
    }

    this.charts.payment = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.paymentMethod),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (this.charts.trend) {
      this.charts.trend.destroy();
    }

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Monthly Spending',
          data: data.map(d => d.amount),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  async loadExpensesView() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const category = document.getElementById('filter-category').value;
    const payment = document.getElementById('filter-payment').value;

    let expenses = this.expenses;

    if (startDate && endDate) {
      expenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate >= new Date(startDate) && expDate <= new Date(endDate);
      });
    }

    if (category) {
      expenses = expenses.filter(e => e.category == category);
    }

    if (payment) {
      expenses = expenses.filter(e => e.paymentMethod === payment);
    }

    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(e => UI.renderExpenseItem(e, this.categories))
      .join('');
  }

  async loadReportsView() {
    const period = document.getElementById('reports-filter-period').value || 'current_month';
    const dateRange = this.getDateRangeByPeriod(period);

    try {
      const categorySummary = await ExpenseAPI.getCategorySummary(dateRange.start, dateRange.end);
      const paymentSummary = await ExpenseAPI.getPaymentSummary(dateRange.start, dateRange.end);
      const cardSummary = await ExpenseAPI.getCardSummary(dateRange.start, dateRange.end);

      document.getElementById('category-report').innerHTML = categorySummary
        .map(item => {
          const cat = this.categories.find(c => c.id === item.category);
          return UI.renderReportRow(
            `${cat ? cat.icon : '📌'} ${cat ? cat.name : 'Unknown'}`,
            item.total,
            item.percentage
          );
        })
        .join('');

      document.getElementById('payment-report').innerHTML = paymentSummary
        .map(item => UI.renderReportRow(item.paymentMethod, item.total))
        .join('');

      document.getElementById('card-report').innerHTML = cardSummary
        .map(item => UI.renderReportRow(item.cardName || 'Unknown', item.total))
        .join('');
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  async loadCategoriesView() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = this.categories
      .map(cat => `
        <div class="category-card">
          <div class="category-icon">${cat.icon}</div>
          <div class="category-name">${cat.name}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px;">${cat.color}</div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" style="flex: 1; padding: 8px;" onclick="app.editCategory('${cat.id}')">Edit</button>
            <button class="btn btn-secondary" style="flex: 1; padding: 8px; background: #ef4444; color: white;" onclick="app.deleteCategory('${cat.id}')">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  async loadIncomeView() {
    const period = document.getElementById('income-filter-period').value || 'current_month';
    const dateRange = this.getDateRangeByPeriod(period);

    let incomeList = this.income;

    // Filter by date range
    incomeList = incomeList.filter(inc => {
      const incDate = new Date(inc.date);
      return incDate >= new Date(dateRange.start) && incDate <= new Date(dateRange.end);
    });

    const incomeListElement = document.getElementById('income-list');
    incomeListElement.innerHTML = incomeList
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(inc => `
        <div class="income-item">
          <div class="income-item-header">
            <div class="income-source">💰 ${inc.source}</div>
            <div class="income-amount">${UI.formatCurrency(inc.amount)}</div>
          </div>
          <div class="income-details">
            <p>${UI.formatDate(inc.date)} • ${inc.frequency}</p>
            ${inc.description ? `<p>${inc.description}</p>` : ''}
          </div>
          <div class="income-actions">
            <button class="btn btn-secondary" style="flex: 1;" onclick="app.editIncome('${inc.id}')">Edit</button>
            <button class="btn btn-secondary" style="flex: 1; background: #ef4444; color: white;" onclick="app.deleteIncome('${inc.id}')">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  async loadPaymentMethodsView() {
    const methodsList = document.getElementById('payment-methods-list');
    methodsList.innerHTML = this.paymentMethods
      .map(method => `
        <div class="payment-method-item">
          <div class="payment-method-icon">${method.icon}</div>
          <div class="payment-method-name">${method.name}</div>
          <div class="payment-method-type">${method.type}</div>
          <div class="payment-method-actions">
            <button class="btn btn-secondary" style="flex: 1;" onclick="app.editPaymentMethod('${method.id}')">Edit</button>
            <button class="btn btn-secondary" style="flex: 1; background: #ef4444; color: white;" onclick="app.deletePaymentMethod('${method.id}')">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  async loadCardsView() {
    const cardsList = document.getElementById('cards-list');
    cardsList.innerHTML = this.cards
      .map(card => `
        <div class="card-item">
          <div class="card-item-header">
            <div>
              <div class="card-name">${card.name}</div>
              <div class="card-provider">${card.provider}</div>
            </div>
          </div>
          <div class="card-details">
            <p>${card.bankName || 'Bank'} • ${card.cardType}</p>
            <p>Expires: ${card.expiryDate || 'N/A'}</p>
          </div>
          <div class="card-last-four">•••• ${card.lastFourDigits || '****'}</div>
          <div class="card-actions">
            <button class="edit-btn" style="flex: 1;" onclick="app.editCard('${card.id}')">Edit</button>
            <button class="delete-btn" style="flex: 1;" onclick="app.deleteCard('${card.id}')">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  async saveExpense() {
    const expenseData = {
      amount: parseFloat(document.getElementById('expense-amount').value),
      category: parseInt(document.getElementById('expense-category').value),
      description: document.getElementById('expense-description').value,
      date: document.getElementById('expense-date').value,
      paymentMethod: document.getElementById('expense-payment').value,
      cardName: document.getElementById('expense-card').value,
      frequency: document.getElementById('expense-frequency').value,
      isRecurring: document.getElementById('expense-recurring').checked,
      notes: document.getElementById('expense-notes').value
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updateExpense(this.currentEditingId, expenseData);
        UI.showNotification('Expense updated successfully');
      } else {
        await ExpenseAPI.createExpense(expenseData);
        UI.showNotification('Expense added successfully');
      }

      await this.loadData();
      this.loadDashboard();
      this.loadExpensesView();
      UI.hideModal('expense-modal');
    } catch (error) {
      console.error('Error saving expense:', error);
      UI.showNotification('Error saving expense', 'error');
    }
  }

  async saveCategory() {
    const categoryData = {
      name: document.getElementById('category-name').value,
      icon: document.getElementById('category-icon').value,
      color: document.getElementById('category-color').value
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updateCategory(this.currentEditingId, categoryData);
        UI.showNotification('Category updated successfully');
      } else {
        await ExpenseAPI.addCategory(categoryData);
        UI.showNotification('Category added successfully');
      }

      await this.loadData();
      this.loadCategoriesView();
      UI.hideModal('category-modal');
    } catch (error) {
      console.error('Error saving category:', error);
      UI.showNotification('Error saving category', 'error');
    }
  }

  async saveIncome() {
    const incomeData = {
      amount: parseFloat(document.getElementById('income-amount').value),
      source: document.getElementById('income-source').value,
      description: document.getElementById('income-description').value,
      date: document.getElementById('income-date').value,
      frequency: document.getElementById('income-frequency').value,
      isRecurring: document.getElementById('income-recurring').checked,
      notes: document.getElementById('income-notes').value
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updateIncome(this.currentEditingId, incomeData);
        UI.showNotification('Income updated successfully');
      } else {
        await ExpenseAPI.createIncome(incomeData);
        UI.showNotification('Income added successfully');
      }

      await this.loadData();
      this.loadIncomeView();
      UI.hideModal('income-modal');
    } catch (error) {
      console.error('Error saving income:', error);
      UI.showNotification('Error saving income', 'error');
    }
  }

  async savePaymentMethod() {
    const methodData = {
      name: document.getElementById('payment-method-name').value,
      type: document.getElementById('payment-method-type').value,
      icon: document.getElementById('payment-method-icon').value || '💳',
      color: document.getElementById('payment-method-color').value || '#667eea'
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updatePaymentMethod(this.currentEditingId, methodData);
        UI.showNotification('Payment method updated successfully');
      } else {
        await ExpenseAPI.createPaymentMethod(methodData);
        UI.showNotification('Payment method added successfully');
      }

      await this.loadData();
      this.loadPaymentMethodsView();
      UI.hideModal('payment-method-modal');
    } catch (error) {
      console.error('Error saving payment method:', error);
      UI.showNotification('Error saving payment method', 'error');
    }
  }

  async saveCard() {
    const cardData = {
      name: document.getElementById('card-name').value,
      cardType: document.getElementById('card-type').value,
      provider: document.getElementById('card-provider').value,
      lastFourDigits: document.getElementById('card-last-four').value,
      bankName: document.getElementById('card-bank').value,
      expiryDate: document.getElementById('card-expiry').value
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updateCard(this.currentEditingId, cardData);
        UI.showNotification('Card updated successfully');
      } else {
        await ExpenseAPI.createCard(cardData);
        UI.showNotification('Card added successfully');
      }

      await this.loadData();
      this.loadCardsView();
      UI.hideModal('card-modal');
    } catch (error) {
      console.error('Error saving card:', error);
      UI.showNotification('Error saving card', 'error');
    }
  }

  async editExpense(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (!expense) return;

    this.currentEditingId = id;
    document.getElementById('modal-title').textContent = 'Edit Expense';
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-date').value = expense.date.split('T')[0];
    document.getElementById('expense-payment').value = expense.paymentMethod;
    document.getElementById('expense-card').value = expense.cardName;
    document.getElementById('expense-frequency').value = expense.frequency;
    document.getElementById('expense-recurring').checked = expense.isRecurring;
    document.getElementById('expense-notes').value = expense.notes;

    UI.showModal('expense-modal');
  }

  async editCategory(id) {
    const category = this.categories.find(c => c.id == id);
    if (!category) return;

    this.currentEditingId = id;
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-icon').value = category.icon;
    document.getElementById('category-color').value = category.color;

    UI.showModal('category-modal');
  }

  async editIncome(id) {
    const income = this.income.find(i => i.id === id);
    if (!income) return;

    this.currentEditingId = id;
    document.getElementById('income-modal-title').textContent = 'Edit Income';
    document.getElementById('income-amount').value = income.amount;
    document.getElementById('income-source').value = income.source;
    document.getElementById('income-description').value = income.description;
    document.getElementById('income-date').value = income.date.split('T')[0];
    document.getElementById('income-frequency').value = income.frequency;
    document.getElementById('income-recurring').checked = income.isRecurring;
    document.getElementById('income-notes').value = income.notes;

    UI.showModal('income-modal');
  }

  async editPaymentMethod(id) {
    const method = this.paymentMethods.find(m => m.id === id);
    if (!method) return;

    this.currentEditingId = id;
    document.getElementById('payment-method-modal-title').textContent = 'Edit Payment Method';
    document.getElementById('payment-method-name').value = method.name;
    document.getElementById('payment-method-type').value = method.type;
    document.getElementById('payment-method-icon').value = method.icon;
    document.getElementById('payment-method-color').value = method.color;

    UI.showModal('payment-method-modal');
  }

  async editCard(id) {
    const card = this.cards.find(c => c.id === id);
    if (!card) return;

    this.currentEditingId = id;
    document.getElementById('card-modal-title').textContent = 'Edit Card';
    document.getElementById('card-name').value = card.name;
    document.getElementById('card-type').value = card.cardType;
    document.getElementById('card-provider').value = card.provider;
    document.getElementById('card-last-four').value = card.lastFourDigits;
    document.getElementById('card-bank').value = card.bankName;
    document.getElementById('card-expiry').value = card.expiryDate;

    UI.showModal('card-modal');
  }

  async deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await ExpenseAPI.deleteExpense(id);
        UI.showNotification('Expense deleted successfully');
        await this.loadData();
        this.loadDashboard();
        this.loadExpensesView();
      } catch (error) {
        console.error('Error deleting expense:', error);
        UI.showNotification('Error deleting expense', 'error');
      }
    }
  }

  async deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await ExpenseAPI.deleteCategory(id);
        UI.showNotification('Category deleted successfully');
        await this.loadData();
        this.loadCategoriesView();
      } catch (error) {
        console.error('Error deleting category:', error);
        UI.showNotification('Error deleting category', 'error');
      }
    }
  }

  async deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income?')) {
      try {
        await ExpenseAPI.deleteIncome(id);
        UI.showNotification('Income deleted successfully');
        await this.loadData();
        this.loadIncomeView();
      } catch (error) {
        console.error('Error deleting income:', error);
        UI.showNotification('Error deleting income', 'error');
      }
    }
  }

  async deletePaymentMethod(id) {
    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        await ExpenseAPI.deletePaymentMethod(id);
        UI.showNotification('Payment method deleted successfully');
        await this.loadData();
        this.loadPaymentMethodsView();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        UI.showNotification('Error deleting payment method', 'error');
      }
    }
  }

  async deleteCard(id) {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await ExpenseAPI.deleteCard(id);
        UI.showNotification('Card deleted successfully');
        await this.loadData();
        this.loadCardsView();
      } catch (error) {
        console.error('Error deleting card:', error);
        UI.showNotification('Error deleting card', 'error');
      }
    }
  }

  async loadDebtsView() {
    const debtsList = document.getElementById('debts-list');
    const debtsSummary = document.getElementById('debts-summary');
    const cardDebtsSection = document.getElementById('card-debts-section');
    const cardDebtsGrid = document.getElementById('card-debts-grid');

    if (!debtsList) return;

    // Get debt summary
    try {
      const summary = await ExpenseAPI.getDebtSummary();

      // Display summary
      if (debtsSummary) {
        debtsSummary.innerHTML = `
          <div class="debt-summary-grid">
            <div class="debt-summary-card">
              <div class="debt-summary-label">Total Debts</div>
              <div class="debt-summary-value">${summary.totalDebts}</div>
            </div>
            <div class="debt-summary-card">
              <div class="debt-summary-label">Total Balance</div>
              <div class="debt-summary-value">${UI.formatCurrency(summary.totalBalance)}</div>
            </div>
            <div class="debt-summary-card">
              <div class="debt-summary-label">Min. Monthly Payment</div>
              <div class="debt-summary-value">${UI.formatCurrency(summary.totalMinimumPayment)}</div>
            </div>
            <div class="debt-summary-card">
              <div class="debt-summary-label">Highest Debt</div>
              <div class="debt-summary-value">${UI.formatCurrency(summary.highestDebt)}</div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading debt summary:', error);
    }

    // Load and display card debts
    try {
      const cardDebts = await ExpenseAPI.getAllCardDebts();

      if (cardDebts && cardDebts.length > 0) {
        cardDebtsSection.style.display = 'block';
        cardDebtsGrid.innerHTML = cardDebts.map(cardDebt => {
          const card = this.cards.find(c => c.id === cardDebt.cardId);
          return `
            <div class="card-debt-item">
              <div class="card-debt-header">
                <div>
                  <div class="card-debt-name">${cardDebt.cardName}</div>
                  <div class="card-debt-provider">${card ? card.provider : 'Card'}</div>
                </div>
              </div>
              <div class="card-debt-balance">${UI.formatCurrency(cardDebt.totalDebt)}</div>
              <div class="card-debt-details">
                <div class="card-debt-detail-item">
                  <div class="card-debt-detail-label">Debts</div>
                  <div class="card-debt-detail-value">${cardDebt.debts.length}</div>
                </div>
                <div class="card-debt-detail-item">
                  <div class="card-debt-detail-label">Total Owed</div>
                  <div class="card-debt-detail-value">${UI.formatCurrency(cardDebt.totalDebt)}</div>
                </div>
              </div>
              <div class="card-debt-actions">
                <button class="btn-pay" onclick="app.openDebtPaymentModal('${cardDebt.debts[0].id}')">Pay</button>
                <button class="btn-edit" onclick="app.editDebt('${cardDebt.debts[0].id}')">Edit</button>
              </div>
            </div>
          `;
        }).join('');
      } else {
        cardDebtsSection.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading card debts:', error);
      cardDebtsSection.style.display = 'none';
    }

    // Display other debts list
    const otherDebts = this.debts.filter(d => d.isActive && d.type !== 'credit_card');
    debtsList.innerHTML = otherDebts
      .map(debt => `
        <div class="debt-item">
          <div class="debt-item-header">
            <div class="debt-item-title">
              <h4>${debt.name}</h4>
              <p>${debt.creditor || 'N/A'}</p>
            </div>
            <div class="debt-item-balance">
              <div class="debt-balance-label">Current Balance</div>
              <div class="debt-balance-amount">${UI.formatCurrency(debt.currentBalance)}</div>
            </div>
          </div>
          <div class="debt-item-details">
            <div class="debt-detail">
              <span class="debt-detail-label">Type:</span>
              <span class="debt-detail-value">${debt.type.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            <div class="debt-detail">
              <span class="debt-detail-label">Min. Payment:</span>
              <span class="debt-detail-value">${UI.formatCurrency(debt.minimumPayment)}</span>
            </div>
            <div class="debt-detail">
              <span class="debt-detail-label">Interest Rate:</span>
              <span class="debt-detail-value">${debt.interestRate}%</span>
            </div>
            <div class="debt-detail">
              <span class="debt-detail-label">Due Date:</span>
              <span class="debt-detail-value">Day ${debt.dueDate}</span>
            </div>
          </div>
          <div class="debt-item-actions">
            <button class="payment-btn" onclick="app.openDebtPaymentModal('${debt.id}')">Make Payment</button>
            <button class="edit-btn" onclick="app.editDebt('${debt.id}')">Edit</button>
            <button class="delete-btn" onclick="app.deleteDebt('${debt.id}')">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  loadSettingsView() {
    // Update statistics
    document.getElementById('settings-total-expenses').textContent = this.expenses.length;
    document.getElementById('settings-total-income').textContent = this.income.length;
    document.getElementById('settings-total-categories').textContent = this.categories.length;
    document.getElementById('settings-total-methods').textContent = this.paymentMethods.length;

    // Load saved settings
    const savedCurrency = localStorage.getItem('currency') || 'USD';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedBudgetAlerts = localStorage.getItem('budgetAlerts') !== 'false';
    const savedMonthlyBudget = localStorage.getItem('monthlyBudget') || '';

    document.getElementById('setting-currency').value = savedCurrency;
    document.getElementById('setting-notifications').checked = savedNotifications;
    document.getElementById('setting-budget-alerts').checked = savedBudgetAlerts;
    document.getElementById('setting-monthly-budget').value = savedMonthlyBudget;

    // Add event listeners for settings changes
    document.getElementById('setting-currency').addEventListener('change', (e) => {
      localStorage.setItem('currency', e.target.value);
      UI.showNotification('Currency updated');
    });

    document.getElementById('setting-notifications').addEventListener('change', (e) => {
      localStorage.setItem('notifications', e.target.checked);
      UI.showNotification('Notifications ' + (e.target.checked ? 'enabled' : 'disabled'));
    });

    document.getElementById('setting-budget-alerts').addEventListener('change', (e) => {
      localStorage.setItem('budgetAlerts', e.target.checked);
      UI.showNotification('Budget alerts ' + (e.target.checked ? 'enabled' : 'disabled'));
    });

    document.getElementById('setting-monthly-budget').addEventListener('change', (e) => {
      localStorage.setItem('monthlyBudget', e.target.value);
      UI.showNotification('Monthly budget updated');
    });
  }

  exportData() {
    const data = {
      expenses: this.expenses,
      income: this.income,
      categories: this.categories,
      paymentMethods: this.paymentMethods,
      cards: this.cards,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    UI.showNotification('Data exported successfully');
  }

  exportCSV() {
    let csv = 'Date,Description,Category,Amount,Payment Method,Card,Frequency,Notes\n';

    this.expenses.forEach(expense => {
      const category = this.categories.find(c => c.id === expense.category);
      const categoryName = category ? category.name : 'Unknown';
      const row = [
        expense.date,
        `"${expense.description || ''}"`,
        categoryName,
        expense.amount,
        expense.paymentMethod,
        `"${expense.cardName || ''}"`,
        expense.frequency,
        `"${expense.notes || ''}"`
      ].join(',');
      csv += row + '\n';
    });

    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    UI.showNotification('CSV exported successfully');
  }

  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!confirm('This will replace all your current data. Are you sure?')) {
          return;
        }

        // Import data
        for (const expense of data.expenses) {
          await ExpenseAPI.createExpense(expense);
        }
        for (const income of data.income) {
          await ExpenseAPI.createIncome(income);
        }

        await this.loadData();
        this.loadDashboard();
        UI.showNotification('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        UI.showNotification('Error importing data', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  resetAllData() {
    if (!confirm('Are you absolutely sure? This will delete ALL your data and cannot be undone!')) {
      return;
    }

    if (!confirm('This is your last warning. Delete everything?')) {
      return;
    }

    // Clear all data
    this.expenses = [];
    this.income = [];
    this.paymentMethods = [];
    this.cards = [];

    // Clear localStorage
    localStorage.clear();

    // Reload
    location.reload();
  }

  // Debt Management Functions
  openDebtModal() {
    this.currentEditingId = null;
    this.currentEditingType = 'debt';
    document.getElementById('debt-modal-title').textContent = 'Add Debt';
    document.getElementById('debt-form').reset();

    // Populate card dropdown
    this.populateCardDropdown();

    // Add event listener for debt type change
    document.getElementById('debt-type').addEventListener('change', (e) => {
      const cardGroup = document.getElementById('card-selection-group');
      if (e.target.value === 'credit_card') {
        cardGroup.style.display = 'block';
      } else {
        cardGroup.style.display = 'none';
      }
    });

    UI.showModal('debt-modal');
  }

  populateCardDropdown() {
    const cardSelect = document.getElementById('debt-card-id');
    cardSelect.innerHTML = '<option value="">Select a Card</option>';

    if (this.cards && this.cards.length > 0) {
      this.cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.name} (${card.provider} - ${card.lastFourDigits})`;
        cardSelect.appendChild(option);
      });
    }
  }

  async saveDebt() {
    const debtType = document.getElementById('debt-type').value;
    const cardId = document.getElementById('debt-card-id').value;

    // Validate card selection for credit cards
    if (debtType === 'credit_card' && !cardId) {
      UI.showNotification('Please select a card for credit card debt', 'error');
      return;
    }

    // Get card name if credit card
    let cardName = null;
    if (debtType === 'credit_card' && cardId) {
      const card = this.cards.find(c => c.id === cardId);
      cardName = card ? card.name : null;
    }

    const debtData = {
      name: document.getElementById('debt-name').value,
      type: debtType,
      creditor: document.getElementById('debt-creditor').value,
      originalAmount: parseFloat(document.getElementById('debt-original-amount').value),
      currentBalance: parseFloat(document.getElementById('debt-current-balance').value),
      minimumPayment: parseFloat(document.getElementById('debt-min-payment').value) || 0,
      interestRate: parseFloat(document.getElementById('debt-interest-rate').value) || 0,
      dueDate: parseInt(document.getElementById('debt-due-date').value) || 1,
      startDate: document.getElementById('debt-start-date').value,
      targetPayoffDate: document.getElementById('debt-payoff-date').value || null,
      cardId: cardId || null,
      cardName: cardName,
      notes: document.getElementById('debt-notes').value
    };

    try {
      if (this.currentEditingId) {
        await ExpenseAPI.updateDebt(this.currentEditingId, debtData);
        UI.showNotification('Debt updated successfully');
      } else {
        await ExpenseAPI.createDebt(debtData);
        UI.showNotification('Debt added successfully');
      }

      await this.loadData();
      this.loadDebtsView();
      UI.hideModal('debt-modal');
    } catch (error) {
      console.error('Error saving debt:', error);
      UI.showNotification('Error saving debt', 'error');
    }
  }

  editDebt(id) {
    const debt = this.debts.find(d => d.id === id);
    if (!debt) return;

    this.currentEditingId = id;
    document.getElementById('debt-modal-title').textContent = 'Edit Debt';
    document.getElementById('debt-name').value = debt.name;
    document.getElementById('debt-type').value = debt.type;
    document.getElementById('debt-creditor').value = debt.creditor || '';
    document.getElementById('debt-original-amount').value = debt.originalAmount;
    document.getElementById('debt-current-balance').value = debt.currentBalance;
    document.getElementById('debt-min-payment').value = debt.minimumPayment;
    document.getElementById('debt-interest-rate').value = debt.interestRate;
    document.getElementById('debt-due-date').value = debt.dueDate;
    document.getElementById('debt-start-date').value = debt.startDate;
    document.getElementById('debt-payoff-date').value = debt.targetPayoffDate || '';
    document.getElementById('debt-notes').value = debt.notes;

    // Populate card dropdown and set selected card
    this.populateCardDropdown();
    if (debt.cardId) {
      document.getElementById('debt-card-id').value = debt.cardId;
      document.getElementById('card-selection-group').style.display = 'block';
    } else {
      document.getElementById('card-selection-group').style.display = 'none';
    }

    UI.showModal('debt-modal');
  }

  async deleteDebt(id) {
    if (!confirm('Are you sure you want to delete this debt?')) {
      return;
    }

    try {
      await ExpenseAPI.deleteDebt(id);
      UI.showNotification('Debt deleted successfully');
      await this.loadData();
      this.loadDebtsView();
    } catch (error) {
      console.error('Error deleting debt:', error);
      UI.showNotification('Error deleting debt', 'error');
    }
  }

  openDebtPaymentModal(debtId) {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt) return;

    document.getElementById('payment-debt-id').value = debtId;
    document.getElementById('payment-debt-name').textContent = debt.name;
    document.getElementById('payment-current-balance').textContent = UI.formatCurrency(debt.currentBalance);
    document.getElementById('payment-amount').value = debt.minimumPayment;
    document.getElementById('payment-amount').max = debt.currentBalance;

    UI.showModal('debt-payment-modal');
  }

  async makeDebtPayment() {
    const debtId = document.getElementById('payment-debt-id').value;
    const amount = parseFloat(document.getElementById('payment-amount').value);

    if (!amount || amount <= 0) {
      UI.showNotification('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      await ExpenseAPI.makeDebtPayment(debtId, amount);
      UI.showNotification('Payment recorded successfully');
      await this.loadData();
      this.loadDebtsView();
      UI.hideModal('debt-payment-modal');
    } catch (error) {
      console.error('Error making payment:', error);
      UI.showNotification('Error making payment', 'error');
    }
  }
}

let app;
document.addEventListener('DOMContentLoaded', async () => {
  // Setup authentication event listeners FIRST (before checking login status)
  setupAuthEventListeners();

  // Initialize authentication
  await AuthManager.init();

  // If user is logged in, create the app
  if (AuthManager.currentUser) {
    app = new ExpenseTrackerApp();
  }
});

// ==================== SETUP AUTH EVENT LISTENERS ====================
function setupAuthEventListeners() {
  // Auth tabs
  const authTabs = document.querySelectorAll('.auth-tab');
  if (authTabs.length > 0) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
      });
    });
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const messageEl = document.getElementById('login-message');

      messageEl.classList.remove('error', 'success');
      messageEl.textContent = 'Logging in...';
      messageEl.style.display = 'block';

      const success = await AuthManager.login(email, password);
      if (success) {
        messageEl.classList.add('success');
        messageEl.textContent = 'Login successful!';
        setTimeout(() => {
          app = new ExpenseTrackerApp();
        }, 500);
      } else {
        messageEl.classList.add('error');
        messageEl.textContent = 'Login failed. Please check your credentials.';
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('register-confirm').value;
      const messageEl = document.getElementById('register-message');

      messageEl.classList.remove('error', 'success');

      if (password !== confirm) {
        messageEl.classList.add('error');
        messageEl.textContent = 'Passwords do not match';
        messageEl.style.display = 'block';
        return;
      }

      messageEl.textContent = 'Registering...';
      messageEl.style.display = 'block';

      const success = await AuthManager.register(email, password, fullName);
      if (success) {
        messageEl.classList.add('success');
        messageEl.textContent = 'Registration successful! Switching to login...';
        document.getElementById('register-form').reset();
        setTimeout(() => {
          AuthManager.switchToLogin();
        }, 1500);
      } else {
        messageEl.classList.add('error');
        messageEl.textContent = 'Registration failed. Please try again.';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        await AuthManager.logout();
      }
    });
  }
}

