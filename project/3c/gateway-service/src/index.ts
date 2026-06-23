import "dotenv/config";
import os from "node:os";
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
import ranking from "./routes/ranking.js";

const app = new Hono();
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://localhost:8443",
  "https://127.0.0.1:8443",
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
    allowHeaders: ["Content-Type", "Authorization", "Cookie", "Idempotency-Key"],
    credentials: true,
  }),
);

app.use("*", logger());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get("/health", (c) => {
  // `instance` exposes the hostname of the serving process. Inside Kubernetes
  // this is the Pod name, which makes load-balancing across replicas directly
  // observable (each request may be answered by a different Pod) and is used by
  // the liveness/readiness probes defined in k8s/gateway-deployment.yaml.
  return c.json({
    status: "ok",
    service: "gateway",
    instance: os.hostname(),
  });
});

// ---------------------------------------------------------------------------
// Upstream routes
// ---------------------------------------------------------------------------

app.route("/api/games", games);
app.route("/api/auth", auth);
app.route("/api/wishlist", wishlist);
app.route("/api/events", events);
app.route("/api/ranking", ranking);

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
