#!/usr/bin/env node

/**
 * Utility script to update budget structure with new categories
 * Run: node scripts/updateBudgetStructure.js
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

// New budget structure
const getBudgetStructure = () => {
  return {
    "Income": [
      "Paycheck",
      "Business Income",
      "Rental Income",
      "Interest & Dividends",
      "Tax Refunds & Cashbacks",
      "Other Income"
    ],
    "Savings_Investing_Giving": [
      "Emergency Fund",
      "Retirement / 401(k)",
      "Investing / Brokerage",
      "Next Trip / Vacation Fund",
      "Upskilling / Education",
      "Major Purchase (Car / Home)",
      "Debt Repayment",
      "Charity / Donations",
      "Environmental Causes"
    ],
    "Housing": [
      "Mortgage / Rent",
      "Property Tax",
      "Home Insurance",
      "Electricity",
      "Natural Gas",
      "Water",
      "Sewer",
      "Trash / Recycling",
      "Internet / Cable",
      "Home Warranty",
      "Pest Control",
      "Lawn Care & Mowing"
    ],
    "Utilities_Bills": [
      "Phone Bill",
      "Streaming Services",
      "Cloud Storage / Software Licenses",
      "Memberships",
      "Bank / Credit Card Fees",
      "Other Recurring Services"
    ],
    "Transportation": [
      "Car Payment / Lease",
      "Car Insurance",
      "Gas / Fuel",
      "Car Maintenance",
      "Tolls",
      "Parking Fees",
      "Registration & Inspection",
      "Rideshare / Taxi / Uber / Lyft",
      "Public Transit"
    ],
    "Food_Dining_Lifestyle": [
      "Groceries",
      "Wholesale Groceries (Costco / Sam's)",
      "Dining Out / Restaurants",
      "Coffee / Snacks",
      "Movies / Theaters",
      "Events / Travel / Vacations",
      "Hobbies"
    ],
    "Health_Insurance": [
      "Health Insurance",
      "Medical / Doctor Visits",
      "Dental & Vision",
      "Pharmacy / Medications",
      "Fitness / Gym",
      "Life Insurance"
    ],
    "Personal_Shopping": [
      "Clothing & Accessories",
      "Personal Care (Salon, Grooming)",
      "Gifts",
      "Electronics / Gadgets",
      "Education (Books, Courses)",
      "Pets (Food, Vet, etc.)",
      "Miscellaneous"
    ]
  };
};

// Dummy amounts for each category
const getDummyAmounts = () => {
  return {
    "Paycheck": { budget: 5000, actual: 5000 },
    "Business Income": { budget: 1000, actual: 800 },
    "Rental Income": { budget: 500, actual: 500 },
    "Interest & Dividends": { budget: 100, actual: 75 },
    "Tax Refunds & Cashbacks": { budget: 200, actual: 150 },
    "Other Income": { budget: 0, actual: 0 },
    "Emergency Fund": { budget: 500, actual: 500 },
    "Retirement / 401(k)": { budget: 800, actual: 800 },
    "Investing / Brokerage": { budget: 300, actual: 250 },
    "Next Trip / Vacation Fund": { budget: 200, actual: 150 },
    "Upskilling / Education": { budget: 150, actual: 100 },
    "Major Purchase (Car / Home)": { budget: 400, actual: 300 },
    "Debt Repayment": { budget: 300, actual: 300 },
    "Charity / Donations": { budget: 100, actual: 50 },
    "Environmental Causes": { budget: 50, actual: 25 },
    "Mortgage / Rent": { budget: 1500, actual: 1500 },
    "Property Tax": { budget: 150, actual: 150 },
    "Home Insurance": { budget: 120, actual: 120 },
    "Electricity": { budget: 150, actual: 120 },
    "Natural Gas": { budget: 80, actual: 75 },
    "Water": { budget: 50, actual: 45 },
    "Sewer": { budget: 30, actual: 30 },
    "Trash / Recycling": { budget: 30, actual: 30 },
    "Internet / Cable": { budget: 100, actual: 100 },
    "Home Warranty": { budget: 50, actual: 50 },
    "Pest Control": { budget: 40, actual: 0 },
    "Lawn Care & Mowing": { budget: 100, actual: 50 },
    "Phone Bill": { budget: 80, actual: 80 },
    "Streaming Services": { budget: 50, actual: 45 },
    "Cloud Storage / Software Licenses": { budget: 30, actual: 30 },
    "Memberships": { budget: 40, actual: 40 },
    "Bank / Credit Card Fees": { budget: 20, actual: 10 },
    "Other Recurring Services": { budget: 30, actual: 20 },
    "Car Payment / Lease": { budget: 350, actual: 350 },
    "Car Insurance": { budget: 120, actual: 120 },
    "Gas / Fuel": { budget: 200, actual: 180 },
    "Car Maintenance": { budget: 100, actual: 50 },
    "Tolls": { budget: 30, actual: 25 },
    "Parking Fees": { budget: 60, actual: 60 },
    "Registration & Inspection": { budget: 50, actual: 0 },
    "Rideshare / Taxi / Uber / Lyft": { budget: 50, actual: 40 },
    "Public Transit": { budget: 50, actual: 40 },
    "Groceries": { budget: 400, actual: 350 },
    "Wholesale Groceries (Costco / Sam's)": { budget: 100, actual: 80 },
    "Dining Out / Restaurants": { budget: 150, actual: 120 },
    "Coffee / Snacks": { budget: 50, actual: 40 },
    "Movies / Theaters": { budget: 30, actual: 30 },
    "Events / Travel / Vacations": { budget: 200, actual: 100 },
    "Hobbies": { budget: 100, actual: 75 },
    "Health Insurance": { budget: 300, actual: 300 },
    "Medical / Doctor Visits": { budget: 100, actual: 50 },
    "Dental & Vision": { budget: 75, actual: 0 },
    "Pharmacy / Medications": { budget: 50, actual: 30 },
    "Fitness / Gym": { budget: 50, actual: 50 },
    "Life Insurance": { budget: 100, actual: 100 },
    "Clothing & Accessories": { budget: 100, actual: 75 },
    "Personal Care (Salon, Grooming)": { budget: 50, actual: 40 },
    "Gifts": { budget: 100, actual: 50 },
    "Electronics / Gadgets": { budget: 80, actual: 0 },
    "Education (Books, Courses)": { budget: 100, actual: 80 },
    "Pets (Food, Vet, etc.)": { budget: 100, actual: 80 },
    "Miscellaneous": { budget: 50, actual: 30 }
  };
};

// Main function
const main = () => {
  try {
    const budgetStructure = getBudgetStructure();
    const dummyAmounts = getDummyAmounts();
    const currentMonth = getCurrentMonth();

    // Create new budget items
    const items = [];
    let totalBudget = 0;
    let totalSpent = 0;

    Object.keys(budgetStructure).forEach(group => {
      budgetStructure[group].forEach(category => {
        const amounts = dummyAmounts[category] || { budget: 0, actual: 0 };
        items.push({
          id: uuidv4(),
          category: category,
          group: group,
          budgetAmount: amounts.budget,
          actualAmount: amounts.actual,
          notes: ""
        });
        totalBudget += amounts.budget;
        totalSpent += amounts.actual;
      });
    });

    // Create new budget
    const newBudget = {
      id: uuidv4(),
      month: currentMonth,
      year: parseInt(currentMonth.split('-')[0]),
      items: items,
      totalBudget: totalBudget,
      totalSpent: totalSpent,
      notes: "Updated budget structure with comprehensive categories",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Read existing budgets
    let budgets = [];
    if (fs.existsSync(BUDGETS_PATH)) {
      const data = fs.readFileSync(BUDGETS_PATH, 'utf8');
      budgets = JSON.parse(data);
    }

    // Replace budget for current month
    const existingIndex = budgets.findIndex(b => b.month === currentMonth);
    if (existingIndex >= 0) {
      budgets[existingIndex] = newBudget;
    } else {
      budgets.push(newBudget);
    }

    // Write to file
    fs.writeFileSync(BUDGETS_PATH, JSON.stringify(budgets, null, 2));

    console.log('✅ Budget structure updated successfully!');
    console.log(`   Month: ${newBudget.month}`);
    console.log(`   Total Budget: $${newBudget.totalBudget}`);
    console.log(`   Total Spent: $${newBudget.totalSpent}`);
    console.log(`   Remaining: $${newBudget.totalBudget - newBudget.totalSpent}`);
    console.log(`   Total Categories: ${newBudget.items.length}`);
    console.log('\n   Groups:');
    
    Object.keys(budgetStructure).forEach(group => {
      const count = budgetStructure[group].length;
      console.log(`     - ${group}: ${count} items`);
    });
  } catch (error) {
    console.error('❌ Error updating budget structure:', error);
    process.exit(1);
  }
};

main();

