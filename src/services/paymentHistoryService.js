const db = require('../db/database');
const PaymentHistory = require('../models/PaymentHistory');

class PaymentHistoryService {
  // Create a new payment history record
  static createPaymentHistory(historyData) {
    const history = db.readPaymentHistory();
    const payment = new PaymentHistory(historyData);
    history.push(payment.toJSON());
    db.writePaymentHistory(history);
    return payment.toJSON();
  }

  // Get all payment history
  static getAllPaymentHistory() {
    return db.readPaymentHistory();
  }

  // Get payment history by ID
  static getPaymentHistoryById(id) {
    const history = db.readPaymentHistory();
    return history.find(h => h.id === id);
  }

  // Get payment history by debt ID
  static getPaymentHistoryByDebtId(debtId) {
    const history = db.readPaymentHistory();
    return history.filter(h => h.debtId === debtId).sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    );
  }

  // Get payment history by date range
  static getPaymentHistoryByDateRange(startDate, endDate) {
    const history = db.readPaymentHistory();
    return history.filter(h => {
      const paymentDate = new Date(h.paymentDate);
      return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
    }).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }

  // Get payment history by payment method
  static getPaymentHistoryByMethod(method) {
    const history = db.readPaymentHistory();
    return history.filter(h => h.paymentMethod === method).sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    );
  }

  // Get payment history by source account
  static getPaymentHistoryByAccount(accountId) {
    const history = db.readPaymentHistory();
    return history.filter(h => h.sourceAccountId === accountId).sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    );
  }

  // Update payment history
  static updatePaymentHistory(id, updateData) {
    const history = db.readPaymentHistory();
    const index = history.findIndex(h => h.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...history[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    history[index] = updated;
    db.writePaymentHistory(history);
    return updated;
  }

  // Delete payment history
  static deletePaymentHistory(id) {
    const history = db.readPaymentHistory();
    const filtered = history.filter(h => h.id !== id);
    
    if (filtered.length === history.length) {
      return false;
    }

    db.writePaymentHistory(filtered);
    return true;
  }

  // Get total paid for a debt
  static getTotalPaidForDebt(debtId) {
    const history = db.readPaymentHistory();
    return history
      .filter(h => h.debtId === debtId && h.status === 'completed')
      .reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
  }

  // Get total paid by payment method
  static getTotalPaidByMethod(method) {
    const history = db.readPaymentHistory();
    return history
      .filter(h => h.paymentMethod === method && h.status === 'completed')
      .reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
  }

  // Get total paid from account
  static getTotalPaidFromAccount(accountId) {
    const history = db.readPaymentHistory();
    return history
      .filter(h => h.sourceAccountId === accountId && h.status === 'completed')
      .reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
  }

  // Get recent payments
  static getRecentPayments(limit = 10) {
    const history = db.readPaymentHistory();
    return history
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, limit);
  }

  // Get payment statistics
  static getPaymentStatistics() {
    const history = db.readPaymentHistory();
    const completed = history.filter(h => h.status === 'completed');
    
    return {
      totalPayments: history.length,
      completedPayments: completed.length,
      totalAmountPaid: completed.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0),
      averagePayment: completed.length > 0 
        ? completed.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0) / completed.length 
        : 0,
      lastPaymentDate: completed.length > 0 
        ? completed.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0].paymentDate 
        : null
    };
  }
}

module.exports = PaymentHistoryService;

