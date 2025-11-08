#!/usr/bin/env node

/**
 * Utility script to update budget data with dummy values
 * Run: node scripts/updateBudgetData.js
 */

const fs = require('fs');
const path = require('path');

const BUDGETS_PATH = path.join(__dirname, '../data/budgets.json');

// Get current month in YYYY-MM format
const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Create dummy data for each category
const getDummyData = () => {
  return {
    'Mortgage/Rent': { budgetAmount: 1500, actualAmount: 1500 },
    'Electricity': { budgetAmount: 150, actualAmount: 120 },
    'Water': { budgetAmount: 50, actualAmount: 45 },
    'Natural Gas': { budgetAmount: 80, actualAmount: 75 },
    'Trash': { budgetAmount: 30, actualAmount: 30 },
    'Home Maintenance': { budgetAmount: 100, actualAmount: 50 },
    'Home Insurance': { budgetAmount: 120, actualAmount: 120 },
    'Gas': { budgetAmount: 200, actualAmount: 180 },
    'Car Maintenance': { budgetAmount: 100, actualAmount: 50 },
    'Car Insurance': { budgetAmount: 120, actualAmount: 120 },
    'Car Loan Payment': { budgetAmount: 350, actualAmount: 350 },
    'Public Transportation': { budgetAmount: 50, actualAmount: 40 },
    'Parking': { budgetAmount: 60, actualAmount: 60 },
    'Phone Bill': { budgetAmount: 80, actualAmount: 80 },
    'Internet': { budgetAmount: 60, actualAmount: 60 },
    'Subscriptions': { budgetAmount: 50, actualAmount: 45 },
    'Cable/TV': { budgetAmount: 100, actualAmount: 100 },
    'Groceries': { budgetAmount: 400, actualAmount: 350 },
    'Restaurants/Dining Out': { budgetAmount: 150, actualAmount: 120 },
    'Coffee/Snacks': { budgetAmount: 50, actualAmount: 40 },
    'Health Insurance': { budgetAmount: 300, actualAmount: 300 },
    'Medical/Doctor': { budgetAmount: 100, actualAmount: 0 },
    'Pharmacy/Medications': { budgetAmount: 50, actualAmount: 30 },
    'Dental': { budgetAmount: 75, actualAmount: 0 },
    'Vision/Glasses': { budgetAmount: 50, actualAmount: 0 },
    'Tuition': { budgetAmount: 500, actualAmount: 500 },
    'Books/Supplies': { budgetAmount: 100, actualAmount: 80 },
    'Student Loans': { budgetAmount: 200, actualAmount: 200 },
    'Movies/Streaming': { budgetAmount: 30, actualAmount: 30 },
    'Hobbies': { budgetAmount: 100, actualAmount: 75 },
    'Vacation/Travel': { budgetAmount: 200, actualAmount: 100 },
    'Gym/Fitness': { budgetAmount: 50, actualAmount: 50 },
    'Clothing': { budgetAmount: 100, actualAmount: 75 },
    'Personal Care': { budgetAmount: 50, actualAmount: 40 },
    'Haircut': { budgetAmount: 40, actualAmount: 0 },
    'Gifts': { budgetAmount: 100, actualAmount: 50 },
    'Emergency Fund': { budgetAmount: 300, actualAmount: 300 },
    'Savings': { budgetAmount: 200, actualAmount: 200 },
    'Charity/Giving': { budgetAmount: 100, actualAmount: 50 }
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

    const dummyData = getDummyData();

    // Update items with dummy data
    budget.items.forEach(item => {
      if (dummyData[item.category]) {
        item.budgetAmount = dummyData[item.category].budgetAmount;
        item.actualAmount = dummyData[item.category].actualAmount;
      }
    });

    // Recalculate totals
    budget.totalBudget = budget.items.reduce((sum, item) => sum + item.budgetAmount, 0);
    budget.totalSpent = budget.items.reduce((sum, item) => sum + item.actualAmount, 0);
    budget.updatedAt = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(BUDGETS_PATH, JSON.stringify(budgets, null, 2));

    console.log('✅ Budget data updated successfully!');
    console.log(`   Month: ${budget.month}`);
    console.log(`   Total Budget: $${budget.totalBudget}`);
    console.log(`   Total Spent: $${budget.totalSpent}`);
    console.log(`   Remaining: $${budget.totalBudget - budget.totalSpent}`);
    console.log(`   Categories: ${budget.items.length}`);
  } catch (error) {
    console.error('❌ Error updating budget data:', error);
    process.exit(1);
  }
};

main();

