const env = require('../config/env');

const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || (err.code === 'SUPABASE_TIMEOUT' ? 504 : 500);

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  } else {
    console.warn('[WARN]', err.message || err);
  }

  const message =
    env.nodeEnv === 'production' && statusCode === 500
      ? 'Erro interno do servidor.'
      : err.message || 'Erro interno do servidor.';

  return res.status(statusCode).json({ error: message });
};

module.exports = errorMiddleware;
