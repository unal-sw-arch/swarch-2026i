import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./routes/auth.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

const app = new OpenAPIHono();

app.route("/api/auth", authRouter);
app.route("/wishlist", wishlistRoutes);

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "User Service API",
    version: "1.0.0",
  },
});

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
    supportedSubmitMethods: [],
  }),
);

export default app;

// Only start the HTTP server when this file is run directly (not imported by tests)
if (process.env.VITEST === undefined) {
  serve({
    fetch: app.fetch,
    port: 4000,
  });
}
