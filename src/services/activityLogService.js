const db = require('../db/database');
const ActivityLog = require('../models/ActivityLog');

class ActivityLogService {
  // Create a new activity log entry
  static createActivityLog(logData) {
    const logs = db.readActivityLog();
    const log = new ActivityLog(logData);
    logs.push(log.toJSON());
    db.writeActivityLog(logs);
    return log.toJSON();
  }

  // Get all activity logs
  static getAllActivityLogs() {
    return db.readActivityLog().sort((a, b) => 
      new Date(b.activityDate) - new Date(a.activityDate)
    );
  }

  // Get activity log by ID
  static getActivityLogById(id) {
    const logs = db.readActivityLog();
    return logs.find(l => l.id === id);
  }

  // Get activity logs by type
  static getActivityLogsByType(type) {
    const logs = db.readActivityLog();
    return logs
      .filter(l => l.activityType === type)
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
  }

  // Get activity logs by date range
  static getActivityLogsByDateRange(startDate, endDate) {
    const logs = db.readActivityLog();
    return logs
      .filter(l => {
        const logDate = new Date(l.activityDate);
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
      })
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
  }

  // Get activity logs by entity
  static getActivityLogsByEntity(entityId, entityType) {
    const logs = db.readActivityLog();
    return logs
      .filter(l => l.relatedEntityId === entityId && l.relatedEntityType === entityType)
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
  }

  // Get recent activity logs
  static getRecentActivityLogs(limit = 20) {
    const logs = db.readActivityLog();
    return logs
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate))
      .slice(0, limit);
  }

  // Get activity logs by category
  static getActivityLogsByCategory(category) {
    const logs = db.readActivityLog();
    return logs
      .filter(l => l.category === category)
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
  }

  // Update activity log
  static updateActivityLog(id, updateData) {
    const logs = db.readActivityLog();
    const index = logs.findIndex(l => l.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...logs[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    logs[index] = updated;
    db.writeActivityLog(logs);
    return updated;
  }

  // Delete activity log
  static deleteActivityLog(id) {
    const logs = db.readActivityLog();
    const filtered = logs.filter(l => l.id !== id);
    
    if (filtered.length === logs.length) {
      return false;
    }

    db.writeActivityLog(filtered);
    return true;
  }

  // Get activity statistics
  static getActivityStatistics() {
    const logs = db.readActivityLog();
    const types = {};
    let totalAmount = 0;

    logs.forEach(log => {
      types[log.activityType] = (types[log.activityType] || 0) + 1;
      totalAmount += parseFloat(log.amount || 0);
    });

    return {
      totalActivities: logs.length,
      totalAmount: totalAmount,
      byType: types,
      lastActivity: logs.length > 0 ? logs[0] : null
    };
  }

  // Get activity summary by date
  static getActivitySummaryByDate(days = 30) {
    const logs = db.readActivityLog();
    const summary = {};
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      summary[dateStr] = 0;
    }

    logs.forEach(log => {
      const dateStr = log.activityDate.split('T')[0];
      if (summary.hasOwnProperty(dateStr)) {
        summary[dateStr]++;
      }
    });

    return summary;
  }

  // Get activity by type and date range
  static getActivityByTypeAndDateRange(type, startDate, endDate) {
    const logs = db.readActivityLog();
    return logs
      .filter(l => {
        const logDate = new Date(l.activityDate);
        return l.activityType === type && 
               logDate >= new Date(startDate) && 
               logDate <= new Date(endDate);
      })
      .sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
  }

  // Log expense activity
  static logExpenseActivity(expenseData) {
    return this.createActivityLog({
      activityType: 'expense',
      description: `Expense: ${expenseData.description || 'Unnamed'} - $${expenseData.amount}`,
      amount: expenseData.amount,
      relatedEntityId: expenseData.id,
      relatedEntityType: 'expense',
      relatedEntityName: expenseData.description,
      category: expenseData.category,
      status: 'completed',
      activityDate: new Date().toISOString()
    });
  }

  // Log income activity
  static logIncomeActivity(incomeData) {
    return this.createActivityLog({
      activityType: 'income',
      description: `Income: ${incomeData.source || 'Unnamed'} - $${incomeData.amount}`,
      amount: incomeData.amount,
      relatedEntityId: incomeData.id,
      relatedEntityType: 'income',
      relatedEntityName: incomeData.source,
      category: incomeData.source,
      status: 'completed',
      activityDate: new Date().toISOString()
    });
  }

  // Log payment activity
  static logPaymentActivity(paymentData) {
    return this.createActivityLog({
      activityType: 'payment',
      description: `Payment: ${paymentData.debtName} - $${paymentData.amount}`,
      amount: paymentData.amount,
      relatedEntityId: paymentData.debtId,
      relatedEntityType: 'debt',
      relatedEntityName: paymentData.debtName,
      category: 'payment',
      status: 'completed',
      activityDate: new Date().toISOString()
    });
  }

  // Log debt activity
  static logDebtActivity(debtData, action = 'created') {
    return this.createActivityLog({
      activityType: `debt_${action}`,
      description: `Debt ${action}: ${debtData.name} - $${debtData.currentBalance}`,
      amount: debtData.currentBalance,
      relatedEntityId: debtData.id,
      relatedEntityType: 'debt',
      relatedEntityName: debtData.name,
      category: debtData.type,
      status: 'completed',
      activityDate: new Date().toISOString()
    });
  }
}

module.exports = ActivityLogService;

