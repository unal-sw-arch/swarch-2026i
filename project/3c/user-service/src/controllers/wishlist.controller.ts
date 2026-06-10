import type { Context } from "hono";
import { wishlistService } from "../services/wishlist.service.js";

export const wishlistController = {
  async getWishlist(c: Context) {
    try {
      const userId = c.req.query("userId");
      if (!userId) {
        return c.json({ success: false, message: "userId is required" }, 400);
      }

      const data = await wishlistService.getWishlist(userId);
      return c.json({ success: true, data }, 200);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error fetching wishlist";
      return c.json({ success: false, message }, 500);
    }
  },

  async addGame(c: Context) {
    try {
      const body = await c.req.json();
      const { userId, gameId, gameName, imageUrl } = body as {
        userId?: string;
        gameId?: string;
        gameName?: string;
        imageUrl?: string;
      };
      if (!userId || !gameId || !gameName) {
        return c.json(
          {
            success: false,
            message: "userId, gameId, and gameName are required",
          },
          400,
        );
      }

      const item = await wishlistService.addGame(userId, gameId, gameName, imageUrl);
      if (!item) {
        return c.json({ success: false, message: "Game already in wishlist" }, 409);
      }
      return c.json({ success: true, data: item }, 201);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error adding game";
      return c.json({ success: false, message }, 500);
    }
  },

  async deleteGame(c: Context) {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ success: false, message: "id is required" }, 400);
      }
      await wishlistService.deleteGame(id);
      return c.json(
        { success: true, message: "Game deleted successfully" },
        200,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error deleting game";
      return c.json({ success: false, message }, 500);
    }
  },

  async getDistinctGames(c: Context) {
    try {
      const games = await wishlistService.getAllDistinctGames();
      return c.json({ success: true, data: games }, 200);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error fetching games";
      return c.json({ success: false, message }, 500);
    }
  },

  async updateGamePrices(c: Context) {
    try {
      const body = await c.req.json();
      const updates = body.updates || [];
      await wishlistService.updateGamePrices(updates);

      return c.json(
        {
          success: true as const,
          message: "Prices updated successfully",
        },
        200,
      );
    } catch (error) {
      console.error(error);
      return c.json(
        {
          success: false as const,
          message: "Failed to update prices",
        },
        500,
      );
    }
  },

  async getSubscribers(c: Context) {
    try {
      const body = await c.req.json();
      const gameNames = body.gameNames || [];
      const subscribers =
        await wishlistService.getSubscribersForGames(gameNames);

      return c.json(
        {
          success: true as const,
          data: subscribers,
        },
        200,
      );
    } catch (error) {
      console.error(error);
      return c.json(
        {
          success: false as const,
          message: "Failed to get subscribers",
        },
        500,
      );
    }
  },
};
