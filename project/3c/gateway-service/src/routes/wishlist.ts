import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import { idempotency } from "../middleware/idempotency.js";
import { env } from "../lib/env.js";

const wishlist = new Hono<{ Variables: { userId: string } }>();

wishlist.use("/*", requireAuth);
wishlist.use("/games", idempotency);

/**
 * GET /api/wishlist → GET /wishlist?userId=<userId>
 */
wishlist.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const upstream = `${env.USER_SERVICE_URL}/wishlist?userId=${encodeURIComponent(userId)}`;
  const response = await fetch(upstream, {
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.text();
  return c.body(body, response.status as 200, {
    "Content-Type": "application/json",
  });
});

/**
 * POST /api/wishlist/games → POST /wishlist
 * Maps frontend payload { name, slug } → user-service { userId, gameId, gameName }
 */
wishlist.post("/games", async (c) => {
  const userId = c.get("userId") as string;
  const payload = await c.req.json<{ name: string; slug: string }>();

  const upstream = `${env.USER_SERVICE_URL}/wishlist`;
  const response = await fetch(upstream, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      gameId: payload.slug,
      gameName: payload.name,
    }),
  });
  const body = await response.text();
  return c.body(body, response.status as 201, {
    "Content-Type": "application/json",
  });
});

/**
 * DELETE /api/wishlist/games/:id → DELETE /wishlist/:id
 */
wishlist.delete("/games/:id", async (c) => {
  const id = c.req.param("id");
  const upstream = `${env.USER_SERVICE_URL}/wishlist/${id}`;
  const response = await fetch(upstream, { method: "DELETE" });
  const body = await response.text();
  return c.body(body, response.status as 200, {
    "Content-Type": "application/json",
  });
});

export default wishlist;
