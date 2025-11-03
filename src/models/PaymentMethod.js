class PaymentMethod {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.name = data.name; // e.g., 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'
    this.type = data.type; // 'card', 'bank', 'cash', 'digital_wallet'
    this.icon = data.icon || '💳';
    this.color = data.color || '#667eea';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      icon: this.icon,
      color: this.color,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = PaymentMethod;

