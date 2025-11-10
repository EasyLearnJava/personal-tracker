const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/expenses.json');
const CATEGORIES_PATH = path.join(__dirname, '../../data/categories.json');
const ACTIVITY_LOG_PATH = path.join(__dirname, '../../data/activityLog.json');
const BUDGETS_PATH = path.join(__dirname, '../../data/budgets.json');

// Check if we're running on Vercel (read-only file system)
const isVercel = process.env.VERCEL === 'true' || process.env.VERCEL_ENV !== undefined;
let dataDirectoryAvailable = false;

// Ensure data directory exists
const ensureDataDir = () => {
  // Skip on Vercel - use Supabase only
  if (isVercel) {
    console.warn('Running on Vercel (read-only file system). Using Supabase only.');
    dataDirectoryAvailable = false;
    return;
  }

  try {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dataDirectoryAvailable = true;
  } catch (error) {
    console.warn('Data directory not available (read-only file system). Using Supabase only.');
    dataDirectoryAvailable = false;
  }
};

// Initialize database with default data
const initializeDatabase = () => {
  ensureDataDir();

  // Skip file operations if data directory is not available (Vercel)
  if (!dataDirectoryAvailable) {
    return;
  }

  try {
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

    if (!fs.existsSync(ACTIVITY_LOG_PATH)) {
      fs.writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(BUDGETS_PATH)) {
      fs.writeFileSync(BUDGETS_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.warn('Error initializing database files:', error.message);
  }
};

// Read expenses
const readExpenses = () => {
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return [];
  }

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
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return true;
  }

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
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return [];
  }

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
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return true;
  }

  try {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    return false;
  }
};



// Read activity log
const readActivityLog = () => {
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return [];
  }

  try {
    const data = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading activity log:', error);
    return [];
  }
};

// Write activity log
const writeActivityLog = (log) => {
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return true;
  }

  try {
    fs.writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify(log, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing activity log:', error);
    return false;
  }
};

// Read budgets
const readBudgets = () => {
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return [];
  }

  try {
    const data = fs.readFileSync(BUDGETS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading budgets:', error);
    return [];
  }
};

// Write budgets
const writeBudgets = (budgets) => {
  // Skip on Vercel - use Supabase only
  if (!dataDirectoryAvailable) {
    return true;
  }

  try {
    fs.writeFileSync(BUDGETS_PATH, JSON.stringify(budgets, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing budgets:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
  readExpenses,
  writeExpenses,
  readCategories,
  writeCategories,
  readActivityLog,
  writeActivityLog,
  readBudgets,
  writeBudgets
};

