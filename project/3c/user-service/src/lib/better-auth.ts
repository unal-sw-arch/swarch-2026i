import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import prisma from "./prisma.js";
import "dotenv/config";

function parseOrigins(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const trustedOrigins = Array.from(
  new Set([
    process.env.BETTER_AUTH_URL,
    process.env.FRONTEND_URL,
    process.env.GATEWAY_PUBLIC_URL,
    process.env.NEXT_PUBLIC_GATEWAY_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://gateway-service:8080",
    "http://frontend-service:3000",
    ...parseOrigins(process.env.TRUSTED_ORIGINS),
  ].filter((origin): origin is string => Boolean(origin))),
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
});
