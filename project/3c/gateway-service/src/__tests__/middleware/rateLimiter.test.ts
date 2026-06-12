import { afterEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

const execMock = vi.fn();
const pipelineMock = vi.fn(() => ({
  zremrangebyscore: vi.fn().mockReturnThis(),
  zadd: vi.fn().mockReturnThis(),
  zcard: vi.fn().mockReturnThis(),
  expire: vi.fn().mockReturnThis(),
  exec: execMock,
}));

vi.mock("../../lib/redis.js", () => ({
  redis: {
    pipeline: pipelineMock,
  },
}));

import { rateLimiter } from "../../middleware/rateLimiter.js";

afterEach(() => {
  vi.clearAllMocks();
});

function buildApp() {
  const app = new Hono();
  app.get("/search", rateLimiter, (c) => c.json({ ok: true }));
  return app;
}

describe("rateLimiter middleware", () => {
  it("allows requests within the quota and returns 429 after the limit", async () => {
    execMock.mockResolvedValue([
      [null, null],
      [null, null],
      [null, 10],
      [null, null],
    ]);

    const app = buildApp();
    const allowed = await app.request("/search", {
      method: "GET",
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    expect(allowed.status).toBe(200);
    expect(await allowed.json()).toEqual({ ok: true });
    expect(allowed.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(allowed.headers.get("X-RateLimit-Remaining")).toBe("0");

    execMock.mockResolvedValue([
      [null, null],
      [null, null],
      [null, 11],
      [null, null],
    ]);

    const throttled = await app.request("/search", {
      method: "GET",
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    expect(throttled.status).toBe(429);
    expect(await throttled.json()).toEqual({
      error: "Too many requests. Please wait before searching again.",
    });
    expect(throttled.headers.get("Retry-After")).toBe("60");
  });
});
