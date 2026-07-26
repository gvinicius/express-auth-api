// Lightweight in-memory rate limit middleware.
// Configure with env:
// - RATE_LIMIT_WINDOW_MS (default 60000)
// - RATE_LIMIT_MAX (default 120)

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const MAX = parseInt(process.env.RATE_LIMIT_MAX || '120', 10);

const buckets = new Map();

function makeKey(req) {
  const ip = (req.ip || req.connection?.remoteAddress || 'unknown');
  // Single global bucket per IP is fine for this API size
  return ip;
}

module.exports = function rateLimit(req, res, next) {
  const key = makeKey(req);
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, b);
  }

  // Attach useful headers
  res.setHeader('X-RateLimit-Limit', String(MAX));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(b.resetAt / 1000)));

  if (b.count >= MAX) {
    const retrySec = Math.max(0, Math.ceil((b.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retrySec));
    return res.status(429).json({ error: 'Too many requests' });
  }

  b.count += 1;
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, MAX - b.count)));
  return next();
};

