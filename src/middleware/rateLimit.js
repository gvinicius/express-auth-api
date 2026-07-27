// Lightweight in-memory rate limit middleware.
// Configure with env:
// - RATE_LIMIT_WINDOW_MS (default 60000)
// - RATE_LIMIT_MAX (default 120)

const buckets = new Map();

function makeKey(req) {
  const ip = (req.ip || (req.connection && req.connection.remoteAddress) || 'unknown');
  // Use originalUrl to include query params, isolating limits per distinct request pattern
  const path = `${req.originalUrl || ((req.baseUrl || '') + (req.path || ''))}`;
  // Separate buckets per IP and route path
  return `${ip}|${path}`;
}

module.exports = function rateLimit(req, res, next) {
  const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const MAX = parseInt(process.env.RATE_LIMIT_MAX || '120', 10);
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
