import { createHash } from "crypto";
import type { Context, Next } from "hono";
import { redis } from "../lib/redis.js";

const TTL_SECONDS = 86_400; // 24 hours

/**
 * Idempotency middleware for POST /api/wishlist/games.
 *
 * Derives a deterministic key from SHA-256(userId + ":" + slug) so that
 * duplicate "add to wishlist" requests within 24 h return the cached
 * response instead of creating a second record.
 *
 * Requires `requireAuth` to have run first (sets `userId` in context).
 * Silently skips (passes through) if userId or slug are unavailable.
 */
export async function idempotency(c: Context, next: Next): Promise<void> {
  if (c.req.method !== "POST") {
    await next();
    return;
  }

  const userId = c.get("userId") as string | undefined;
  if (!userId) {
    await next();
    return;
  }

  // Clone the request so the original body stream remains intact for the proxy
  let slug: string | undefined;
  try {
    const body = (await c.req.raw.clone().json()) as { slug?: string };
    slug = body.slug;
  } catch {
    /* malformed JSON — skip idempotency, let upstream handle it */
  }

  if (!slug) {
    await next();
    return;
  }

  const hash = createHash("sha256")
    .update(`${userId}:${slug}`)
    .digest("hex");
  const key = `idem:${hash}`;

  const cached = await redis.get(key);
  if (cached) {
    c.res = new Response(cached, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Idempotent-Replayed": "true",
      },
    });
    return;
  }

  await next();

  // Cache a successful upstream response so future duplicates replay it
  if (c.res && c.res.status >= 200 && c.res.status < 300) {
    try {
      const body = await c.res.clone().text();
      await redis.set(key, body, "EX", TTL_SECONDS);
    } catch {
      /* non-fatal — don't break the response on cache write failure */
    }
  }
}
