import type { Context, Next } from "hono";
import { env } from "../lib/env.js";

type AuthVariables = {
  userId: string;
};

/**
 * requireAuth middleware.
 *
 * Validates the caller's session by forwarding its credentials to the
 * user-service `/api/auth/get-session` endpoint. Any non-2xx response is
 * treated as unauthenticated and immediately short-circuits with 401.
 */
export async function requireAuth(
  c: Context<{ Variables: AuthVariables }>,
  next: Next,
): Promise<void> {
  const sessionUrl = `${env.USER_SERVICE_URL}/api/auth/get-session`;

  // Forward the headers the upstream auth layer needs to identify the caller.
  const forwardHeaders = new Headers();

  const cookie = c.req.header("cookie");
  if (cookie) forwardHeaders.set("cookie", cookie);

  const authorization = c.req.header("authorization");
  if (authorization) forwardHeaders.set("authorization", authorization);

  let sessionResponse: Response;

  try {
    sessionResponse = await fetch(sessionUrl, {
      method: "GET",
      headers: forwardHeaders,
    });
  } catch {
    // Upstream unreachable — treat as auth failure rather than 502 so the
    // caller does not accidentally receive sensitive data.
    c.res = c.json({ error: "Unauthorized" }, 401);
    return;
  }

  if (!sessionResponse.ok) {
    c.res = c.json({ error: "Unauthorized" }, 401);
    return;
  }

  // Extract userId so downstream middleware (e.g., idempotency) can use it
  try {
    const body = (await sessionResponse.json()) as {
      user?: { id?: string };
      data?: { user?: { id?: string } };
    };
    const userId = body?.data?.user?.id ?? body?.user?.id;
    if (userId) {
      c.set("userId", userId);
    }
  } catch {
    /* non-fatal — session is valid, userId just won't be set */
  }

  await next();
}
