const fs = require('fs');
const path = require('path');

const BUDGETS_PATH = path.join(__dirname, '../data/budgets.json');
const CATEGORIES_PATH = path.join(__dirname, '../data/categories.json');

// Icon and color mapping for categories
const getCategoryMetadata = () => {
  return {
    // Income
    "Paycheck": { icon: "💰", color: "#4CAF50" },
    "Business Income": { icon: "💼", color: "#2196F3" },
    "Rental Income": { icon: "🏠", color: "#FF9800" },
    "Stocks": { icon: "📈", color: "#9C27B0" },
    "Interest & Dividends": { icon: "💵", color: "#00BCD4" },
    "Tax Refunds & Cashbacks": { icon: "🎁", color: "#F44336" },
    "Other Income": { icon: "💸", color: "#607D8B" },
    
    // Business Expenses
    "Flower Purchases": { icon: "🌸", color: "#E91E63" },
    "Uber Delivery": { icon: "🚗", color: "#FF5722" },
    "Others": { icon: "📌", color: "#9E9E9E" },
    
    // Rental Expenses
    "HOA": { icon: "🏘️", color: "#8BC34A" },
    "Home Insurance": { icon: "🛡️", color: "#3F51B5" },
    "Home Warranty": { icon: "🔧", color: "#009688" },
    "Home Repairs": { icon: "🔨", color: "#FF6F00" },
    
    // Savings & Investing
    "Emergency Fund": { icon: "🚨", color: "#D32F2F" },
    "Retirement / 401(k)": { icon: "🏦", color: "#1976D2" },
    "Investing / Brokerage": { icon: "📊", color: "#388E3C" },
    "Next Trip / Vacation Fund": { icon: "✈️", color: "#F57C00" },
    "Upskilling / Education": { icon: "📚", color: "#7B1FA2" },
    "Major Purchase (Car / Home)": { icon: "🏡", color: "#C2185B" },
    "Debt Repayment": { icon: "💳", color: "#E64A19" },
    "Charity / Donations": { icon: "❤️", color: "#C62828" },
    "Environmental Causes": { icon: "🌍", color: "#00796B" },
    
    // Housing
    "Mortgage / Rent": { icon: "🏠", color: "#FF9800" },
    "Property Tax": { icon: "📋", color: "#795548" },
    "Home Insurance": { icon: "🛡️", color: "#3F51B5" },
    "Electricity": { icon: "💡", color: "#FBC02D" },
    "Natural Gas": { icon: "🔥", color: "#FF6F00" },
    "Water": { icon: "💧", color: "#00BCD4" },
    "Sewer": { icon: "🚰", color: "#0097A7" },
    "Trash / Recycling": { icon: "🗑️", color: "#616161" },
    "Internet": { icon: "📡", color: "#1976D2" },
    "Phone Bill": { icon: "📱", color: "#4CAF50" },
    "Cable / Streaming": { icon: "📺", color: "#9C27B0" },
    "Home Maintenance": { icon: "🔧", color: "#FF6F00" },
    
    // Utilities & Bills
    "Electricity": { icon: "💡", color: "#FBC02D" },
    "Natural Gas": { icon: "🔥", color: "#FF6F00" },
    "Water": { icon: "💧", color: "#00BCD4" },
    "Internet": { icon: "📡", color: "#1976D2" },
    "Phone Bill": { icon: "📱", color: "#4CAF50" },
    "Subscriptions": { icon: "📱", color: "#9C27B0" },
    
    // Transportation
    "Gas / Fuel": { icon: "⛽", color: "#FF6F00" },
    "Car Maintenance": { icon: "🔧", color: "#FF6F00" },
    "Car Insurance": { icon: "🛡️", color: "#3F51B5" },
    "Car Loan Payment": { icon: "💳", color: "#E64A19" },
    "Registration & Inspection": { icon: "📋", color: "#795548" },
    "Rideshare / Taxi / Uber / Lyft": { icon: "🚕", color: "#FF5722" },
    "Public Transit": { icon: "🚌", color: "#00BCD4" },
    "Parking": { icon: "🅿️", color: "#616161" },
    "Tolls": { icon: "🛣️", color: "#455A64" },
    
    // Food & Dining
    "Groceries": { icon: "🛒", color: "#4CAF50" },
    "Wholesale Groceries (Costco / Sam's)": { icon: "🏪", color: "#8BC34A" },
    "Dining Out / Restaurants": { icon: "🍽️", color: "#FF6F00" },
    "Coffee / Snacks": { icon: "☕", color: "#A1887F" },
    "Movies / Theaters": { icon: "🎬", color: "#9C27B0" },
    "Events / Travel / Vacations": { icon: "🎉", color: "#F44336" },
    "Hobbies": { icon: "🎮", color: "#2196F3" },
    
    // Health & Insurance
    "Health Insurance": { icon: "🏥", color: "#F44336" },
    "Medical / Doctor Visits": { icon: "⚕️", color: "#E91E63" },
    "Dental & Vision": { icon: "👁️", color: "#00BCD4" },
    "Pharmacy / Medications": { icon: "💊", color: "#4CAF50" },
    "Fitness / Gym": { icon: "💪", color: "#FF9800" },
    "Life Insurance": { icon: "🛡️", color: "#3F51B5" },
    
    // Personal & Shopping
    "Clothing & Accessories": { icon: "👕", color: "#E91E63" },
    "Personal Care (Salon, Grooming)": { icon: "💇", color: "#FF69B4" },
    "Gifts": { icon: "🎁", color: "#F44336" },
    "Electronics / Gadgets": { icon: "📱", color: "#2196F3" },
    "Education (Books, Courses)": { icon: "📚", color: "#7B1FA2" },
    "Pets (Food, Vet, etc.)": { icon: "🐾", color: "#8D6E63" },
    "Miscellaneous": { icon: "📌", color: "#9E9E9E" }
  };
};

const main = () => {
  try {
    // Read budgets
    const budgetsData = fs.readFileSync(BUDGETS_PATH, 'utf8');
    const budgets = JSON.parse(budgetsData);

    // Get all unique categories from budgets
    const categorySet = new Set();
    budgets.forEach(budget => {
      budget.items.forEach(item => {
        categorySet.add(item.category);
      });
    });

    const metadata = getCategoryMetadata();
    const categories = Array.from(categorySet).map((name, index) => ({
      id: index + 1,
      name: name,
      icon: metadata[name]?.icon || "📌",
      color: metadata[name]?.color || "#E0BBE4"
    }));

    // Write to categories file
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));

    console.log('✅ Categories synced successfully!');
    console.log(`   Total categories: ${categories.length}`);
    console.log('\n   Categories:');
    categories.forEach(cat => {
      console.log(`     ${cat.icon} ${cat.name}`);
    });
  } catch (error) {
    console.error('❌ Error syncing categories:', error);
    process.exit(1);
  }
};

main();

