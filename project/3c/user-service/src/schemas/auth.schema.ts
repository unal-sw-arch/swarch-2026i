import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("User");

export const SessionSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.string().datetime(),
  })
  .openapi("Session");

export const LoginDataSchema = z
  .object({
    redirect: z.boolean(),
    token: z.string(),
    user: UserSchema,
  })
  .openapi("LoginData");

export const SignupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
  })
  .openapi("SignupRequest");

export const LoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .openapi("LoginRequest");

export const SignupSuccess = z
  .object({
    success: z.literal(true),
    data: UserSchema,
  })
  .openapi("SignupSuccess");

export const LoginSuccess = z
  .object({
    success: z.literal(true),
    message: z.string(),
    data: LoginDataSchema,
  })
  .openapi("LoginSuccess");

export const SessionSuccess = z
  .object({
    success: z.literal(true),
    data: z.object({
      user: UserSchema,
      session: SessionSchema,
    }),
  })
  .openapi("SessionSuccess");

export const SignOutSuccess = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi("SignOutSuccess");

export const ErrorResponse = z
  .object({
    success: z.literal(false),
    message: z.string(),
  })
  .openapi("ErrorResponse");

export const ZodErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      name: z.literal("ZodError"),
      message: z.string(),
    }),
  })
  .openapi("ZodError");

export const EmptySchema = z.object({}).strict().openapi("EmptyObject");
