const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const env = require('./env');

const fetchWithTimeout = async (input, init = {}) => {
  const controller = new AbortController();
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, env.supabase.requestTimeoutMs);

  const upstreamSignal = init.signal;
  const abortFromUpstream = () => controller.abort();

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut && err.name === 'AbortError') {
      const timeoutError = new Error('Tempo limite ao acessar o banco de dados.');
      timeoutError.code = 'SUPABASE_TIMEOUT';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    if (upstreamSignal) {
      upstreamSignal.removeEventListener('abort', abortFromUpstream);
    }
  }
};

// Service role client - bypasses RLS, used server-side only
const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: WebSocket,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

module.exports = supabase;
