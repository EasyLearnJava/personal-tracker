// Payment History UI Manager
class PaymentHistoryUI {
  static async loadPaymentHistory() {
    try {
      const history = await ExpenseAPI.getPaymentHistory();
      this.displayPaymentHistory(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
      UI.showNotification('Failed to load payment history', 'error');
    }
  }

  static displayPaymentHistory(history) {
    const container = document.getElementById('payment-history-list');
    if (!container) return;

    if (!history || history.length === 0) {
      container.innerHTML = '<p class="empty-state">No payment history found</p>';
      return;
    }

    // Sort by date descending
    const sorted = history.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    container.innerHTML = sorted.map(payment => `
      <div class="payment-history-item">
        <div class="payment-history-left">
          <div class="payment-icon">💳</div>
          <div class="payment-details">
            <h4>${payment.debtName || 'Unknown Debt'}</h4>
            <p class="payment-date">${new Date(payment.paymentDate).toLocaleDateString()}</p>
            <p class="payment-method">${payment.paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' : '💵 ' + payment.paymentMethod}</p>
          </div>
        </div>
        <div class="payment-history-right">
          <p class="payment-amount">-$${parseFloat(payment.amount).toFixed(2)}</p>
          <p class="payment-status ${payment.status}">${payment.status}</p>
        </div>
      </div>
    `).join('');
  }

  static async loadPaymentStatistics() {
    try {
      const stats = await ExpenseAPI.getPaymentStatistics();
      this.displayPaymentStatistics(stats);
    } catch (error) {
      console.error('Error loading payment statistics:', error);
    }
  }

  static displayPaymentStatistics(stats) {
    console.log('Payment Statistics:', stats);
    // Can be displayed in a summary card
  }
}

// Bank Accounts UI Manager
class BankAccountsUI {
  static async loadBankAccounts() {
    try {
      const accounts = await ExpenseAPI.getBankAccounts();
      this.displayBankAccounts(accounts);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      UI.showNotification('Failed to load bank accounts', 'error');
    }
  }

  static displayBankAccounts(accounts) {
    const container = document.getElementById('bank-accounts-list');
    if (!container) return;

    if (!accounts || accounts.length === 0) {
      container.innerHTML = '<p class="empty-state">No bank accounts found. Add one to get started!</p>';
      return;
    }

    container.innerHTML = accounts.map(account => `
      <div class="bank-account-card">
        <div class="account-header">
          <h3>${account.accountName}</h3>
          <span class="account-type">${account.accountType}</span>
        </div>
        <div class="account-balance">
          <p class="balance-label">Current Balance</p>
          <p class="balance-amount">$${parseFloat(account.currentBalance).toFixed(2)}</p>
        </div>
        <div class="account-details">
          <div class="detail-item">
            <span class="detail-label">Initial Balance</span>
            <span class="detail-value">$${parseFloat(account.initialBalance).toFixed(2)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Change</span>
            <span class="detail-value ${account.currentBalance >= account.initialBalance ? 'positive' : 'negative'}">
              ${account.currentBalance >= account.initialBalance ? '+' : ''}$${(account.currentBalance - account.initialBalance).toFixed(2)}
            </span>
          </div>
        </div>
        <div class="account-actions">
          <button class="btn btn-small btn-secondary" onclick="BankAccountsUI.editAccount('${account.id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="BankAccountsUI.deleteAccount('${account.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  static async getTotalBalance() {
    try {
      const result = await ExpenseAPI.getTotalBalance();
      return result.totalBalance || 0;
    } catch (error) {
      console.error('Error getting total balance:', error);
      return 0;
    }
  }

  static editAccount(accountId) {
    console.log('Edit account:', accountId);
    // TODO: Implement edit functionality
  }

  static async deleteAccount(accountId) {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        // TODO: Implement delete API call
        UI.showNotification('Account deleted successfully', 'success');
        this.loadBankAccounts();
      } catch (error) {
        UI.showNotification('Failed to delete account', 'error');
      }
    }
  }
}

// Activity Log UI Manager
class ActivityLogUI {
  static async loadActivityLog() {
    try {
      const logs = await ExpenseAPI.getRecentActivityLogs(50);
      this.displayActivityLog(logs);
    } catch (error) {
      console.error('Error loading activity log:', error);
      UI.showNotification('Failed to load activity log', 'error');
    }
  }

  static displayActivityLog(logs) {
    const container = document.getElementById('activity-log-list');
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<p class="empty-state">No activities found</p>';
      return;
    }

    container.innerHTML = logs.map(log => `
      <div class="activity-log-item">
        <div class="activity-icon">${this.getActivityIcon(log.activityType)}</div>
        <div class="activity-content">
          <h4>${log.description}</h4>
          <p class="activity-date">${new Date(log.activityDate).toLocaleString()}</p>
          <p class="activity-type">${log.activityType}</p>
        </div>
        <div class="activity-amount">
          <p class="amount ${log.activityType === 'income' ? 'positive' : 'negative'}">
            ${log.activityType === 'income' ? '+' : '-'}$${parseFloat(log.amount).toFixed(2)}
          </p>
        </div>
      </div>
    `).join('');
  }

  static getActivityIcon(type) {
    const icons = {
      'expense': '💳',
      'income': '💰'
    };
    return icons[type] || '📌';
  }

  static async loadActivityStatistics() {
    try {
      const stats = await ExpenseAPI.getActivityStatistics();
      console.log('Activity Statistics:', stats);
      // Can be displayed in a summary card
    } catch (error) {
      console.error('Error loading activity statistics:', error);
    }
  }
}

