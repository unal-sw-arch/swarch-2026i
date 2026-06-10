import type { Context, Next } from "hono";
import { redis } from "../lib/redis.js";

const WINDOW_MS = 60_000; // 1-minute sliding window
const MAX_REQUESTS = 10;

/**
 * Sliding-window rate limiter backed by a Redis sorted set.
 *
 * Each entry is scored by its arrival timestamp (ms). On every request:
 *   1. Remove entries older than the window.
 *   2. Add the current request.
 *   3. Count the remaining entries — reject with 429 if over the limit.
 *
 * Key: `ratelimit:search:<ip>`  TTL: 60 s
 */
export async function rateLimiter(c: Context, next: Next): Promise<void> {
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown";

  const key = `ratelimit:search:${ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  // Unique member per request to avoid collisions at the same millisecond
  const member = `${now}-${Math.random().toString(36).slice(2)}`;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, "-inf", String(windowStart));
  pipeline.zadd(key, now, member);
  pipeline.zcard(key);
  pipeline.expire(key, 60);
  const results = await pipeline.exec();

  const count = (results?.[2]?.[1] ?? 0) as number;

  c.header("X-RateLimit-Limit", String(MAX_REQUESTS));
  c.header("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS - count)));

  if (count > MAX_REQUESTS) {
    c.header("Retry-After", "60");
    c.res = c.json(
      { error: "Too many requests. Please wait before searching again." },
      429,
    );
    return;
  }

  await next();
}
