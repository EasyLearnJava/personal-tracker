const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../data/expenses.json');
const CATEGORIES_PATH = path.join(__dirname, '../data/categories.json');
const INCOME_PATH = path.join(__dirname, '../data/income.json');
const PAYMENT_METHODS_PATH = path.join(__dirname, '../data/paymentMethods.json');
const CARDS_PATH = path.join(__dirname, '../data/cards.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default categories
const categories = [
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

// Generate dummy expenses for the current month
const generateDummyExpenses = () => {
  const expenses = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const expenseTemplates = [
    { desc: 'Coffee at Starbucks', amount: 5.50, category: 1, payment: 'credit_card', card: 'Visa' },
    { desc: 'Lunch at Restaurant', amount: 25.00, category: 1, payment: 'credit_card', card: 'Mastercard' },
    { desc: 'Grocery Shopping', amount: 85.50, category: 1, payment: 'debit_card', card: 'Bank Account' },
    { desc: 'Gas', amount: 45.00, category: 2, payment: 'credit_card', card: 'Visa' },
    { desc: 'Uber Ride', amount: 15.75, category: 2, payment: 'credit_card', card: 'Amex' },
    { desc: 'Movie Tickets', amount: 30.00, category: 4, payment: 'credit_card', card: 'Visa' },
    { desc: 'Netflix Subscription', amount: 15.99, category: 9, payment: 'credit_card', card: 'Mastercard' },
    { desc: 'Electricity Bill', amount: 120.00, category: 5, payment: 'bank_transfer', card: 'Bank Account' },
    { desc: 'Internet Bill', amount: 60.00, category: 5, payment: 'bank_transfer', card: 'Bank Account' },
    { desc: 'Doctor Visit', amount: 150.00, category: 6, payment: 'credit_card', card: 'Visa' },
    { desc: 'Gym Membership', amount: 50.00, category: 4, payment: 'credit_card', card: 'Mastercard' },
    { desc: 'Book Purchase', amount: 25.00, category: 7, payment: 'credit_card', card: 'Visa' },
    { desc: 'Flight Ticket', amount: 350.00, category: 8, payment: 'credit_card', card: 'Amex' },
    { desc: 'Hotel Stay', amount: 200.00, category: 8, payment: 'credit_card', card: 'Visa' },
    { desc: 'Shopping at Mall', amount: 120.00, category: 3, payment: 'credit_card', card: 'Mastercard' },
    { desc: 'Dinner with Friends', amount: 65.00, category: 1, payment: 'credit_card', card: 'Visa' },
    { desc: 'Parking Fee', amount: 10.00, category: 2, payment: 'cash', card: 'Cash' },
    { desc: 'Pharmacy', amount: 35.00, category: 6, payment: 'credit_card', card: 'Visa' },
    { desc: 'Haircut', amount: 40.00, category: 3, payment: 'cash', card: 'Cash' },
    { desc: 'Spotify Premium', amount: 9.99, category: 9, payment: 'credit_card', card: 'Mastercard' }
  ];

  // Generate 30 random expenses throughout the month
  for (let i = 0; i < 30; i++) {
    const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(currentYear, currentMonth, day);

    expenses.push({
      id: uuidv4(),
      amount: template.amount,
      category: template.category,
      description: template.desc,
      date: date.toISOString(),
      paymentMethod: template.payment,
      cardName: template.card,
      frequency: 'once',
      notes: '',
      tags: [],
      isRecurring: false,
      recurringEndDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return expenses;
};

// Generate dummy income
const generateDummyIncome = () => {
  const income = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const incomeSources = [
    { source: 'Salary', amount: 5000, frequency: 'monthly' },
    { source: 'Freelance', amount: 1500, frequency: 'monthly' },
    { source: 'Investment', amount: 300, frequency: 'monthly' },
    { source: 'Bonus', amount: 2000, frequency: 'once' }
  ];

  incomeSources.forEach((src, idx) => {
    const day = (idx + 1) * 5;
    if (day <= 28) {
      const date = new Date(currentYear, currentMonth, day);
      income.push({
        id: uuidv4(),
        amount: src.amount,
        source: src.source,
        description: `${src.source} income`,
        date: date.toISOString(),
        frequency: src.frequency,
        isRecurring: src.frequency !== 'once',
        recurringEndDate: null,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  return income;
};

// Generate dummy payment methods
const generateDummyPaymentMethods = () => {
  return [
    { id: 'pm_1', name: 'Credit Card', type: 'card', icon: '💳', color: '#667eea', isActive: true, createdAt: new Date().toISOString() },
    { id: 'pm_2', name: 'Debit Card', type: 'card', icon: '🏧', color: '#4ECDC4', isActive: true, createdAt: new Date().toISOString() },
    { id: 'pm_3', name: 'Bank Transfer', type: 'bank', icon: '🏦', color: '#10b981', isActive: true, createdAt: new Date().toISOString() },
    { id: 'pm_4', name: 'Cash', type: 'cash', icon: '💵', color: '#FFE66D', isActive: true, createdAt: new Date().toISOString() }
  ];
};

// Generate dummy cards
const generateDummyCards = () => {
  return [
    {
      id: 'card_1',
      name: 'My Visa',
      cardType: 'credit',
      provider: 'Visa',
      lastFourDigits: '1234',
      paymentMethodId: 'pm_1',
      bankName: 'Chase',
      expiryDate: '12/25',
      isActive: true,
      color: '#667eea',
      createdAt: new Date().toISOString()
    },
    {
      id: 'card_2',
      name: 'Business Mastercard',
      cardType: 'credit',
      provider: 'Mastercard',
      lastFourDigits: '5678',
      paymentMethodId: 'pm_1',
      bankName: 'Bank of America',
      expiryDate: '08/26',
      isActive: true,
      color: '#764ba2',
      createdAt: new Date().toISOString()
    },
    {
      id: 'card_3',
      name: 'Debit Card',
      cardType: 'debit',
      provider: 'Visa',
      lastFourDigits: '9012',
      paymentMethodId: 'pm_2',
      bankName: 'Wells Fargo',
      expiryDate: '03/27',
      isActive: true,
      color: '#4ECDC4',
      createdAt: new Date().toISOString()
    }
  ];
};

// Write data to files
const expenses = generateDummyExpenses();
const income = generateDummyIncome();
const paymentMethods = generateDummyPaymentMethods();
const cards = generateDummyCards();

fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
fs.writeFileSync(DB_PATH, JSON.stringify(expenses, null, 2));
fs.writeFileSync(INCOME_PATH, JSON.stringify(income, null, 2));
fs.writeFileSync(PAYMENT_METHODS_PATH, JSON.stringify(paymentMethods, null, 2));
fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2));

console.log('✅ Database seeded successfully!');
console.log(`📊 Created ${expenses.length} dummy expenses`);
console.log(`🏷️  Created ${categories.length} categories`);
console.log(`💰 Created ${income.length} dummy income entries`);
console.log(`💳 Created ${paymentMethods.length} payment methods`);
console.log(`🏦 Created ${cards.length} cards`);

