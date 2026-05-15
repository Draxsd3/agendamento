const getClientIp = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

const normalizeKeyPart = (value) => String(value || '').trim().toLowerCase();

const createRateLimiter = ({
  windowMs,
  max,
  message = 'Muitas tentativas. Aguarde um momento e tente novamente.',
  keyGenerator,
}) => {
  const buckets = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(windowMs, 60_000));

  cleanup.unref?.();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const current = buckets.get(key);
    const bucket = current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: message });
    }

    return next();
  };
};

const loginIpLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => getClientIp(req),
});

const loginAccountLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 12,
  keyGenerator: (req) => `${getClientIp(req)}:${normalizeKeyPart(req.body?.email)}`,
});

const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.',
  keyGenerator: (req) => getClientIp(req),
});

const passwordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${getClientIp(req)}:${normalizeKeyPart(req.body?.email)}`,
});

module.exports = {
  loginAccountLimiter,
  loginIpLimiter,
  passwordResetLimiter,
  registerLimiter,
};
