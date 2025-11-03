const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Options for Supabase client
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
};

// For development, disable SSL verification if needed
if (process.env.NODE_ENV === 'development') {
  // Add Node.js fetch options to disable SSL verification
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Client for frontend operations (limited permissions)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Client for backend operations (full permissions)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, clientOptions);

module.exports = {
  supabaseClient,
  supabaseAdmin,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey
};

