const { supabaseAdmin, supabaseClient } = require('../config/supabase');
const Logger = require('../utils/logger');

class AuthService {
  // Register new user
  static async register(email, password, fullName = '') {
    try {
      Logger.debug('Registration attempt', { email, fullName });

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm email
      });

      if (authError) {
        Logger.error('Supabase Auth user creation failed', { email, error: authError.message });
        throw new Error(authError.message);
      }

      Logger.debug('Supabase Auth user created', { userId: authData.user.id, email });

      const userId = authData.user.id;

      // Create user profile
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: userId,
            email,
            full_name: fullName || email.split('@')[0]
          }
        ]);

      if (profileError) {
        Logger.error('User profile creation failed', { userId, email, error: profileError.message });
        throw new Error(profileError.message);
      }

      Logger.logAuthEvent('REGISTER', email, true, { userId });

      return {
        success: true,
        user: {
          id: userId,
          email,
          full_name: fullName || email.split('@')[0]
        }
      };
    } catch (error) {
      Logger.logAuthEvent('REGISTER', email, false, { error: error.message });
      Logger.error('Registration error', { email, error: error.message, stack: error.stack });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  static async login(email, password) {
    try {
      Logger.debug('Login attempt', { email });

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Logger.error('Supabase Auth login failed', { email, error: error.message });
        throw new Error(error.message);
      }

      Logger.debug('Supabase Auth login successful', { userId: data.user.id, email });

      // Get user profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        Logger.error('User profile retrieval failed', { userId: data.user.id, error: profileError.message });
        throw new Error(profileError.message);
      }

      Logger.logAuthEvent('LOGIN', email, true, { userId: data.user.id });

      return {
        success: true,
        user: profileData,
        session: data.session,
        accessToken: data.session.access_token
      };
    } catch (error) {
      Logger.logAuthEvent('LOGIN', email, false, { error: error.message });
      Logger.error('Login error', { email, error: error.message, stack: error.stack });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  static async logout() {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();

      if (error || !user) {
        return {
          success: false,
          user: null
        };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          user: null
        };
      }

      return {
        success: true,
        user: profileData
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        user: null
      };
    }
  }

  // Verify token
  static async verifyToken(token) {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);

      if (error || !user) {
        return {
          success: false,
          user: null
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        user: null
      };
    }
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AuthService;

