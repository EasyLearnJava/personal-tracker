// ==================== AUTHENTICATION MANAGER ====================
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
      console.log('AuthManager.login called with email:', email);
      const result = await ExpenseAPI.login(email, password);
      console.log('Login result:', result);

      if (result.success) {
        this.currentUser = result.user;
        this.accessToken = result.accessToken;
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('Login successful, user:', result.user);
        UI.showNotification('Login successful!', 'success');
        this.showApp();
        return true;
      } else {
        const errorMsg = result.error || 'Login failed';
        console.error('Login failed:', errorMsg);
        UI.showNotification(errorMsg, 'error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      UI.showNotification('Login failed: ' + error.message, 'error');
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
    this.tasks = [];
    this.budgets = [];
    this.currentBudget = null;
    this.currentBudgetMonth = this.getCurrentMonth();
    this.charts = {};
    this.currentEditingId = null;
    this.currentEditingType = null;
    this.dashboardPeriod = 'monthly';
    this.taskManager = new TaskManager(this);
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadData();
    await this.taskManager.init();
    this.loadDashboard();
  }

  async loadData() {
    try {
      this.expenses = await ExpenseAPI.getExpenses();
      this.categories = await ExpenseAPI.getCategories();
      this.budgets = await ExpenseAPI.getBudgets();
      this.populateCategorySelects();
      this.populateIncomeSourceSelects();
      this.populateBudgetMonthSelect();
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
        if (view) { // Only process if view is defined (skip section titles)
          UI.switchView(view);
          this.loadView(view);
        }
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
      // Populate categories and income sources from the current budget
      this.populateCategorySelects();
      this.populateIncomeSourceSelects();

      // Add validation listeners
      document.getElementById('expense-amount').addEventListener('change', () => this.validateExpenseIncomeSource());
      document.getElementById('expense-income-source').addEventListener('change', () => this.validateExpenseIncomeSource());

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

    // Budget event listeners
    document.getElementById('add-budget-category-btn').addEventListener('click', () => {
      this.currentEditingBudgetId = null;
      this.currentEditingItemId = null;
      document.getElementById('budget-item-modal-title').textContent = 'Add Budget Category';
      document.getElementById('budget-item-form').reset();
      document.getElementById('budget-item-group').value = '';
      document.getElementById('budget-item-new-group').style.display = 'none';
      UI.showModal('budget-item-modal');
    });

    document.getElementById('budget-item-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBudgetItem();
    });

    // Add Spent form submission
    const addSpentForm = document.getElementById('add-spent-form');
    if (addSpentForm) {
      addSpentForm.addEventListener('submit', (e) => this.handleAddSpentSubmit(e));

      // Add validation on amount change
      document.getElementById('add-spent-amount').addEventListener('change', () => this.validateIncomeSource());
    }

    // Handle group selection change
    document.getElementById('budget-item-group').addEventListener('change', (e) => {
      const newGroupInput = document.getElementById('budget-item-new-group');
      if (e.target.value === '__new__') {
        newGroupInput.style.display = 'block';
        newGroupInput.required = true;
        newGroupInput.focus();
      } else {
        newGroupInput.style.display = 'none';
        newGroupInput.required = false;
      }
    });

    document.getElementById('copy-budget-btn').addEventListener('click', () => {
      this.copyBudgetToNextMonth();
    });

    document.getElementById('prev-month-btn').addEventListener('click', () => {
      this.previousBudgetMonth();
    });

    document.getElementById('next-month-btn').addEventListener('click', () => {
      this.nextBudgetMonth();
    });

    document.getElementById('budget-month-select').addEventListener('change', (e) => {
      this.currentBudgetMonth = e.target.value;
      this.loadBudgetView();
    });

    // Create budget button
    const createBudgetBtn = document.getElementById('create-budget-btn');
    if (createBudgetBtn) {
      createBudgetBtn.addEventListener('click', () => {
        this.createNewBudget();
      });
    }

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

    // Get expense categories from the current budget
    // If currentBudget is not set, find it based on currentBudgetMonth
    let budget = this.currentBudget;
    if (!budget) {
      budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    }

    const expenseCategoryNames = new Set();
    if (budget && budget.items) {
      budget.items.forEach(item => {
        // Only add non-income categories (income categories are in "Income" group)
        if (item.group !== 'Income') {
          expenseCategoryNames.add(item.category);
        }
      });
    }

    this.categories.forEach(cat => {
      // For expense category select, only show expense categories
      if (expenseCategoryNames.has(cat.name)) {
        const option1 = document.createElement('option');
        option1.value = cat.id;
        option1.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option1);
      }

      // For filter, show all categories
      const option2 = document.createElement('option');
      option2.value = cat.id;
      option2.textContent = `${cat.icon} ${cat.name}`;
      filterSelect.appendChild(option2);
    });
  }



  populateIncomeSourceSelects() {
    const incomeSourceSelect = document.getElementById('expense-income-source');
    if (!incomeSourceSelect) return;

    incomeSourceSelect.innerHTML = '<option value="">Select Income Source</option>';

    // Get income sources from the current budget
    const currentBudget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    if (!currentBudget) return;

    const incomeItems = currentBudget.items.filter(i => i.group === 'Income');
    incomeItems.forEach(income => {
      const available = income.budgetAmount - income.actualAmount;
      // Only show income sources with available balance > 0
      if (available > 0) {
        const option = document.createElement('option');
        option.value = income.category; // Store the category name as the value
        option.textContent = `${income.category} (Available: ${UI.formatCurrency(available)})`;
        option.dataset.available = available;
        option.dataset.incomeId = income.id;
        incomeSourceSelect.appendChild(option);
      }
    });
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
      case 'budget':
        this.loadBudgetView();
        break;
      case 'payment-history':
        this.loadPaymentHistoryView();
        break;
      case 'activity-log':
        this.loadActivityLogView();
        break;
      case 'bank-accounts':
        this.loadBankAccountsView();
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

    // Map payment method to labels
    const labels = data.map(d => d.paymentMethod);

    this.charts.payment = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
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



  async saveExpense() {
    const incomeSource = document.getElementById('expense-income-source').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!incomeSource) {
      UI.showNotification('Please select an income source', 'error');
      return;
    }

    // Validate amount against available balance
    const sourceSelect = document.getElementById('expense-income-source');
    const selectedOption = sourceSelect.options[sourceSelect.selectedIndex];
    const available = parseFloat(selectedOption.dataset.available) || 0;

    if (amount > available) {
      UI.showNotification(`Amount exceeds available balance of ${UI.formatCurrency(available)}`, 'error');
      return;
    }

    const expenseData = {
      amount: amount,
      category: parseInt(document.getElementById('expense-category').value),
      description: document.getElementById('expense-description').value,
      date: document.getElementById('expense-date').value,
      paymentMethod: incomeSource, // Store income source as payment method
      cardName: incomeSource, // Store income source as card name for backward compatibility
      frequency: document.getElementById('expense-frequency').value,
      isRecurring: document.getElementById('expense-recurring').checked,
      notes: document.getElementById('expense-notes').value
    };

    try {
      if (this.currentEditingId) {
        // For update, get the old expense
        const oldExpense = this.expenses.find(e => e.id === this.currentEditingId);

        console.log('UPDATE EXPENSE - Old expense:', oldExpense);
        console.log('UPDATE EXPENSE - New data:', expenseData);

        await ExpenseAPI.updateExpense(this.currentEditingId, expenseData);

        // Update budget: first restore old amount from old income source, then deduct new amount from new income source
        if (oldExpense) {
          console.log('Step 1: Restoring old amount from old income source');
          // Step 1: Restore the old amount to the old income source
          await this.updateBudgetFromExpense(oldExpense, 'delete');

          console.log('Step 2: Reloading budget data only');
          // Step 2: Reload ONLY budget data to get fresh state after Step 1
          this.budgets = await ExpenseAPI.getBudgets();

          console.log('Step 3: Deducting new amount from new income source');
          // Step 3: Deduct the new amount from the new income source
          const updatedExpense = { ...oldExpense, ...expenseData };
          console.log('Updated expense object:', updatedExpense);
          await this.updateBudgetFromExpense(updatedExpense, 'add');
        }

        UI.showNotification('Expense updated successfully');
      } else {
        console.log('Creating new expense with data:', expenseData);
        const result = await ExpenseAPI.createExpense(expenseData);
        console.log('Create expense result:', result);

        // Update budget for new expense
        // The API returns the expense directly, not wrapped in { data: expense }
        const expense = result && result.data ? result.data : result;
        if (expense) {
          console.log('Updating budget with expense:', expense);
          await this.updateBudgetFromExpense(expense, 'add');
        } else {
          console.warn('No expense in result:', result);
        }

        UI.showNotification('Expense added successfully');
      }

      // Reload data from server to get the latest state
      await this.loadData();
      this.loadDashboard();
      this.loadExpensesView();
      this.loadBudgetView();
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



  async editExpense(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (!expense) return;

    this.currentEditingId = id;
    this.currentEditingType = 'expense';
    document.getElementById('modal-title').textContent = 'Edit Expense';

    // Populate categories and income sources from the current budget
    this.populateCategorySelects();
    this.populateIncomeSourceSelects();

    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-date').value = expense.date.split('T')[0];
    document.getElementById('expense-income-source').value = expense.paymentMethod || expense.cardName;
    document.getElementById('expense-frequency').value = expense.frequency;
    document.getElementById('expense-recurring').checked = expense.isRecurring;
    document.getElementById('expense-notes').value = expense.notes;

    // Add validation listeners
    document.getElementById('expense-amount').addEventListener('change', () => this.validateExpenseIncomeSource());
    document.getElementById('expense-income-source').addEventListener('change', () => this.validateExpenseIncomeSource());

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



  async deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        // Get the expense to find its category and amount
        const expense = this.expenses.find(e => e.id === id);

        await ExpenseAPI.deleteExpense(id);

        // Update budget if expense has a category
        if (expense && expense.category) {
          await this.updateBudgetFromExpense(expense, 'delete');
        }

        UI.showNotification('Expense deleted successfully');
        await this.loadData();
        this.loadDashboard();
        this.loadExpensesView();
        this.loadBudgetView();
      } catch (error) {
        console.error('Error deleting expense:', error);
        UI.showNotification('Error deleting expense', 'error');
      }
    }
  }

  async updateBudgetFromExpense(expense, action) {
    try {
      console.log('updateBudgetFromExpense called with:', { expense, action, currentBudgetMonth: this.currentBudgetMonth });

      // Find the category name from the category ID
      const category = this.categories.find(c => c.id === expense.category);
      console.log('Found category:', category);
      if (!category) {
        console.warn('Category not found for expense:', expense);
        return;
      }

      // Get the current month's budget
      const budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
      console.log('Found budget:', budget);
      if (!budget) {
        console.warn('Budget not found for month:', this.currentBudgetMonth);
        return;
      }

      // Find the budget item with matching category
      const budgetItem = budget.items.find(item => item.category === category.name);
      console.log('Found budget item:', budgetItem);
      if (!budgetItem) {
        console.warn('Budget item not found for category:', category.name);
        return;
      }

      // Update the budget item's actualAmount (expense category spent amount)
      let newActualAmount = budgetItem.actualAmount;
      if (action === 'add') {
        newActualAmount += expense.amount;
      } else if (action === 'delete') {
        newActualAmount = Math.max(0, newActualAmount - expense.amount);
      }

      console.log(`Updating budget item: ${category.name} from ${budgetItem.actualAmount} to ${newActualAmount}`);

      // Get the income source from the expense (paymentMethod field)
      const incomeSource = expense.paymentMethod || budgetItem.incomeSource;
      console.log('Income source for this expense:', incomeSource);

      // Update the expense category budget item
      const updateResult = await ExpenseAPI.updateBudgetItem(budget.id, budgetItem.id, {
        category: budgetItem.category,
        group: budgetItem.group,
        budgetAmount: budgetItem.budgetAmount,
        actualAmount: newActualAmount,
        incomeSource: incomeSource,
        notes: budgetItem.notes
      });

      console.log(`Budget updated successfully:`, updateResult);

      // ALSO UPDATE THE INCOME SOURCE'S ACTUAL AMOUNT
      // actualAmount for income items represents available balance (budgetAmount - actualAmount = available)
      // When an expense is added, we deduct from available balance
      // When an expense is deleted, we add back to available balance
      if (incomeSource) {
        console.log(`Looking for income source: "${incomeSource}" in budget items`);
        const incomeItem = budget.items.find(item => {
          console.log(`Checking item: category="${item.category}", group="${item.group}"`);
          return item.group === 'Income' && item.category === incomeSource;
        });
        console.log('Found income item:', incomeItem);

        if (incomeItem) {
          let newIncomeActualAmount = incomeItem.actualAmount;
          console.log(`Income item current actualAmount: ${incomeItem.actualAmount}, action: ${action}, expense.amount: ${expense.amount}`);

          if (action === 'add') {
            // When adding an expense, deduct from income source's available balance
            // Available = budgetAmount - actualAmount, so we ADD to actualAmount to reduce available
            newIncomeActualAmount += expense.amount;
            console.log(`ADD action: deducting ${expense.amount} from income source available balance (actualAmount: ${incomeItem.actualAmount} -> ${newIncomeActualAmount})`);
          } else if (action === 'delete') {
            // When deleting an expense, add back to income source's available balance
            // Available = budgetAmount - actualAmount, so we SUBTRACT from actualAmount to increase available
            newIncomeActualAmount = Math.max(0, newIncomeActualAmount - expense.amount);
            console.log(`DELETE action: adding back ${expense.amount} to income source available balance (actualAmount: ${incomeItem.actualAmount} -> ${newIncomeActualAmount})`);
          }

          console.log(`Updating income source: ${incomeSource} from ${incomeItem.actualAmount} to ${newIncomeActualAmount}`);

          // Update the income source budget item
          const incomeUpdateResult = await ExpenseAPI.updateBudgetItem(budget.id, incomeItem.id, {
            category: incomeItem.category,
            group: incomeItem.group,
            budgetAmount: incomeItem.budgetAmount,
            actualAmount: newIncomeActualAmount,
            incomeSource: incomeItem.incomeSource,
            notes: incomeItem.notes
          });

          console.log(`Income source updated successfully:`, incomeUpdateResult);
        } else {
          console.warn(`Income item not found for income source: "${incomeSource}"`);
        }
      } else {
        console.warn('No income source provided for expense');
      }
    } catch (error) {
      console.error('Error updating budget from expense:', error);
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

  // ==================== BUDGET METHODS ====================

  getDefaultBudgetCategories() {
    return [
      // Income
      { category: 'Paycheck', group: 'Income' },
      { category: 'Business Income', group: 'Income' },
      { category: 'Rental Income', group: 'Income' },
      { category: 'Stocks', group: 'Income' },
      { category: 'Interest & Dividends', group: 'Income' },
      { category: 'Tax Refunds & Cashbacks', group: 'Income' },
      { category: 'Other Income', group: 'Income' },

      // Business_Expenses
      { category: 'Flower Purchases', group: 'Business_Expenses' },
      { category: 'Uber Delivery', group: 'Business_Expenses' },
      { category: 'Others', group: 'Business_Expenses' },

      // Rental_Expenses
      { category: 'HOA', group: 'Rental_Expenses' },
      { category: 'Home Insurance', group: 'Rental_Expenses' },
      { category: 'Home Warranty', group: 'Rental_Expenses' },
      { category: 'Home Repairs', group: 'Rental_Expenses' },

      // Savings_Investing_Giving
      { category: 'Emergency Fund', group: 'Savings_Investing_Giving' },
      { category: 'Retirement / 401(k)', group: 'Savings_Investing_Giving' },
      { category: 'Investing / Brokerage', group: 'Savings_Investing_Giving' },
      { category: 'Next Trip / Vacation Fund', group: 'Savings_Investing_Giving' },
      { category: 'Upskilling / Education', group: 'Savings_Investing_Giving' },
      { category: 'Major Purchase (Car / Home)', group: 'Savings_Investing_Giving' },
      { category: 'Debt Repayment', group: 'Savings_Investing_Giving' },
      { category: 'Charity / Donations', group: 'Savings_Investing_Giving' },
      { category: 'Environmental Causes', group: 'Savings_Investing_Giving' },

      // Housing
      { category: 'Mortgage / Rent', group: 'Housing' },
      { category: 'Property Tax', group: 'Housing' },
      { category: 'Home Insurance', group: 'Housing' },
      { category: 'Electricity', group: 'Housing' },
      { category: 'Natural Gas', group: 'Housing' },
      { category: 'Water', group: 'Housing' },
      { category: 'Sewer', group: 'Housing' },
      { category: 'Trash / Recycling', group: 'Housing' },
      { category: 'Internet / Cable', group: 'Housing' },
      { category: 'Home Warranty', group: 'Housing' },
      { category: 'Pest Control', group: 'Housing' },
      { category: 'Lawn Care & Mowing', group: 'Housing' },

      // Utilities_Bills
      { category: 'Phone Bill', group: 'Utilities_Bills' },
      { category: 'Streaming Services', group: 'Utilities_Bills' },
      { category: 'Cloud Storage / Software Licenses', group: 'Utilities_Bills' },
      { category: 'Memberships', group: 'Utilities_Bills' },
      { category: 'Bank / Credit Card Fees', group: 'Utilities_Bills' },
      { category: 'Other Recurring Services', group: 'Utilities_Bills' },

      // Transportation
      { category: 'Car Payment / Lease', group: 'Transportation' },
      { category: 'Car Insurance', group: 'Transportation' },
      { category: 'Gas / Fuel', group: 'Transportation' },
      { category: 'Car Maintenance', group: 'Transportation' },
      { category: 'Tolls', group: 'Transportation' },
      { category: 'Parking Fees', group: 'Transportation' },
      { category: 'Registration & Inspection', group: 'Transportation' },
      { category: 'Rideshare / Taxi / Uber / Lyft', group: 'Transportation' },
      { category: 'Public Transit', group: 'Transportation' },

      // Food_Dining_Lifestyle
      { category: 'Groceries', group: 'Food_Dining_Lifestyle' },
      { category: 'Wholesale Groceries (Costco / Sam\'s)', group: 'Food_Dining_Lifestyle' },
      { category: 'Dining Out / Restaurants', group: 'Food_Dining_Lifestyle' },
      { category: 'Coffee / Snacks', group: 'Food_Dining_Lifestyle' },
      { category: 'Movies / Theaters', group: 'Food_Dining_Lifestyle' },
      { category: 'Events / Travel / Vacations', group: 'Food_Dining_Lifestyle' },
      { category: 'Hobbies', group: 'Food_Dining_Lifestyle' },

      // Health_Insurance
      { category: 'Health Insurance', group: 'Health_Insurance' },
      { category: 'Medical / Doctor Visits', group: 'Health_Insurance' },
      { category: 'Dental & Vision', group: 'Health_Insurance' },
      { category: 'Pharmacy / Medications', group: 'Health_Insurance' },
      { category: 'Fitness / Gym', group: 'Health_Insurance' },
      { category: 'Life Insurance', group: 'Health_Insurance' },

      // Personal_Shopping
      { category: 'Clothing & Accessories', group: 'Personal_Shopping' },
      { category: 'Personal Care (Salon, Grooming)', group: 'Personal_Shopping' },
      { category: 'Gifts', group: 'Personal_Shopping' },
      { category: 'Electronics / Gadgets', group: 'Personal_Shopping' },
      { category: 'Education (Books, Courses)', group: 'Personal_Shopping' },
      { category: 'Pets (Food, Vet, etc.)', group: 'Personal_Shopping' },
      { category: 'Miscellaneous', group: 'Personal_Shopping' }
    ];
  }

  getCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  getNextMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    let nextMonth = parseInt(month) + 1;
    let nextYear = parseInt(year);

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  }

  getPreviousMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    let prevMonth = parseInt(month) - 1;
    let prevYear = parseInt(year);

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }

  populateBudgetMonthSelect() {
    const select = document.getElementById('budget-month-select');
    if (!select) return; // Element doesn't exist yet

    select.innerHTML = '';

    // Add current and next 12 months
    let currentMonth = this.getCurrentMonth();
    for (let i = -3; i <= 12; i++) {
      let month = currentMonth;
      for (let j = 0; j < Math.abs(i); j++) {
        month = i < 0 ? this.getPreviousMonth(month) : this.getNextMonth(month);
      }

      const option = document.createElement('option');
      option.value = month;
      const [year, monthNum] = month.split('-');
      const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      option.textContent = monthName;
      select.appendChild(option);
    }

    select.value = this.currentBudgetMonth;
  }

  async loadBudgetView() {
    // Populate month dropdown
    this.populateBudgetMonthSelect();

    const budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    this.currentBudget = budget; // Set current budget for use in other methods
    const noBudgetMsg = document.getElementById('no-budget-message');
    const budgetTableContainer = document.getElementById('budget-table-container');
    const budgetSummaryCards = document.getElementById('budget-summary-cards');

    if (!budget) {
      noBudgetMsg.style.display = 'block';
      budgetTableContainer.style.display = 'none';
      budgetSummaryCards.style.display = 'none';
      return;
    }

    noBudgetMsg.style.display = 'none';
    budgetTableContainer.style.display = 'block';
    budgetSummaryCards.style.display = 'block';

    // Calculate Income and Expenses separately
    const incomeItems = budget.items.filter(item => item.group === 'Income');
    const expenseItems = budget.items.filter(item => item.group !== 'Income');

    const incomePlanned = incomeItems.reduce((sum, item) => sum + item.budgetAmount, 0);
    const incomeSpent = incomeItems.reduce((sum, item) => sum + item.actualAmount, 0);
    const incomeRemaining = incomePlanned - incomeSpent;

    const expensesPlanned = expenseItems.reduce((sum, item) => sum + item.budgetAmount, 0);
    const expensesSpent = expenseItems.reduce((sum, item) => sum + item.actualAmount, 0);
    const expensesRemaining = expensesPlanned - expensesSpent;

    // Update Income summary cards
    const incomeCard = document.getElementById('income-summary-card');
    if (incomeCard) {
      incomeCard.innerHTML = `
        <div class="summary-card-row">
          <div class="summary-item">
            <span class="summary-label">Income Planned</span>
            <span class="summary-value">${UI.formatCurrency(incomePlanned)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Income Spent</span>
            <span class="summary-value">${UI.formatCurrency(incomeSpent)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Income Remaining</span>
            <span class="summary-value ${incomeRemaining >= 0 ? 'positive' : 'negative'}">${UI.formatCurrency(incomeRemaining)}</span>
          </div>
        </div>
      `;
    }

    // Update Expenses summary cards
    const expensesCard = document.getElementById('expenses-summary-card');
    if (expensesCard) {
      expensesCard.innerHTML = `
        <div class="summary-card-row">
          <div class="summary-item">
            <span class="summary-label">Expenses Planned</span>
            <span class="summary-value">${UI.formatCurrency(expensesPlanned)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Expenses Spent</span>
            <span class="summary-value">${UI.formatCurrency(expensesSpent)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Expenses Remaining</span>
            <span class="summary-value ${expensesRemaining >= 0 ? 'positive' : 'negative'}">${UI.formatCurrency(expensesRemaining)}</span>
          </div>
        </div>
      `;
    }

    // Overall summary cards removed as per user request

    // Render Income Table
    let incomeHTML = '';
    incomeItems.forEach(item => {
      const remaining = item.budgetAmount - item.actualAmount;
      incomeHTML += `
        <tr>
          <td class="budget-category-name">${item.category}</td>
          <td class="budget-amount-display">${UI.formatCurrency(item.budgetAmount)}</td>
          <td class="budget-amount-display" style="color: #4caf50; font-weight: 600;">${UI.formatCurrency(item.actualAmount)}</td>
          <td class="budget-amount-display">${UI.formatCurrency(remaining)}</td>
          <td class="budget-table-actions">
            <button class="btn-edit" onclick="app.editBudgetItem('${budget.id}', '${item.id}')">Edit</button>
            <button class="btn-delete" onclick="app.deleteBudgetItem('${budget.id}', '${item.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    document.getElementById('income-table-body').innerHTML = incomeHTML;

    // Render Expenses Table with grouped categories
    let expensesHTML = '';
    const groupedExpenses = {};
    const expenseGroupOrder = [];

    expenseItems.forEach(item => {
      const group = item.group || 'Other';
      if (!groupedExpenses[group]) {
        groupedExpenses[group] = [];
        expenseGroupOrder.push(group);
      }
      groupedExpenses[group].push(item);
    });

    expenseGroupOrder.forEach((group) => {
      expensesHTML += `<tr class="budget-group-header" data-group="${group}">
        <td colspan="5">
          <div class="budget-group-header-content">
            <span class="budget-group-name">${group}</span>
          </div>
        </td>
      </tr>`;

      groupedExpenses[group].forEach(item => {
        const remaining = item.budgetAmount - item.actualAmount;
        const remainingClass = remaining >= 0 ? 'budget-remaining-positive' : 'budget-remaining-negative';

        expensesHTML += `
          <tr>
            <td class="budget-category-name">${item.category}</td>
            <td class="budget-amount-display">${UI.formatCurrency(item.budgetAmount)}</td>
            <td class="budget-amount-display">${UI.formatCurrency(item.actualAmount)}</td>
            <td class="budget-amount-display ${remainingClass}">${UI.formatCurrency(remaining)}</td>
            <td class="budget-table-actions">
              <button class="btn-edit" onclick="app.editBudgetItem('${budget.id}', '${item.id}')">Edit</button>
              <button class="btn-quick-add" onclick="app.quickAddSpent('${budget.id}', '${item.id}')">+ Add Spent</button>
              <button class="btn-delete" onclick="app.deleteBudgetItem('${budget.id}', '${item.id}')">Delete</button>
            </td>
          </tr>
        `;
      });
    });

    document.getElementById('expenses-table-body').innerHTML = expensesHTML;
  }

  async createNewBudget() {
    try {
      const defaultCategories = this.getDefaultBudgetCategories();
      const budgetData = {
        month: this.currentBudgetMonth,
        year: parseInt(this.currentBudgetMonth.split('-')[0]),
        items: defaultCategories.map(cat => ({
          id: this.generateUUID(),
          category: cat.category,
          group: cat.group,
          budgetAmount: 0,
          actualAmount: 0,
          notes: ''
        })),
        notes: ''
      };

      const newBudget = await ExpenseAPI.createBudget(budgetData);
      this.budgets.push(newBudget);
      this.loadBudgetView();
      UI.showNotification('Budget created with default categories', 'success');
    } catch (error) {
      console.error('Error creating budget:', error);
      UI.showNotification('Error creating budget', 'error');
    }
  }

  async saveBudgetItem() {
    const category = document.getElementById('budget-item-category').value;
    let group = document.getElementById('budget-item-group').value;
    const newGroup = document.getElementById('budget-item-new-group').value;
    const budgetAmount = parseFloat(document.getElementById('budget-item-amount').value);
    const notes = document.getElementById('budget-item-notes').value;

    // Validate required fields (allow 0 for budgetAmount)
    if (!category || budgetAmount === null || isNaN(budgetAmount) || !group) {
      UI.showNotification('Please fill in all required fields', 'error');
      return;
    }

    // If creating new group, use the new group name
    if (group === '__new__') {
      if (!newGroup.trim()) {
        UI.showNotification('Please enter a group name', 'error');
        return;
      }
      group = newGroup.trim();
    }

    try {
      let budget = this.budgets.find(b => b.month === this.currentBudgetMonth);

      if (!budget) {
        // Create new budget for this month
        const budgetData = {
          month: this.currentBudgetMonth,
          year: parseInt(this.currentBudgetMonth.split('-')[0]),
          items: [],
          notes: ''
        };
        budget = await ExpenseAPI.createBudget(budgetData);
        this.budgets.push(budget);
      }

      if (this.currentEditingItemId) {
        // Update existing item
        await ExpenseAPI.updateBudgetItem(budget.id, this.currentEditingItemId, {
          category,
          group,
          budgetAmount,
          notes
        });
      } else {
        // Add new item
        await ExpenseAPI.addBudgetItem(budget.id, {
          category,
          group,
          budgetAmount,
          notes
        });
      }

      await this.loadData();
      this.loadBudgetView();
      UI.hideModal('budget-item-modal');
      UI.showNotification('Budget item saved successfully');
    } catch (error) {
      console.error('Error saving budget item:', error);
      UI.showNotification('Error saving budget item', 'error');
    }
  }

  async editBudgetItem(budgetId, itemId) {
    console.log('editBudgetItem called with budgetId:', budgetId, 'itemId:', itemId);

    const budget = this.budgets.find(b => b.id === budgetId);
    console.log('Found budget:', budget);
    if (!budget) {
      console.error('Budget not found');
      return;
    }

    const item = budget.items.find(i => i.id === itemId);
    console.log('Found item:', item);
    if (!item) {
      console.error('Item not found');
      return;
    }

    this.currentEditingBudgetId = budgetId;
    this.currentEditingItemId = itemId;

    // Populate form fields
    const titleEl = document.getElementById('budget-item-modal-title');
    const categoryEl = document.getElementById('budget-item-category');
    const groupEl = document.getElementById('budget-item-group');
    const newGroupEl = document.getElementById('budget-item-new-group');
    const amountEl = document.getElementById('budget-item-amount');
    const notesEl = document.getElementById('budget-item-notes');

    console.log('Form elements found:', { titleEl, categoryEl, groupEl, amountEl });

    titleEl.textContent = 'Edit Budget Item';
    categoryEl.value = item.category || '';
    groupEl.value = item.group || 'Other';
    newGroupEl.style.display = 'none';
    newGroupEl.value = '';
    amountEl.value = item.budgetAmount || 0;
    notesEl.value = item.notes || '';

    console.log('Form populated, showing modal');
    UI.showModal('budget-item-modal');
  }

  moveGroupUp(group) {
    const budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    if (!budget) return;

    // Get unique groups in order of appearance
    const groupOrder = [];
    budget.items.forEach(item => {
      const g = item.group || 'Other';
      if (!groupOrder.includes(g)) {
        groupOrder.push(g);
      }
    });

    const currentIndex = groupOrder.indexOf(group);
    if (currentIndex <= 0) return;

    // Swap with previous group
    const prevGroup = groupOrder[currentIndex - 1];
    const tempGroup = '__temp_swap__';

    // Rename current group to temp
    budget.items.forEach(item => {
      if (item.group === group) item.group = tempGroup;
    });

    // Rename previous group to current
    budget.items.forEach(item => {
      if (item.group === prevGroup) item.group = group;
    });

    // Rename temp to previous
    budget.items.forEach(item => {
      if (item.group === tempGroup) item.group = prevGroup;
    });

    this.saveBudgetOrder(budget);
  }

  moveGroupDown(group) {
    const budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    if (!budget) return;

    // Get unique groups in order of appearance
    const groupOrder = [];
    budget.items.forEach(item => {
      const g = item.group || 'Other';
      if (!groupOrder.includes(g)) {
        groupOrder.push(g);
      }
    });

    const currentIndex = groupOrder.indexOf(group);
    if (currentIndex >= groupOrder.length - 1) return;

    // Swap with next group
    const nextGroup = groupOrder[currentIndex + 1];
    const tempGroup = '__temp_swap__';

    // Rename current group to temp
    budget.items.forEach(item => {
      if (item.group === group) item.group = tempGroup;
    });

    // Rename next group to current
    budget.items.forEach(item => {
      if (item.group === nextGroup) item.group = group;
    });

    // Rename temp to next
    budget.items.forEach(item => {
      if (item.group === tempGroup) item.group = nextGroup;
    });

    this.saveBudgetOrder(budget);
  }

  async saveBudgetOrder(budget) {
    try {
      await ExpenseAPI.updateBudget(budget.id, {
        items: budget.items
      });
      this.loadBudgetView();
      UI.showNotification('Category order updated', 'success');
    } catch (error) {
      console.error('Error saving budget order:', error);
      UI.showNotification('Error updating category order', 'error');
    }
  }

  // Quick add spent amount - shows Add Spent modal
  quickAddSpent(budgetId, itemId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;

    const item = budget.items.find(i => i.id === itemId);
    if (!item) return;

    // Store context
    this.currentAddSpentContext = {
      budgetId,
      itemId,
      item
    };

    // Populate modal
    document.getElementById('add-spent-category').value = item.category;
    document.getElementById('add-spent-amount').value = '';
    document.getElementById('add-spent-notes').value = item.notes || '';

    // Populate income source dropdown with validation
    const incomeItems = budget.items.filter(i => i.group === 'Income');
    const sourceSelect = document.getElementById('add-spent-income-source');
    sourceSelect.innerHTML = '<option value="">-- Select Income Source --</option>';

    incomeItems.forEach(income => {
      const available = income.budgetAmount - income.actualAmount;
      // Only show income sources with available balance > 0
      if (available > 0) {
        const option = document.createElement('option');
        option.value = income.id;
        option.textContent = `${income.category} (Available: ${UI.formatCurrency(available)})`;
        option.dataset.available = available;
        sourceSelect.appendChild(option);
      }
    });

    if (sourceSelect.options.length <= 1) {
      UI.showNotification('No income sources with available balance', 'error');
      return;
    }

    // Add change listener for validation
    sourceSelect.addEventListener('change', () => this.validateIncomeSource());

    UI.showModal('add-spent-modal');
  }

  // Validate income source against expense amount
  validateIncomeSource() {
    const amountInput = document.getElementById('add-spent-amount');
    const sourceSelect = document.getElementById('add-spent-income-source');
    const validationDiv = document.getElementById('income-source-validation');
    const submitBtn = document.querySelector('#add-spent-form button[type="submit"]');

    const amount = parseFloat(amountInput.value) || 0;
    const selectedOption = sourceSelect.options[sourceSelect.selectedIndex];
    const available = parseFloat(selectedOption.dataset.available) || 0;

    if (amount > 0 && sourceSelect.value) {
      if (amount > available) {
        validationDiv.textContent = `❌ Amount exceeds available balance of ${UI.formatCurrency(available)}`;
        validationDiv.style.display = 'block';
        submitBtn.disabled = true;
      } else {
        validationDiv.style.display = 'none';
        submitBtn.disabled = false;
      }
    }
  }

  // Validate income source against expense amount (for Expense form)
  validateExpenseIncomeSource() {
    const amountInput = document.getElementById('expense-amount');
    const sourceSelect = document.getElementById('expense-income-source');
    const validationDiv = document.getElementById('expense-income-validation');
    const submitBtn = document.querySelector('#expense-form button[type="submit"]');

    const amount = parseFloat(amountInput.value) || 0;
    const selectedOption = sourceSelect.options[sourceSelect.selectedIndex];
    const available = parseFloat(selectedOption.dataset.available) || 0;

    if (amount > 0 && sourceSelect.value) {
      if (amount > available) {
        validationDiv.textContent = `❌ Amount exceeds available balance of ${UI.formatCurrency(available)}`;
        validationDiv.style.display = 'block';
        submitBtn.disabled = true;
      } else {
        validationDiv.style.display = 'none';
        submitBtn.disabled = false;
      }
    } else {
      validationDiv.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  // Handle Add Spent form submission
  async handleAddSpentSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('add-spent-amount').value);
    const sourceId = document.getElementById('add-spent-income-source').value;
    const notes = document.getElementById('add-spent-notes').value;

    console.log('handleAddSpentSubmit called with:', { amount, sourceId, notes });

    if (!amount || amount <= 0) {
      UI.showNotification('Please enter a valid amount', 'error');
      return;
    }

    if (!sourceId) {
      UI.showNotification('Please select an income source', 'error');
      return;
    }

    const { budgetId, itemId, item } = this.currentAddSpentContext;
    console.log('Current context:', { budgetId, itemId, item });

    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) {
      console.error('Budget not found:', budgetId);
      return;
    }

    const incomeItem = budget.items.find(i => i.id === sourceId);
    if (!incomeItem) {
      console.error('Income item not found:', sourceId);
      return;
    }

    console.log('Income item:', incomeItem);

    try {
      // Update expense item's spent amount
      console.log(`Updating expense item: ${item.category} from actualAmount ${item.actualAmount} to ${item.actualAmount + amount}`);
      await ExpenseAPI.updateBudgetItem(budgetId, itemId, {
        category: item.category,
        group: item.group,
        budgetAmount: item.budgetAmount,
        actualAmount: item.actualAmount + amount,
        incomeSource: incomeItem.category,
        notes: notes
      });

      // ALSO update income item's actualAmount - deduct the spent amount from the income source
      // actualAmount for income items represents amount SPENT (not available)
      // Available = budgetAmount - actualAmount
      // When spending, we ADD to actualAmount to REDUCE available balance
      const newIncomeActualAmount = incomeItem.actualAmount + amount;
      console.log(`Updating income source: ${incomeItem.category} from actualAmount ${incomeItem.actualAmount} to ${newIncomeActualAmount} (deducting ${amount} from available)`);
      await ExpenseAPI.updateBudgetItem(budgetId, sourceId, {
        category: incomeItem.category,
        group: incomeItem.group,
        budgetAmount: incomeItem.budgetAmount,
        actualAmount: newIncomeActualAmount,
        incomeSource: incomeItem.incomeSource,
        notes: incomeItem.notes
      });

      console.log('About to create expense transaction with:', { category: item.category, amount, paymentMethod: incomeItem.category });

      // Create expense transaction in Expenses tab
      await this.createExpenseTransaction(item.category, amount, incomeItem.category);

      await this.loadData();
      this.loadBudgetView();
      UI.hideModal('add-spent-modal');
      UI.showNotification(`Recorded ${UI.formatCurrency(amount)} spent from ${incomeItem.category}`, 'success');
    } catch (error) {
      console.error('Error recording spent:', error);
      UI.showNotification('Error recording spent amount', 'error');
    }
  }

  // Create expense transaction in Expenses tab
  async createExpenseTransaction(categoryName, amount, paymentMethod) {
    try {
      console.log('createExpenseTransaction called with:', { categoryName, amount, paymentMethod });
      console.log('Available categories:', this.categories);

      // Find category ID by name
      const categoryObj = this.categories.find(c => c.name === categoryName);
      console.log('Found category object:', categoryObj);

      const categoryId = categoryObj ? categoryObj.id : 10; // Default to "Other" if not found
      console.log('Using category ID:', categoryId);

      const today = new Date().toISOString().split('T')[0];
      const expense = {
        category: categoryId,
        amount: amount,
        date: today,
        paymentMethod: paymentMethod,
        notes: `Budget: ${categoryName}`
      };

      console.log('Creating expense:', expense);

      // Add to expenses
      const result = await ExpenseAPI.createExpense(expense);
      console.log('Expense created successfully:', result);
    } catch (error) {
      console.error('Error creating expense transaction:', error);
      // Don't fail the whole operation if transaction creation fails
    }
  }

  async deleteBudgetItem(budgetId, itemId) {
    if (!confirm('Are you sure you want to delete this budget item?')) {
      return;
    }

    try {
      await ExpenseAPI.deleteBudgetItem(budgetId, itemId);
      await this.loadData();
      this.loadBudgetView();
      UI.showNotification('Budget item deleted successfully');
    } catch (error) {
      console.error('Error deleting budget item:', error);
      UI.showNotification('Error deleting budget item', 'error');
    }
  }

  async copyBudgetToNextMonth() {
    const budget = this.budgets.find(b => b.month === this.currentBudgetMonth);
    if (!budget) {
      UI.showNotification('No budget to copy', 'error');
      return;
    }

    const nextMonth = this.getNextMonth(this.currentBudgetMonth);
    const existingBudget = this.budgets.find(b => b.month === nextMonth);

    if (existingBudget) {
      UI.showNotification('Budget already exists for next month', 'error');
      return;
    }

    try {
      await ExpenseAPI.copyBudget(budget.id, nextMonth);
      await this.loadData();
      this.currentBudgetMonth = nextMonth;
      this.populateBudgetMonthSelect();
      this.loadBudgetView();
      UI.showNotification('Budget copied to next month successfully');
    } catch (error) {
      console.error('Error copying budget:', error);
      UI.showNotification('Error copying budget', 'error');
    }
  }

  previousBudgetMonth() {
    this.currentBudgetMonth = this.getPreviousMonth(this.currentBudgetMonth);
    document.getElementById('budget-month-select').value = this.currentBudgetMonth;
    this.loadBudgetView();
  }

  nextBudgetMonth() {
    this.currentBudgetMonth = this.getNextMonth(this.currentBudgetMonth);
    document.getElementById('budget-month-select').value = this.currentBudgetMonth;
    this.loadBudgetView();
  }

  loadSettingsView() {
    // Update statistics
    document.getElementById('settings-total-expenses').textContent = this.expenses.length;
    document.getElementById('settings-total-categories').textContent = this.categories.length;

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
      categories: this.categories,
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

    // Clear localStorage
    localStorage.clear();

    // Reload
    location.reload();
  }



  // ==================== TASK METHODS ====================

  async saveTask() {
    await this.taskManager.saveTask();
  }

  loadTasksView() {
    UI.showView('tasks-view');
    document.getElementById('page-title').textContent = '📋 My Tasks';
  }

  // ==================== UTILITY METHODS ====================

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

      // Validate inputs
      if (!email || !password) {
        messageEl.classList.remove('success');
        messageEl.classList.add('error');
        messageEl.textContent = 'Please enter both email and password';
        messageEl.style.display = 'block';
        return;
      }

      messageEl.classList.remove('error', 'success');
      messageEl.textContent = 'Logging in...';
      messageEl.style.display = 'block';

      console.log('Attempting login with email:', email);
      const success = await AuthManager.login(email, password);

      if (success) {
        messageEl.classList.add('success');
        messageEl.textContent = 'Login successful!';
        messageEl.style.display = 'block';
        setTimeout(() => {
          app = new ExpenseTrackerApp();
        }, 500);
      } else {
        messageEl.classList.add('error');
        messageEl.textContent = 'Login failed. Please check your credentials.';
        messageEl.style.display = 'block';
        console.error('Login failed for email:', email);
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
        messageEl.style.display = 'block';
        document.getElementById('register-form').reset();
        setTimeout(() => {
          AuthManager.switchToLogin();
        }, 1500);
      } else {
        messageEl.classList.add('error');
        messageEl.textContent = 'Registration failed. Please try again.';
        messageEl.style.display = 'block';
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

