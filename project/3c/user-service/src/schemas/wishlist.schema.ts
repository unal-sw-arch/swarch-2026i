import { z } from "@hono/zod-openapi";

export const AddGameSchema = z
  .object({
    userId: z.string(),
    gameId: z.string(),
    gameName: z.string(),
  })
  .openapi("AddGameBody");

export const GameSchema = z
  .object({
    id: z.string(),
    gameId: z.string(),
    gameName: z.string(),
    addedAt: z.string(),
  })
  .openapi("Game");

export const WishlistSchema = z
  .object({
    userId: z.string(),
    createdAt: z.string(),
    games: z.array(z.lazy(() => GameSchema)),
  })
  .openapi("Wishlist");

export const GetWishlistSuccess = z
  .object({
    success: z.literal(true),
    data: WishlistSchema.nullable(),
  })
  .openapi("GetWishlistSuccess");

export const AddGameSuccess = z
  .object({
    success: z.literal(true),
    data: GameSchema,
  })
  .openapi("AddGameSuccess");

export const DeleteGameSuccess = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi("DeleteGameSuccess");

export const ErrorResponse = z
  .object({
    success: z.literal(false),
    message: z.string(),
  })
  .openapi("ErrorResponse");
