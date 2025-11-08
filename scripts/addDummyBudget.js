#!/usr/bin/env node

/**
 * Utility script to add dummy budget data for testing
 * Run: node scripts/addDummyBudget.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUDGETS_PATH = path.join(__dirname, '../data/budgets.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(BUDGETS_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Get current month in YYYY-MM format
const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Create dummy budget with sample data
const createDummyBudget = () => {
  const currentMonth = getCurrentMonth();
  
  const budgetItems = [
    // Housing
    { id: uuidv4(), category: 'Mortgage/Rent', group: 'Housing', budgetAmount: 1500, actualAmount: 1500, notes: 'Monthly rent' },
    { id: uuidv4(), category: 'Electricity', group: 'Housing', budgetAmount: 150, actualAmount: 120, notes: '' },
    { id: uuidv4(), category: 'Water', group: 'Housing', budgetAmount: 50, actualAmount: 45, notes: '' },
    { id: uuidv4(), category: 'Natural Gas', group: 'Housing', budgetAmount: 80, actualAmount: 75, notes: '' },
    { id: uuidv4(), category: 'Trash', group: 'Housing', budgetAmount: 30, actualAmount: 30, notes: '' },
    { id: uuidv4(), category: 'Home Maintenance', group: 'Housing', budgetAmount: 100, actualAmount: 50, notes: '' },
    { id: uuidv4(), category: 'Home Insurance', group: 'Housing', budgetAmount: 120, actualAmount: 120, notes: '' },
    
    // Transportation
    { id: uuidv4(), category: 'Gas', group: 'Transportation', budgetAmount: 200, actualAmount: 180, notes: '' },
    { id: uuidv4(), category: 'Car Maintenance', group: 'Transportation', budgetAmount: 100, actualAmount: 50, notes: '' },
    { id: uuidv4(), category: 'Car Insurance', group: 'Transportation', budgetAmount: 120, actualAmount: 120, notes: '' },
    { id: uuidv4(), category: 'Car Loan Payment', group: 'Transportation', budgetAmount: 350, actualAmount: 350, notes: 'Monthly car payment' },
    { id: uuidv4(), category: 'Public Transportation', group: 'Transportation', budgetAmount: 50, actualAmount: 40, notes: '' },
    { id: uuidv4(), category: 'Parking', group: 'Transportation', budgetAmount: 60, actualAmount: 60, notes: '' },
    
    // Utilities & Services
    { id: uuidv4(), category: 'Phone Bill', group: 'Utilities & Services', budgetAmount: 80, actualAmount: 80, notes: '' },
    { id: uuidv4(), category: 'Internet', group: 'Utilities & Services', budgetAmount: 60, actualAmount: 60, notes: '' },
    { id: uuidv4(), category: 'Subscriptions', group: 'Utilities & Services', budgetAmount: 50, actualAmount: 45, notes: 'Netflix, Spotify, etc' },
    { id: uuidv4(), category: 'Cable/TV', group: 'Utilities & Services', budgetAmount: 100, actualAmount: 100, notes: '' },
    
    // Food & Dining
    { id: uuidv4(), category: 'Groceries', group: 'Food & Dining', budgetAmount: 400, actualAmount: 350, notes: '' },
    { id: uuidv4(), category: 'Restaurants/Dining Out', group: 'Food & Dining', budgetAmount: 150, actualAmount: 120, notes: '' },
    { id: uuidv4(), category: 'Coffee/Snacks', group: 'Food & Dining', budgetAmount: 50, actualAmount: 40, notes: '' },
    
    // Health & Insurance
    { id: uuidv4(), category: 'Health Insurance', group: 'Health & Insurance', budgetAmount: 300, actualAmount: 300, notes: '' },
    { id: uuidv4(), category: 'Medical/Doctor', group: 'Health & Insurance', budgetAmount: 100, actualAmount: 0, notes: '' },
    { id: uuidv4(), category: 'Pharmacy/Medications', group: 'Health & Insurance', budgetAmount: 50, actualAmount: 30, notes: '' },
    { id: uuidv4(), category: 'Dental', group: 'Health & Insurance', budgetAmount: 75, actualAmount: 0, notes: '' },
    { id: uuidv4(), category: 'Vision/Glasses', group: 'Health & Insurance', budgetAmount: 50, actualAmount: 0, notes: '' },
    
    // Education
    { id: uuidv4(), category: 'Tuition', group: 'Education', budgetAmount: 500, actualAmount: 500, notes: '' },
    { id: uuidv4(), category: 'Books/Supplies', group: 'Education', budgetAmount: 100, actualAmount: 80, notes: '' },
    { id: uuidv4(), category: 'Student Loans', group: 'Education', budgetAmount: 200, actualAmount: 200, notes: '' },
    
    // Entertainment
    { id: uuidv4(), category: 'Movies/Streaming', group: 'Entertainment', budgetAmount: 30, actualAmount: 30, notes: '' },
    { id: uuidv4(), category: 'Hobbies', group: 'Entertainment', budgetAmount: 100, actualAmount: 75, notes: '' },
    { id: uuidv4(), category: 'Vacation/Travel', group: 'Entertainment', budgetAmount: 200, actualAmount: 100, notes: '' },
    { id: uuidv4(), category: 'Gym/Fitness', group: 'Entertainment', budgetAmount: 50, actualAmount: 50, notes: '' },
    
    // Personal & Shopping
    { id: uuidv4(), category: 'Clothing', group: 'Personal & Shopping', budgetAmount: 100, actualAmount: 75, notes: '' },
    { id: uuidv4(), category: 'Personal Care', group: 'Personal & Shopping', budgetAmount: 50, actualAmount: 40, notes: '' },
    { id: uuidv4(), category: 'Haircut', group: 'Personal & Shopping', budgetAmount: 40, actualAmount: 0, notes: '' },
    { id: uuidv4(), category: 'Gifts', group: 'Personal & Shopping', budgetAmount: 100, actualAmount: 50, notes: '' },
    
    // Savings & Giving
    { id: uuidv4(), category: 'Emergency Fund', group: 'Savings & Giving', budgetAmount: 300, actualAmount: 300, notes: '' },
    { id: uuidv4(), category: 'Savings', group: 'Savings & Giving', budgetAmount: 200, actualAmount: 200, notes: '' },
    { id: uuidv4(), category: 'Charity/Giving', group: 'Savings & Giving', budgetAmount: 100, actualAmount: 50, notes: '' }
  ];

  // Calculate totals
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);

  const budget = {
    id: uuidv4(),
    month: currentMonth,
    year: parseInt(currentMonth.split('-')[0]),
    items: budgetItems,
    totalBudget,
    totalSpent,
    notes: 'Sample budget for testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return budget;
};

// Main function
const main = () => {
  try {
    ensureDataDir();

    // Read existing budgets
    let budgets = [];
    if (fs.existsSync(BUDGETS_PATH)) {
      const data = fs.readFileSync(BUDGETS_PATH, 'utf8');
      budgets = JSON.parse(data);
    }

    // Check if budget for current month already exists
    const currentMonth = getCurrentMonth();
    const existingBudget = budgets.find(b => b.month === currentMonth);

    if (existingBudget) {
      console.log(`✅ Budget for ${currentMonth} already exists!`);
      console.log(`   Total Budget: $${existingBudget.totalBudget}`);
      console.log(`   Total Spent: $${existingBudget.totalSpent}`);
      console.log(`   Items: ${existingBudget.items.length}`);
      return;
    }

    // Create and add dummy budget
    const dummyBudget = createDummyBudget();
    budgets.push(dummyBudget);

    // Write to file
    fs.writeFileSync(BUDGETS_PATH, JSON.stringify(budgets, null, 2));

    console.log('✅ Dummy budget data added successfully!');
    console.log(`   Month: ${dummyBudget.month}`);
    console.log(`   Total Budget: $${dummyBudget.totalBudget}`);
    console.log(`   Total Spent: $${dummyBudget.totalSpent}`);
    console.log(`   Categories: ${dummyBudget.items.length}`);
    console.log(`   File: ${BUDGETS_PATH}`);
  } catch (error) {
    console.error('❌ Error adding dummy budget:', error);
    process.exit(1);
  }
};

main();

