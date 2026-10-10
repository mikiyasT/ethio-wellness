type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Light in-memory limit. Counts live in this process only, so each Railway
 * replica has its own ceiling. One proxy hop is trusted only when cookies are Secure.
 */
export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientAddress(req: { ip?: string; socket: { remoteAddress?: string | null } }) {
  return req.ip || req.socket.remoteAddress || "unknown";
}
