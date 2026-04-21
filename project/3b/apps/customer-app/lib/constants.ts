export const ACCESS_TOKEN_COOKIE = "customer_app_access_token";
export const GATEWAY_BASE_URL =
  process.env.GATEWAY_BASE_URL || "http://localhost:4000";

export const PRIVATE_ROUTES = [
  "/checkout",
  "/orders",
  "/profile",
] as const;
