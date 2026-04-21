import { describe, it, expect, vi, afterEach } from "vitest";

// Prevent RabbitMQ / amqplib from being imported and attempting a connection
vi.mock("../../lib/rabbitmq.js", () => ({
  startConsumer: vi.fn().mockResolvedValue(undefined),
  priceUpdateBus: { on: vi.fn(), emit: vi.fn(), setMaxListeners: vi.fn() },
}));

import app from "../../index.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockUpstreamOk(body: unknown = { success: true }): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("Auth proxy routes", () => {
  it("POST /api/auth/sign-up/email proxies to /api/auth/sign-up/email", async () => {
    mockUpstreamOk({ success: true, data: { id: "user-1" } });

    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    expect(res.status).toBe(200);
    const fetchMock = vi.mocked(globalThis.fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    const calledInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(calledUrl).toContain("/api/auth/sign-up/email");
    expect(new Headers(calledInit.headers).get("origin")).toBe(
      "http://localhost:8080",
    );
  });

  it("POST /api/auth/sign-in/email proxies to /api/auth/sign-in/email", async () => {
    mockUpstreamOk({ success: true, token: "abc" });

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    const fetchMock = vi.mocked(globalThis.fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    const calledInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(calledUrl).toContain("/api/auth/sign-in/email");
    expect(new Headers(calledInit.headers).get("origin")).toBe(
      "http://localhost:8080",
    );
  });

  it("POST /api/auth/sign-out proxies to /api/auth/sign-out", async () => {
    mockUpstreamOk({ success: true, message: "Signed out" });

    const res = await app.request("/api/auth/sign-out", {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const fetchMock = vi.mocked(globalThis.fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    const calledInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(calledUrl).toContain("/api/auth/sign-out");
    expect(new Headers(calledInit.headers).get("origin")).toBe(
      "http://localhost:8080",
    );
  });

  it("GET /api/auth/get-session proxies to /api/auth/get-session", async () => {
    mockUpstreamOk({ success: true, data: { user: { id: "user-1" } } });

    const res = await app.request("/api/auth/get-session", {
      method: "GET",
      headers: { Cookie: "better-auth.session_token=abc" },
    });

    expect(res.status).toBe(200);
    const fetchMock = vi.mocked(globalThis.fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain("/api/auth/get-session");
  });
});
