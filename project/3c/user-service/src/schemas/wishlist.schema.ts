import { z } from "@hono/zod-openapi";

export const AddGameSchema = z
  .object({
    userId: z.string(),
    gameId: z.string(),
    gameName: z.string(),
    imageUrl: z.string().url().nullable().optional(),
  })
  .openapi("AddGameBody");

export const GameSchema = z
  .object({
    id: z.string(),
    gameId: z.string(),
    gameName: z.string(),
    addedAt: z.string(),
    priceCents: z.number().nullable().optional(),
    originalPriceCents: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    store: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
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

export const GetDistinctGamesSuccess = z
  .object({
    success: z.literal(true),
    data: z.array(z.string()),
  })
  .openapi("GetDistinctGamesSuccess");

export const GamePriceUpdateSchema = z.object({
  gameName: z.string(),
  priceCents: z.number().nullable(),
  originalPriceCents: z.number().nullable(),
  currency: z.string().nullable(),
  store: z.string().nullable(),
  imageUrl: z.string().url().nullable().optional(),
});

export const UpdateGamePricesSchema = z
  .object({
    updates: z.array(GamePriceUpdateSchema),
  })
  .openapi("UpdateGamePricesBody");

export const UpdateGamePricesSuccess = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi("UpdateGamePricesSuccess");

export const GetGameSubscribersSchema = z
  .object({
    gameNames: z.array(z.string()),
  })
  .openapi("GetGameSubscribersBody");

export const SubscriberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const GetGameSubscribersSuccess = z
  .object({
    success: z.literal(true),
    data: z.record(z.string(), z.array(SubscriberSchema)),
  })
  .openapi("GetGameSubscribersSuccess");
