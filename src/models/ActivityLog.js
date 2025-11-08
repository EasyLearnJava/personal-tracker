const { v4: uuidv4 } = require('uuid');

class ActivityLog {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.activityType = data.activityType; // 'expense', 'income'
    this.description = data.description; // Human-readable description
    this.amount = data.amount || 0; // Transaction amount
    this.relatedEntityId = data.relatedEntityId; // ID of related entity (expense, income)
    this.relatedEntityType = data.relatedEntityType; // 'expense', 'income'
    this.relatedEntityName = data.relatedEntityName; // Name for display
    this.category = data.category || ''; // Category if applicable
    this.status = data.status || 'completed'; // 'pending', 'completed', 'failed'
    this.activityDate = data.activityDate || new Date().toISOString();
    this.metadata = data.metadata || {}; // Additional data as JSON
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      activityType: this.activityType,
      description: this.description,
      amount: this.amount,
      relatedEntityId: this.relatedEntityId,
      relatedEntityType: this.relatedEntityType,
      relatedEntityName: this.relatedEntityName,
      category: this.category,
      status: this.status,
      activityDate: this.activityDate,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Get activity icon based on type
  getIcon() {
    const icons = {
      'expense': '💸',
      'income': '💰'
    };
    return icons[this.activityType] || '📋';
  }

  // Get activity color based on type
  getColor() {
    const colors = {
      'expense': '#ff6b6b',
      'income': '#51cf66'
    };
    return colors[this.activityType] || '#95a5a6';
  }
}

module.exports = ActivityLog;

