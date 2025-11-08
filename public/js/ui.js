class UI {
  static showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  static hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  static switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-view="${viewName}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      expenses: 'Expenses',
      reports: 'Reports',
      categories: 'Categories',
      'activity-log': 'Activity Log',
      tasks: 'Tasks',
      settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[viewName];

    // Load data for specific views
    if (viewName === 'activity-log') {
      ActivityLogUI.loadActivityLog();
    }
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatDate(dateString) {
    // Parse date string in format YYYY-MM-DD to avoid timezone issues
    // new Date("2025-11-02") interprets as UTC, causing -1 day offset
    // Instead, parse manually to use local timezone
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static getDateRange() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }

  static showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 2000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  static renderExpenseItem(expense, categories) {
    const category = categories.find(c => c.id === expense.category);
    const categoryIcon = category ? category.icon : '📌';
    const categoryName = category ? category.name : 'Expense';

    return `
      <div class="expense-item">
        <div class="expense-left">
          <div class="expense-icon">${categoryIcon}</div>
          <div class="expense-details">
            <h4>${categoryName}</h4>
            <p>${UI.formatDate(expense.date)} • ${expense.cardName || expense.paymentMethod}</p>
          </div>
        </div>
        <div class="expense-right">
          <div class="expense-amount">${UI.formatCurrency(expense.amount)}</div>
          <div class="expense-actions">
            <button class="edit-btn" onclick="app.editExpense('${expense.id}')">Edit</button>
            <button class="delete-btn" onclick="app.deleteExpense('${expense.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  static renderReportRow(label, value, percentage = null) {
    return `
      <div class="report-row">
        <span class="report-row-label">${label}</span>
        <div>
          <span class="report-row-value">${UI.formatCurrency(value)}</span>
          ${percentage ? `<span style="color: var(--text-secondary); margin-left: 10px;">${percentage}%</span>` : ''}
        </div>
      </div>
    `;
  }

  static renderCategoryCard(category) {
    return `
      <div class="category-card">
        <div class="category-icon">${category.icon}</div>
        <div class="category-name">${category.name}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">${category.color}</div>
      </div>
    `;
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

