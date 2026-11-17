export class RateLimiter {
  constructor({ windowMs, max }) {
    this.windowMs = windowMs;
    this.max = max;
    this.hits = new Map();
    const timer = setInterval(() => this.cleanup(), Math.min(windowMs, 10 * 60 * 1000));
    timer.unref?.();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key);
    }
  }

  consume(key) {
    const now = Date.now();
    let entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count += 1;
    const allowed = entry.count <= this.max;
    return {
      allowed,
      remaining: Math.max(0, this.max - entry.count),
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  reset(key) {
    this.hits.delete(key);
  }
}

export const loginLimiter = new RateLimiter({ windowMs: 15 * 60 * 1000, max: 6 });
export const contactLimiter = new RateLimiter({ windowMs: 10 * 60 * 1000, max: 4 });

export function minutesUntil(ms) {
  return Math.max(1, Math.ceil(ms / 60000));
}
