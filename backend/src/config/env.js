const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const parseCorsOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'https://agendamento-one-black.vercel.app',
  ];

  const configured = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...defaults, ...configured].map(normalizeOrigin))];
};

const intFromEnv = (key, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`Invalid env var ${key}. Expected integer between ${min} and ${max}.`);
  }

  return parsed;
};

const jwtSecret = required('JWT_SECRET');

// Bloquear segredos fracos em producao
if (process.env.NODE_ENV === 'production') {
  const WEAK = ['chavesegura', 'secret', 'changeme', '12345678', 'jwt_secret'];
  if (WEAK.some((w) => jwtSecret.toLowerCase().includes(w)) || jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET inseguro para producao. Gere um valor forte: openssl rand -base64 64'
    );
  }
}

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    requestTimeoutMs: intFromEnv('SUPABASE_REQUEST_TIMEOUT_MS', 12000, {
      min: 3000,
      max: 60000,
    }),
  },

  http: {
    requestTimeoutMs: intFromEnv('HTTP_REQUEST_TIMEOUT_MS', 65000, {
      min: 5000,
      max: 120000,
    }),
    slowRequestMs: intFromEnv('SLOW_REQUEST_MS', 2500, {
      min: 250,
      max: 60000,
    }),
  },

  auth: {
    passwordSaltRounds: intFromEnv('BCRYPT_SALT_ROUNDS', 12, {
      min: 10,
      max: 14,
    }),
  },

  cors: {
    origins: parseCorsOrigins(),
  },

  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT || 587),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@agendamento.app',
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
