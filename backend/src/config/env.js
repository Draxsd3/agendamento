require('dotenv').config();

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  },

  asaas: {
    apiKey: process.env.ASAAS_API_KEY || '',
    environment: process.env.ASAAS_ENVIRONMENT || 'sandbox',
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN || '',
    checkout: {
      successUrl: process.env.ASAAS_CHECKOUT_SUCCESS_URL || '',
      cancelUrl: process.env.ASAAS_CHECKOUT_CANCEL_URL || '',
      expiredUrl: process.env.ASAAS_CHECKOUT_EXPIRED_URL || '',
      minutesToExpire: Number(process.env.ASAAS_CHECKOUT_MINUTES_TO_EXPIRE || 30),
    },
  },
};
