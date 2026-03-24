import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env.js";
import { startConsumer } from "./lib/rabbitmq.js";
import games from "./routes/games.js";
import auth from "./routes/auth.js";
import wishlist from "./routes/wishlist.js";
import events from "./routes/events.js";

const app = new Hono();
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].filter(Boolean);

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] ?? "";
      return allowedOrigins.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  }),
);

app.use("*", logger());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "gateway" });
});

// ---------------------------------------------------------------------------
// Upstream routes
// ---------------------------------------------------------------------------

app.route("/api/games", games);
app.route("/api/auth", auth);
app.route("/api/wishlist", wishlist);
app.route("/api/events", events);

// ---------------------------------------------------------------------------
// 404 fallthrough
// ---------------------------------------------------------------------------

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default app;

// Only start background services and the HTTP server when run directly (not in tests)
if (process.env["VITEST"] === undefined) {
  // Start RabbitMQ consumer — feeds priceUpdateBus for the SSE /events/stream route.
  // Failures are non-fatal: the gateway stays up, SSE just won't receive updates.
  startConsumer().catch((err) =>
    console.error("[rabbitmq] consumer failed to start:", err),
  );

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`gateway-service listening on http://localhost:${info.port}`);
    },
  );
}
