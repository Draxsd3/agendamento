const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const env = require('./env');

// Service role client - bypasses RLS, used server-side only
const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: WebSocket,
  },
});

module.exports = supabase;
