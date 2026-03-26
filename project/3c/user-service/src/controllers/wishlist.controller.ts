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
      const { userId, gameId, gameName } = body as {
        userId?: string;
        gameId?: string;
        gameName?: string;
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

      const item = await wishlistService.addGame(userId, gameId, gameName);
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
};
