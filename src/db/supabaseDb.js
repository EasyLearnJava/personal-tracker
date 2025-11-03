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

// ==================== INCOME ====================
const readIncome = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading income:', error);
    return [];
  }
};

const writeIncome = async (userId, income) => {
  try {
    return true;
  } catch (error) {
    console.error('Error writing income:', error);
    return false;
  }
};

// ==================== PAYMENT METHODS ====================
const readPaymentMethods = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading payment methods:', error);
    return [];
  }
};

const writePaymentMethods = async (userId, methods) => {
  try {
    return true;
  } catch (error) {
    console.error('Error writing payment methods:', error);
    return false;
  }
};

// ==================== CARDS ====================
const readCards = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading cards:', error);
    return [];
  }
};

const writeCards = async (userId, cards) => {
  try {
    return true;
  } catch (error) {
    console.error('Error writing cards:', error);
    return false;
  }
};

// ==================== DEBTS ====================
const readDebts = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reading debts:', error);
    return [];
  }
};

const writeDebts = async (userId, debts) => {
  try {
    return true;
  } catch (error) {
    console.error('Error writing debts:', error);
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
  readIncome,
  writeIncome,
  readPaymentMethods,
  writePaymentMethods,
  readCards,
  writeCards,
  readDebts,
  writeDebts,
  supabaseClient,
  supabaseAdmin
};

