-- ==================== SAFE MISSING SCRIPTS ====================
-- This file contains ONLY the missing tables that don't exist yet
-- Run this if you get "already exists" errors
-- Date: 2025-11-05

-- ==================== BANK ACCOUNTS TABLE ====================
-- Only create if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50),
  bank_name VARCHAR(100),
  current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  account_number VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Only enable RLS if not already enabled
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can view their own bank accounts') THEN
    CREATE POLICY "Users can view their own bank accounts"
      ON bank_accounts FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can insert their own bank accounts') THEN
    CREATE POLICY "Users can insert their own bank accounts"
      ON bank_accounts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can update their own bank accounts') THEN
    CREATE POLICY "Users can update their own bank accounts"
      ON bank_accounts FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Users can delete their own bank accounts') THEN
    CREATE POLICY "Users can delete their own bank accounts"
      ON bank_accounts FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- ==================== PAYMENT HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id),
  payment_method VARCHAR(50),
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_history' AND policyname = 'Users can view their own payment history') THEN
    CREATE POLICY "Users can view their own payment history"
      ON payment_history FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_history' AND policyname = 'Users can insert their own payment history') THEN
    CREATE POLICY "Users can insert their own payment history"
      ON payment_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_history' AND policyname = 'Users can update their own payment history') THEN
    CREATE POLICY "Users can update their own payment history"
      ON payment_history FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_history' AND policyname = 'Users can delete their own payment history') THEN
    CREATE POLICY "Users can delete their own payment history"
      ON payment_history FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_debt_id ON payment_history(debt_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(payment_date);

-- ==================== ACTIVITY LOG TABLE ====================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_log' AND policyname = 'Users can view their own activity log') THEN
    CREATE POLICY "Users can view their own activity log"
      ON activity_log FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_log' AND policyname = 'Users can insert their own activity log') THEN
    CREATE POLICY "Users can insert their own activity log"
      ON activity_log FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- ==================== RECURRING EXPENSES TABLE ====================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  card_id UUID REFERENCES cards(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_expenses' AND policyname = 'Users can view their own recurring expenses') THEN
    CREATE POLICY "Users can view their own recurring expenses"
      ON recurring_expenses FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_expenses' AND policyname = 'Users can insert their own recurring expenses') THEN
    CREATE POLICY "Users can insert their own recurring expenses"
      ON recurring_expenses FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_expenses' AND policyname = 'Users can update their own recurring expenses') THEN
    CREATE POLICY "Users can update their own recurring expenses"
      ON recurring_expenses FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_expenses' AND policyname = 'Users can delete their own recurring expenses') THEN
    CREATE POLICY "Users can delete their own recurring expenses"
      ON recurring_expenses FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_occurrence ON recurring_expenses(next_occurrence);

-- ==================== BUDGET TABLE ====================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  budget_amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can view their own budgets') THEN
    CREATE POLICY "Users can view their own budgets"
      ON budgets FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can insert their own budgets') THEN
    CREATE POLICY "Users can insert their own budgets"
      ON budgets FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can update their own budgets') THEN
    CREATE POLICY "Users can update their own budgets"
      ON budgets FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can delete their own budgets') THEN
    CREATE POLICY "Users can delete their own budgets"
      ON budgets FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);

-- ==================== ADDITIONAL INDEXES FOR PERFORMANCE ====================
CREATE INDEX IF NOT EXISTS idx_expenses_card_id ON expenses(card_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method_id ON expenses(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_debts_card_id ON debts(card_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id_date ON income(user_id, income_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id_date ON expenses(user_id, expense_date);

-- ==================== FOREIGN KEY CONSTRAINTS ====================
-- Add missing foreign key for expenses.category_id (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_expenses_category_id'
  ) THEN
    ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_category_id
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add missing foreign key for expenses.payment_method_id (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_expenses_payment_method_id'
  ) THEN
    ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_payment_method_id
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==================== VERIFICATION ====================
-- Run these to verify all tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

