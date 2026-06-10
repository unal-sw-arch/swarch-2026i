import { describe, it, expect, vi } from "vitest";

// Prevent RabbitMQ / amqplib from being imported and attempting a connection
vi.mock("../lib/rabbitmq.js", () => ({
  startConsumer: vi.fn().mockResolvedValue(undefined),
  priceUpdateBus: { on: vi.fn(), emit: vi.fn(), setMaxListeners: vi.fn() },
}));

import app from "../index.js";

describe("GET /health", () => {
  it("returns { status: 'ok', service: 'gateway' }", async () => {
    const res = await app.request("/health", { method: "GET" });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok", service: "gateway" });
  });
});
