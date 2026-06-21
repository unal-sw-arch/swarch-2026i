import { Hono } from "hono";
import { env } from "../lib/env.js";
import { proxyRequest } from "../lib/proxy.js";

const ranking = new Hono();

/**
 * Wildcard proxy: /api/ranking/* -> ranking-service /api/v1/ranking/*
 * 
 * Primary routes:
 *   GET /api/ranking/top   -> /api/v1/ranking/top?store=&limit=
 *   GET /api/ranking/health -> /api/v1/ranking/health
 */
ranking.all("/*", async (c) => {
  const path = c.req.path.replace(/^\/api\/ranking/, "/api/v1/ranking");
  const queryString = c.req.url.includes("?")
    ? c.req.url.slice(c.req.url.indexOf("?"))
    : "";
  const upstream = `${env.RANKING_SERVICE_URL}${path}${queryString}`;
  return proxyRequest(upstream, c);
});

export default ranking;
