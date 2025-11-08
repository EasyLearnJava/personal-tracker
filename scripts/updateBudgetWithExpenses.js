#!/usr/bin/env node

/**
 * Utility script to update budget structure with Business and Rental Expenses
 * Run: node scripts/updateBudgetWithExpenses.js
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

// New budget structure with Business and Rental Expenses
const getBudgetStructure = () => {
  return {
    "Income": [
      "Paycheck",
      "Business Income",
      "Rental Income",
      "Stocks",
      "Interest & Dividends",
      "Tax Refunds & Cashbacks",
      "Other Income"
    ],
    "Business_Expenses": [
      "Flower Purchases",
      "Uber Delivery",
      "Others"
    ],
    "Rental_Expenses": [
      "HOA",
      "Home Insurance",
      "Home Warranty",
      "Home Repairs"
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
      "Wholesale Groceries (Costco / Sam\'s)",
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
    "Paycheck": { budget: 5000, actual: 0 },
    "Business Income": { budget: 1000, actual: 0 },
    "Rental Income": { budget: 500, actual: 0 },
    "Stocks": { budget: 800, actual: 0 },
    "Interest & Dividends": { budget: 100, actual: 0 },
    "Tax Refunds & Cashbacks": { budget: 200, actual: 0 },
    "Other Income": { budget: 0, actual: 0 },
    "Flower Purchases": { budget: 200, actual: 0 },
    "Uber Delivery": { budget: 150, actual: 0 },
    "Others": { budget: 100, actual: 0 },
    "HOA": { budget: 300, actual: 0 },
    "Home Insurance": { budget: 120, actual: 0 },
    "Home Warranty": { budget: 50, actual: 0 },
    "Home Repairs": { budget: 200, actual: 0 },
    "Emergency Fund": { budget: 500, actual: 0 },
    "Retirement / 401(k)": { budget: 800, actual: 0 },
    "Investing / Brokerage": { budget: 300, actual: 0 },
    "Next Trip / Vacation Fund": { budget: 200, actual: 0 },
    "Upskilling / Education": { budget: 150, actual: 0 },
    "Major Purchase (Car / Home)": { budget: 400, actual: 0 },
    "Debt Repayment": { budget: 300, actual: 0 },
    "Charity / Donations": { budget: 100, actual: 0 },
    "Environmental Causes": { budget: 50, actual: 0 },
    "Mortgage / Rent": { budget: 1500, actual: 0 },
    "Property Tax": { budget: 150, actual: 0 },
    "Home Insurance": { budget: 120, actual: 0 },
    "Electricity": { budget: 150, actual: 0 },
    "Natural Gas": { budget: 80, actual: 0 },
    "Water": { budget: 50, actual: 0 },
    "Sewer": { budget: 30, actual: 0 },
    "Trash / Recycling": { budget: 30, actual: 0 },
    "Internet / Cable": { budget: 100, actual: 0 },
    "Home Warranty": { budget: 50, actual: 0 },
    "Pest Control": { budget: 40, actual: 0 },
    "Lawn Care & Mowing": { budget: 100, actual: 0 },
    "Phone Bill": { budget: 80, actual: 0 },
    "Streaming Services": { budget: 50, actual: 0 },
    "Cloud Storage / Software Licenses": { budget: 30, actual: 0 },
    "Memberships": { budget: 40, actual: 0 },
    "Bank / Credit Card Fees": { budget: 20, actual: 0 },
    "Other Recurring Services": { budget: 30, actual: 0 },
    "Car Payment / Lease": { budget: 350, actual: 0 },
    "Car Insurance": { budget: 120, actual: 0 },
    "Gas / Fuel": { budget: 200, actual: 0 },
    "Car Maintenance": { budget: 100, actual: 0 },
    "Tolls": { budget: 30, actual: 0 },
    "Parking Fees": { budget: 60, actual: 0 },
    "Registration & Inspection": { budget: 50, actual: 0 },
    "Rideshare / Taxi / Uber / Lyft": { budget: 50, actual: 0 },
    "Public Transit": { budget: 50, actual: 0 },
    "Groceries": { budget: 400, actual: 0 },
    "Wholesale Groceries (Costco / Sam\'s)": { budget: 100, actual: 0 },
    "Dining Out / Restaurants": { budget: 150, actual: 0 },
    "Coffee / Snacks": { budget: 50, actual: 0 },
    "Movies / Theaters": { budget: 30, actual: 0 },
    "Events / Travel / Vacations": { budget: 200, actual: 0 },
    "Hobbies": { budget: 100, actual: 0 },
    "Health Insurance": { budget: 300, actual: 0 },
    "Medical / Doctor Visits": { budget: 100, actual: 0 },
    "Dental & Vision": { budget: 75, actual: 0 },
    "Pharmacy / Medications": { budget: 50, actual: 0 },
    "Fitness / Gym": { budget: 50, actual: 0 },
    "Life Insurance": { budget: 100, actual: 0 },
    "Clothing & Accessories": { budget: 100, actual: 0 },
    "Personal Care (Salon, Grooming)": { budget: 50, actual: 0 },
    "Gifts": { budget: 100, actual: 0 },
    "Electronics / Gadgets": { budget: 80, actual: 0 },
    "Education (Books, Courses)": { budget: 100, actual: 0 },
    "Pets (Food, Vet, etc.)": { budget: 100, actual: 0 },
    "Miscellaneous": { budget: 50, actual: 0 }
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
          incomeSource: null, // Track which income source this expense came from
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
      notes: "Updated budget with Business and Rental Expenses, all spent amounts reset to 0",
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

