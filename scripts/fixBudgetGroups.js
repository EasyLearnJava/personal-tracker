#!/usr/bin/env node

/**
 * Utility script to fix budget category groups
 * Run: node scripts/fixBudgetGroups.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUDGETS_PATH = path.join(__dirname, '../data/budgets.json');

// Get current month in YYYY-MM format
const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Define correct category groupings
const getCategoryGroups = () => {
  return {
    'Mortgage/Rent': 'Housing',
    'Electricity': 'Housing',
    'Water': 'Housing',
    'Natural Gas': 'Housing',
    'Trash': 'Housing',
    'Home Maintenance': 'Housing',
    'Home Insurance': 'Housing',
    'Gas': 'Transportation',
    'Car Maintenance': 'Transportation',
    'Car Insurance': 'Transportation',
    'Car Loan Payment': 'Transportation',
    'Public Transportation': 'Transportation',
    'Parking': 'Transportation',
    'Phone Bill': 'Utilities & Services',
    'Internet': 'Utilities & Services',
    'Subscriptions': 'Utilities & Services',
    'Cable/TV': 'Utilities & Services',
    'Groceries': 'Food & Dining',
    'Restaurants/Dining Out': 'Food & Dining',
    'Coffee/Snacks': 'Food & Dining',
    'Health Insurance': 'Health & Insurance',
    'Medical/Doctor': 'Health & Insurance',
    'Pharmacy/Medications': 'Health & Insurance',
    'Dental': 'Health & Insurance',
    'Vision/Glasses': 'Health & Insurance',
    'Tuition': 'Education',
    'Books/Supplies': 'Education',
    'Student Loans': 'Education',
    'Movies/Streaming': 'Entertainment',
    'Hobbies': 'Entertainment',
    'Vacation/Travel': 'Entertainment',
    'Gym/Fitness': 'Entertainment',
    'Clothing': 'Personal & Shopping',
    'Personal Care': 'Personal & Shopping',
    'Haircut': 'Personal & Shopping',
    'Gifts': 'Personal & Shopping',
    'Emergency Fund': 'Savings & Giving',
    'Savings': 'Savings & Giving',
    'Charity/Giving': 'Savings & Giving'
  };
};

// Main function
const main = () => {
  try {
    // Read existing budgets
    const data = fs.readFileSync(BUDGETS_PATH, 'utf8');
    const budgets = JSON.parse(data);

    const currentMonth = getCurrentMonth();
    const budget = budgets.find(b => b.month === currentMonth);

    if (!budget) {
      console.log('❌ No budget found for current month');
      return;
    }

    const categoryGroups = getCategoryGroups();

    // Fix groups for each item
    budget.items.forEach(item => {
      if (categoryGroups[item.category]) {
        item.group = categoryGroups[item.category];
      }
      // Add ID if missing
      if (!item.id) {
        item.id = uuidv4();
      }
    });

    // Write back to file
    fs.writeFileSync(BUDGETS_PATH, JSON.stringify(budgets, null, 2));

    console.log('✅ Budget groups fixed successfully!');
    console.log(`   Month: ${budget.month}`);
    
    // Show group summary
    const groups = {};
    budget.items.forEach(item => {
      if (!groups[item.group]) {
        groups[item.group] = 0;
      }
      groups[item.group]++;
    });
    
    console.log('   Groups:');
    Object.keys(groups).sort().forEach(group => {
      console.log(`     - ${group}: ${groups[group]} items`);
    });
  } catch (error) {
    console.error('❌ Error fixing budget groups:', error);
    process.exit(1);
  }
};

main();

