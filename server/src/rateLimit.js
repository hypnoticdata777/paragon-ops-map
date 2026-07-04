// Minimal in-memory sliding-window limiter. Good enough for a single-instance
// self-hosted deployment; not distributed-safe, and resets on restart.
function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  const hits = new Map(); // ip -> array of request timestamps

  return function rateLimit(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter(ts => now - ts < windowMs);
    recent.push(now);
    hits.set(ip, recent);

    if (recent.length > max) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
      return;
    }
    next();
  };
}

module.exports = { createRateLimiter };
