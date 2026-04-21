import { Hono } from "hono";
import { env } from "../lib/env.js";
import { proxyRequest } from "../lib/proxy.js";

const auth = new Hono();
const authProxyOptions = {
  defaultHeaders: {
    Origin:
      process.env["GATEWAY_AUTH_ORIGIN"] ??
      process.env["GATEWAY_PUBLIC_URL"] ??
      `http://localhost:${env.PORT}`,
  },
};

// Map gateway auth routes directly to the user-service auth router.
auth.post("/sign-up/email", (c) =>
  proxyRequest(
    `${env.USER_SERVICE_URL}/api/auth/sign-up/email`,
    c,
    authProxyOptions,
  ),
);

auth.post("/sign-in/email", (c) =>
  proxyRequest(
    `${env.USER_SERVICE_URL}/api/auth/sign-in/email`,
    c,
    authProxyOptions,
  ),
);

auth.post("/sign-out", (c) =>
  proxyRequest(`${env.USER_SERVICE_URL}/api/auth/sign-out`, c, authProxyOptions),
);

auth.get("/get-session", (c) =>
  proxyRequest(`${env.USER_SERVICE_URL}/api/auth/get-session`, c),
);

/**
 * Wildcard proxy: /api/auth/* → user-service /api/auth/*
 *
 * Keeps the gateway surface aligned with the user-service auth router.
 * No auth guard — the auth service handles its own validation.
 */
auth.all("/*", async (c) => {
  const path = c.req.path;
  const queryString = c.req.url.includes("?")
    ? c.req.url.slice(c.req.url.indexOf("?"))
    : "";
  const upstream = `${env.USER_SERVICE_URL}${path}${queryString}`;
  return proxyRequest(upstream, c, authProxyOptions);
});

export default auth;
