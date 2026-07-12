const map = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  ip: string,
  limit = 30,
  windowMs = 60000
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || now > entry.reset) {
    map.set(ip, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count++;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of map) {
      if (now > val.reset) map.delete(key);
    }
  }, 300000);
}
