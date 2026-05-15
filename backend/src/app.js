const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

app.set('trust proxy', 1);

const isDevelopmentLoopbackOrigin = (origin) => {
  if (env.nodeEnv === 'production') return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (env.cors.origins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      if (isDevelopmentLoopbackOrigin(origin)) {
        return callback(null, true);
      }

      const error = new Error(`Origem nao permitida pelo CORS: ${origin}`);
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    if (durationMs >= env.http.slowRequestMs) {
      console.warn(
        `[SLOW] ${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(durationMs)}ms`
      );
    }
  });

  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Rota nao encontrada: ${req.method} ${req.path}` });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
