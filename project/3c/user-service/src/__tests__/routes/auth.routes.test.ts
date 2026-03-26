import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma.js", () => ({ default: {} }));
vi.mock("../../lib/better-auth.js", () => ({
  auth: {
    handler: vi.fn(),
  },
}));

import app from "../../app.js";
import { auth } from "../../lib/better-auth.js";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerified: false,
  image: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper para crear un Response JSON simulado
function jsonResponse(
  body: unknown,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

describe("POST /api/auth/sign-up/email", () => {
  it("returns 201 with user data on success", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ user: mockUser, token: null }, 201),
    );

    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe("test@example.com");
  });

  it("returns 400 when email is already in use", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "User already exists" }, 400),
    );

    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "taken@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("User already exists");
  });

  it("returns 422 when body is invalid", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "Invalid email address" }, 422),
    );

    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "123" }),
    });

    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/sign-in/email", () => {
  it("returns 200 with token and Set-Cookie on success", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse(
        { redirect: false, token: "session-token-abc", user: mockUser },
        200,
        {
          "Set-Cookie":
            "better-auth.session_token=session-token-abc; Path=/; HttpOnly",
        },
      ),
    );

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBe("session-token-abc");
    expect(body.user.id).toBe("user-1");
    expect(res.headers.get("Set-Cookie")).toContain("session-token-abc");
  });

  it("returns 401 with invalid credentials", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "Invalid email or password" }, 401),
    );

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Invalid email or password");
  });
});

describe("GET /api/auth/get-session", () => {
  it("returns 200 with session and user on valid cookie", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({
        user: mockUser,
        session: {
          id: "session-1",
          userId: "user-1",
          expiresAt: "2025-01-01T00:00:00.000Z",
        },
      }),
    );

    const res = await app.request("/api/auth/get-session", {
      method: "GET",
      headers: { Cookie: "better-auth.session_token=valid-token" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe("user-1");
    expect(body.session.userId).toBe("user-1");
    expect(body.session.expiresAt).toBe("2025-01-01T00:00:00.000Z");
  });

  it("returns 401 when no session cookie is present", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "Unauthorized" }, 401),
    );

    const res = await app.request("/api/auth/get-session", {
      method: "GET",
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Unauthorized");
  });
});

describe("POST /api/auth/sign-out", () => {
  it("returns 200 on successful sign out", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "Signed out successfully" }, 200),
    );

    const res = await app.request("/api/auth/sign-out", {
      method: "POST",
      headers: { Cookie: "better-auth.session_token=valid-token" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Signed out successfully");
  });

  it("calls auth.handler once", async () => {
    vi.mocked(auth.handler).mockResolvedValue(
      jsonResponse({ message: "Signed out successfully" }, 200),
    );

    await app.request("/api/auth/sign-out", {
      method: "POST",
      headers: { Cookie: "better-auth.session_token=valid-token" },
    });

    expect(auth.handler).toHaveBeenCalledTimes(1);
  });
});
