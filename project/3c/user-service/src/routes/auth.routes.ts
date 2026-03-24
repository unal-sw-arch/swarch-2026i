import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../lib/better-auth.js";
import {
  ErrorResponse,
  LoginSchema,
  LoginSuccess,
  SessionSuccess,
  SignOutSuccess,
  SignupSchema,
  SignupSuccess,
} from "../schemas/auth.schema.js";

const authRouter = new OpenAPIHono();

const signupRoute = createRoute({
  method: "post",
  path: "/sign-up/email",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: { content: { "application/json": { schema: SignupSchema } } },
  },
  responses: {
    201: {
      description: "User created",
      content: { "application/json": { schema: SignupSuccess } },
    },
    400: {
      description: "Error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const loginRoute = createRoute({
  method: "post",
  path: "/sign-in/email",
  tags: ["Auth"],
  summary: "Login",
  request: {
    body: { content: { "application/json": { schema: LoginSchema } } },
  },
  responses: {
    200: {
      description: "Login success",
      content: { "application/json": { schema: LoginSuccess } },
    },
    400: {
      description: "Error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const sessionRoute = createRoute({
  method: "get",
  path: "/get-session",
  tags: ["Auth"],
  summary: "Get current session",
  responses: {
    200: {
      description: "Session data",
      content: { "application/json": { schema: SessionSuccess } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

const signOutRoute = createRoute({
  method: "post",
  path: "/sign-out",
  tags: ["Auth"],
  summary: "Sign out",
  responses: {
    200: {
      description: "Signed out",
      content: { "application/json": { schema: SignOutSuccess } },
    },
  },
});

authRouter.openAPIRegistry.registerPath(signupRoute);
authRouter.openAPIRegistry.registerPath(loginRoute);
authRouter.openAPIRegistry.registerPath(sessionRoute);
authRouter.openAPIRegistry.registerPath(signOutRoute);

authRouter.on([signupRoute.method.toUpperCase()], signupRoute.path, (c) =>
  auth.handler(c.req.raw),
);
authRouter.on([loginRoute.method.toUpperCase()], loginRoute.path, (c) =>
  auth.handler(c.req.raw),
);
authRouter.on([sessionRoute.method.toUpperCase()], sessionRoute.path, (c) =>
  auth.handler(c.req.raw),
);
authRouter.on([signOutRoute.method.toUpperCase()], signOutRoute.path, (c) =>
  auth.handler(c.req.raw),
);

export default authRouter;
