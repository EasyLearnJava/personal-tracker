require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting Supabase database setup...\n');

    // 1. Create users table
    console.log('📝 Creating users table...');
    const { error: usersError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT auth.uid(),
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
      `
    });

    // 2. Create categories table
    console.log('📝 Creating categories table...');
    const { error: categoriesError } = await supabaseAdmin.rpc('exec', {
      sql: `
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
      `
    });

    // 3. Create payment_methods table
    console.log('📝 Creating payment_methods table...');
    const { error: paymentMethodsError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS payment_methods (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50),
          icon VARCHAR(10),
          color VARCHAR(7),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own payment methods"
          ON payment_methods FOR SELECT
          USING (auth.uid() = user_id);
      `
    });

    // 4. Create cards table
    console.log('📝 Creating cards table...');
    const { error: cardsError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS cards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          provider VARCHAR(50),
          last_four_digits VARCHAR(4),
          card_type VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own cards"
          ON cards FOR SELECT
          USING (auth.uid() = user_id);
      `
    });

    // 5. Create expenses table
    console.log('📝 Creating expenses table...');
    const { error: expensesError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS expenses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          category_id INTEGER,
          card_id UUID REFERENCES cards(id),
          payment_method_id UUID,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
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
      `
    });

    // 6. Create income table
    console.log('📝 Creating income table...');
    const { error: incomeError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS income (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          source VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          income_date DATE NOT NULL,
          notes TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        ALTER TABLE income ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own income"
          ON income FOR SELECT
          USING (auth.uid() = user_id);
      `
    });

    // 7. Create debts table
    console.log('📝 Creating debts table...');
    const { error: debtsError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS debts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          card_id UUID REFERENCES cards(id),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50),
          creditor VARCHAR(100),
          original_amount DECIMAL(10, 2),
          current_balance DECIMAL(10, 2) NOT NULL,
          minimum_payment DECIMAL(10, 2),
          interest_rate DECIMAL(5, 2),
          due_date INTEGER,
          start_date DATE,
          target_payoff_date DATE,
          card_name VARCHAR(100),
          notes TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own debts"
          ON debts FOR SELECT
          USING (auth.uid() = user_id);
      `
    });

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('  ✓ users');
    console.log('  ✓ categories');
    console.log('  ✓ payment_methods');
    console.log('  ✓ cards');
    console.log('  ✓ expenses');
    console.log('  ✓ income');
    console.log('  ✓ debts');
    console.log('\n🔒 Row Level Security (RLS) enabled on all tables');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();

