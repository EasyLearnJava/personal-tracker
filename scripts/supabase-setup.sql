-- ==================== USERS TABLE ====================
-- Note: Users are managed by Supabase Auth
-- This table stores additional user profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ==================== CATEGORIES TABLE ====================
-- Stores expense categories (Food & Dining, Transportation, etc.)
-- Note: Categories are also stored in data/categories.json for JSON file storage
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== EXPENSES TABLE ====================
-- Stores all expense transactions
-- Note: Expenses are also stored in data/expenses.json for JSON file storage
-- payment_method field stores the income source (Paycheck, Business Income, Rental Income, Stocks)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100),
  expense_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== TASKS TABLE ====================
-- Stores user tasks with status, priority, and deadline tracking
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started',
  priority VARCHAR(20) DEFAULT 'medium',
  deadline DATE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== INDEXES ====================
-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- ==================== NOTES ====================
-- Data Storage Strategy:
-- 1. Supabase PostgreSQL: Stores users, categories, expenses, and tasks
-- 2. JSON Files (data/): Stores budgets, activity logs, and categories (for offline support)
--
-- Income Sources (stored in Monthly Budget):
-- - Paycheck
-- - Business Income
-- - Rental Income
-- - Stocks
--
-- Expense Categories (69 total):
-- Income: Paycheck, Business Income, Rental Income, Stocks
-- Business Expenses: Flower Purchases, Uber Delivery, Others
-- Rental Expenses: HOA, Home Insurance, Home Warranty, Home Repairs
-- Savings/Investing/Giving: Savings, Investments, Charitable Giving
-- Housing: Rent/Mortgage, Property Tax, Home Maintenance
-- Transportation: Car Payment, Gas, Car Insurance, Maintenance
-- Food & Dining: Groceries, Restaurants, Coffee
-- Personal Care: Haircut, Gym, Skincare
-- Entertainment & Lifestyle: Movies, Games, Hobbies
-- Healthcare: Doctor, Dentist, Pharmacy
-- Utilities & Bills: Electricity, Water, Internet, Phone
-- Family & Pets: Childcare, Pet Care, Family Support
-- Miscellaneous: Other expenses

