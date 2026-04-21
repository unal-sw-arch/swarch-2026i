import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { initRabbitMQ } from "./lib/rabbitmq.js";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "notification-service" });
});

initRabbitMQ().catch((err) => {
  console.error("Failed to start RabbitMQ consumer:", err);
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `Notification Service is running on http://localhost:${info.port}`,
    );
  },
);
