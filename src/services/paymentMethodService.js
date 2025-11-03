const db = require('../db/database');
const PaymentMethod = require('../models/PaymentMethod');

class PaymentMethodService {
  // Get all payment methods
  static getAllPaymentMethods() {
    return db.readPaymentMethods();
  }

  // Get payment method by ID
  static getPaymentMethodById(id) {
    const methods = db.readPaymentMethods();
    return methods.find(m => m.id === id);
  }

  // Add new payment method
  static addPaymentMethod(methodData) {
    const methods = db.readPaymentMethods();
    const newMethod = new PaymentMethod(methodData);
    methods.push(newMethod.toJSON());
    db.writePaymentMethods(methods);
    return newMethod.toJSON();
  }

  // Update payment method
  static updatePaymentMethod(id, updateData) {
    const methods = db.readPaymentMethods();
    const index = methods.findIndex(m => m.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...methods[index],
      ...updateData
    };

    methods[index] = updated;
    db.writePaymentMethods(methods);
    return updated;
  }

  // Delete payment method
  static deletePaymentMethod(id) {
    const methods = db.readPaymentMethods();
    const filtered = methods.filter(m => m.id !== id);
    
    if (filtered.length === methods.length) {
      return false;
    }

    db.writePaymentMethods(filtered);
    return true;
  }

  // Get active payment methods
  static getActivePaymentMethods() {
    const methods = db.readPaymentMethods();
    return methods.filter(m => m.isActive);
  }
}

module.exports = PaymentMethodService;

