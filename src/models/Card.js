class Card {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.name = data.name; // e.g., 'My Visa', 'Business Mastercard'
    this.cardType = data.cardType; // 'credit', 'debit'
    this.provider = data.provider; // 'Visa', 'Mastercard', 'Amex', 'Discover'
    this.lastFourDigits = data.lastFourDigits; // e.g., '1234'
    this.paymentMethodId = data.paymentMethodId; // Reference to payment method
    this.bankName = data.bankName; // e.g., 'Chase', 'Bank of America'
    this.expiryDate = data.expiryDate; // MM/YY format
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.color = data.color || '#667eea';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cardType: this.cardType,
      provider: this.provider,
      lastFourDigits: this.lastFourDigits,
      paymentMethodId: this.paymentMethodId,
      bankName: this.bankName,
      expiryDate: this.expiryDate,
      isActive: this.isActive,
      color: this.color,
      createdAt: this.createdAt
    };
  }
}

module.exports = Card;

