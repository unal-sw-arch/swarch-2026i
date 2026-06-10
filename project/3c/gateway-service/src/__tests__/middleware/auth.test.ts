import { describe, it, expect, vi, afterEach } from "vitest";
import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function buildTestApp(): Hono {
  const app = new Hono();
  app.get("/protected", requireAuth, (c) => c.json({ ok: true }, 200));
  return app;
}

describe("requireAuth middleware", () => {
  it("passes through to next() when upstream returns 2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: { id: "user-1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const app = buildTestApp();
    const res = await app.request("/protected", { method: "GET" });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("returns 401 when upstream returns 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const app = buildTestApp();
    const res = await app.request("/protected", { method: "GET" });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when fetch throws (upstream unreachable)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );

    const app = buildTestApp();
    const res = await app.request("/protected", { method: "GET" });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});
