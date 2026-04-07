const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  console.error('[ERROR]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    env.nodeEnv === 'production' && statusCode === 500
      ? 'Erro interno do servidor.'
      : err.message || 'Erro interno do servidor.';

  return res.status(statusCode).json({ error: message });
};

module.exports = errorMiddleware;
