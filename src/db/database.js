const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/expenses.json');
const CATEGORIES_PATH = path.join(__dirname, '../../data/categories.json');
const INCOME_PATH = path.join(__dirname, '../../data/income.json');
const PAYMENT_METHODS_PATH = path.join(__dirname, '../../data/paymentMethods.json');
const CARDS_PATH = path.join(__dirname, '../../data/cards.json');
const DEBTS_PATH = path.join(__dirname, '../../data/debts.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize database with default data
const initializeDatabase = () => {
  ensureDataDir();

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(CATEGORIES_PATH)) {
    const defaultCategories = [
      { id: 1, name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
      { id: 2, name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
      { id: 3, name: 'Shopping', icon: '🛍️', color: '#FFE66D' },
      { id: 4, name: 'Entertainment', icon: '🎬', color: '#95E1D3' },
      { id: 5, name: 'Utilities', icon: '💡', color: '#A8E6CF' },
      { id: 6, name: 'Healthcare', icon: '⚕️', color: '#FF8B94' },
      { id: 7, name: 'Education', icon: '📚', color: '#C7CEEA' },
      { id: 8, name: 'Travel', icon: '✈️', color: '#B5EAD7' },
      { id: 9, name: 'Subscriptions', icon: '📱', color: '#FFDAC1' },
      { id: 10, name: 'Other', icon: '📌', color: '#E0BBE4' }
    ];
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(defaultCategories, null, 2));
  }

  if (!fs.existsSync(INCOME_PATH)) {
    fs.writeFileSync(INCOME_PATH, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(PAYMENT_METHODS_PATH)) {
    const defaultPaymentMethods = [
      { id: 'pm_1', name: 'Credit Card', type: 'card', icon: '💳', color: '#667eea', isActive: true, createdAt: new Date().toISOString() },
      { id: 'pm_2', name: 'Debit Card', type: 'card', icon: '🏧', color: '#4ECDC4', isActive: true, createdAt: new Date().toISOString() },
      { id: 'pm_3', name: 'Bank Transfer', type: 'bank', icon: '🏦', color: '#10b981', isActive: true, createdAt: new Date().toISOString() },
      { id: 'pm_4', name: 'Cash', type: 'cash', icon: '💵', color: '#FFE66D', isActive: true, createdAt: new Date().toISOString() }
    ];
    fs.writeFileSync(PAYMENT_METHODS_PATH, JSON.stringify(defaultPaymentMethods, null, 2));
  }

  if (!fs.existsSync(CARDS_PATH)) {
    fs.writeFileSync(CARDS_PATH, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(DEBTS_PATH)) {
    fs.writeFileSync(DEBTS_PATH, JSON.stringify([], null, 2));
  }
};

// Read expenses
const readExpenses = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading expenses:', error);
    return [];
  }
};

// Write expenses
const writeExpenses = (expenses) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(expenses, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing expenses:', error);
    return false;
  }
};

// Read categories
const readCategories = () => {
  try {
    const data = fs.readFileSync(CATEGORIES_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
};

// Write categories
const writeCategories = (categories) => {
  try {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    return false;
  }
};

// Read income
const readIncome = () => {
  try {
    const data = fs.readFileSync(INCOME_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading income:', error);
    return [];
  }
};

// Write income
const writeIncome = (income) => {
  try {
    fs.writeFileSync(INCOME_PATH, JSON.stringify(income, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing income:', error);
    return false;
  }
};

// Read payment methods
const readPaymentMethods = () => {
  try {
    const data = fs.readFileSync(PAYMENT_METHODS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payment methods:', error);
    return [];
  }
};

// Write payment methods
const writePaymentMethods = (methods) => {
  try {
    fs.writeFileSync(PAYMENT_METHODS_PATH, JSON.stringify(methods, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing payment methods:', error);
    return false;
  }
};

// Read cards
const readCards = () => {
  try {
    const data = fs.readFileSync(CARDS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cards:', error);
    return [];
  }
};

// Write cards
const writeCards = (cards) => {
  try {
    fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing cards:', error);
    return false;
  }
};

// Read debts
const readDebts = () => {
  try {
    const data = fs.readFileSync(DEBTS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading debts:', error);
    return [];
  }
};

// Write debts
const writeDebts = (debts) => {
  try {
    fs.writeFileSync(DEBTS_PATH, JSON.stringify(debts, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing debts:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
  readExpenses,
  writeExpenses,
  readCategories,
  writeCategories,
  readIncome,
  writeIncome,
  readPaymentMethods,
  writePaymentMethods,
  readCards,
  writeCards,
  readDebts,
  writeDebts
};

