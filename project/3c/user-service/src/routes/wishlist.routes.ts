import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { wishlistController } from "../controllers/wishlist.controller.js";
import {
  AddGameSchema,
  AddGameSuccess,
  DeleteGameSuccess,
  ErrorResponse,
  GetDistinctGamesSuccess,
  GetGameSubscribersSchema,
  GetGameSubscribersSuccess,
  GetWishlistSuccess,
  UpdateGamePricesSchema,
  UpdateGamePricesSuccess,
} from "../schemas/wishlist.schema.js";

const wishlistRoutes = new OpenAPIHono();

const getWishlistRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Wishlist"],
  summary: "Get user wishlist",
  request: {
    query: z.object({
      userId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Wishlist fetched successfully",
      content: {
        "application/json": {
          schema: GetWishlistSuccess,
        },
      },
    },
    400: {
      description: "Missing required query parameter: userId",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
  },
});

wishlistRoutes.openapi(getWishlistRoute, (c) =>
  wishlistController.getWishlist(c),
);

const addGameRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Wishlist"],
  summary: "Add game to wishlist",
  description:
    "Creates the wishlist automatically if the user does not have one yet. Adds the game to the existing wishlist otherwise.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddGameSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Game added successfully",
      content: {
        "application/json": {
          schema: AddGameSuccess,
        },
      },
    },
    400: {
      description:
        "Missing or invalid required fields: userId, gameId, gameName",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    409: {
      description: "Game already in wishlist",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
  },
});

wishlistRoutes.openapi(addGameRoute, (c) => wishlistController.addGame(c));

const deleteGameRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Wishlist"],
  summary: "Remove game from wishlist",
  description: "Deletes a specific game entry by its internal UUID",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Game removed from wishlist successfully",
      content: {
        "application/json": {
          schema: DeleteGameSuccess,
        },
      },
    },
    400: {
      description: "Missing required path parameter: id",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorResponse,
        },
      },
    },
  },
});

wishlistRoutes.openapi(deleteGameRoute, (c) =>
  wishlistController.deleteGame(c),
);

const getDistinctGamesRoute = createRoute({
  method: "get",
  path: "/games",
  tags: ["Wishlist"],
  summary: "Get all distinct games tracked across all wishlists",
  responses: {
    200: {
      description: "Games fetched successfully",
      content: { "application/json": { schema: GetDistinctGamesSuccess } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

wishlistRoutes.openapi(getDistinctGamesRoute, (c) =>
  wishlistController.getDistinctGames(c),
);

const updateGamePricesRoute = createRoute({
  method: "patch",
  path: "/prices",
  tags: ["Wishlist"],
  summary: "Update prices for games tracked in wishlists",
  request: {
    body: {
      content: { "application/json": { schema: UpdateGamePricesSchema } },
    },
  },
  responses: {
    200: {
      description: "Prices updated successfully",
      content: { "application/json": { schema: UpdateGamePricesSuccess } },
    },
    400: {
      description: "Invalid request body",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

wishlistRoutes.openapi(updateGamePricesRoute, (c) =>
  wishlistController.updateGamePrices(c),
);

const getSubscribersRoute = createRoute({
  method: "post",
  path: "/subscribers",
  tags: ["Wishlist"],
  summary: "Get subscribers for specific games",
  request: {
    body: {
      content: { "application/json": { schema: GetGameSubscribersSchema } },
    },
  },
  responses: {
    200: {
      description: "Subscribers fetched successfully",
      content: { "application/json": { schema: GetGameSubscribersSuccess } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

wishlistRoutes.openapi(getSubscribersRoute, (c) =>
  wishlistController.getSubscribers(c),
);

export default wishlistRoutes;
