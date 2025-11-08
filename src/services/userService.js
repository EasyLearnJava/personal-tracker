const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

class UserService {
  /**
   * Get all users
   */
  static async getAllUsers() {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, created_at')
        .order('email', { ascending: true });

      if (error) throw error;
      
      logger.info('All users fetched', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error fetching all users', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      logger.info('User fetched', { userId });
      return data;
    } catch (error) {
      logger.error('Error fetching user', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, created_at')
        .eq('email', email)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      logger.error('Error fetching user by email', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Create user profile
   */
  static async createUserProfile(userId, email, fullName = '') {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          id: userId,
          email: email,
          full_name: fullName || email
        }])
        .select()
        .single();

      if (error) throw error;
      
      logger.info('User profile created', { userId, email });
      return data;
    } catch (error) {
      logger.error('Error creating user profile', { userId, email, error: error.message });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          full_name: updates.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      logger.info('User profile updated', { userId });
      return data;
    } catch (error) {
      logger.error('Error updating user profile', { userId, error: error.message });
      throw error;
    }
  }
}

module.exports = UserService;

