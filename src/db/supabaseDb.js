const { supabaseAdmin, supabaseClient } = require('../config/supabase');

// ==================== EXPENSES ====================
const readExpenses = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading expenses:', error);
    return [];
  }
};

const writeExpenses = async (userId, expenses) => {
  try {
    // This is handled by individual insert/update/delete operations
    return true;
  } catch (error) {
    console.error('Error writing expenses:', error);
    return false;
  }
};

// ==================== CATEGORIES ====================
const readCategories = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
};

const writeCategories = async (userId, categories) => {
  try {
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    return false;
  }
};



// ==================== INITIALIZATION ====================
const initializeDatabase = async () => {
  try {
    console.log('✅ Supabase database initialized');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
  readExpenses,
  writeExpenses,
  readCategories,
  writeCategories,
  supabaseClient,
  supabaseAdmin
};

