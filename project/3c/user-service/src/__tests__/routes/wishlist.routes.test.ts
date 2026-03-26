import { beforeEach, describe, expect, it, vi } from "vitest";

// Break the module chain before vitest tries to resolve the generated Prisma client
vi.mock("../../lib/prisma.js", () => ({ default: {} }));
vi.mock("../../lib/better-auth.js", () => ({ auth: { api: {} } }));

vi.mock("../../services/wishlist.service.js", () => ({
  wishlistService: {
    getWishlist: vi.fn(),
    addGame: vi.fn(),
    deleteGame: vi.fn(),
  },
}));

import app from "../../app.js";
import { wishlistService } from "../../services/wishlist.service.js";

const mockGame = {
  id: "game-entry-1",
  wishlistId: "user-1",
  gameId: "game-123",
  gameName: "The Witcher 3",
  addedAt: new Date("2024-06-01T00:00:00.000Z"),
};

const mockWishlist = {
  userId: "user-1",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  games: [mockGame],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /wishlist/", () => {
  it("returns 200 with wishlist data", async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(mockWishlist);

    const res = await app.request("/wishlist?userId=user-1", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.userId).toBe("user-1");
    expect(body.data.games).toHaveLength(1);
    expect(body.data.games[0].gameName).toBe("The Witcher 3");
  });
});

describe("POST /wishlist/", () => {
  it("returns 201 when game is added", async () => {
    vi.mocked(wishlistService.addGame).mockResolvedValue(mockGame);

    const res = await app.request("/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user-1",
        gameId: "game-123",
        gameName: "The Witcher 3",
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.gameId).toBe("game-123");
    expect(body.data.gameName).toBe("The Witcher 3");
  });
});

describe("DELETE /wishlist/:id", () => {
  it("returns 200 when game is removed", async () => {
    vi.mocked(wishlistService.deleteGame).mockResolvedValue(mockGame);

    const res = await app.request("/wishlist/game-entry-1", {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Game deleted successfully");
    expect(vi.mocked(wishlistService.deleteGame)).toHaveBeenCalledWith(
      "game-entry-1",
    );
  });
});
