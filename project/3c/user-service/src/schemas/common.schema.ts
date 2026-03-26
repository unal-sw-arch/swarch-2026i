import { z } from "@hono/zod-openapi";

export const SuccessResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.literal(true),
    data: schema,
  });

export const ErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
});
