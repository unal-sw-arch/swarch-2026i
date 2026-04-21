import prisma from "../lib/prisma.js";

export const wishlistRepository = {
  async findByUserId(userId: string) {
    return prisma.wishlist.findUnique({
      where: { userId },
      include: {
        games: {
          orderBy: { addedAt: "desc" },
        },
      },
    });
  },

  async addGame(userId: string, gameId: string, gameName: string, imageUrl?: string) {
    await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Verifica si el juego ya está en la wishlist
    const existing = await prisma.game.findFirst({
      where: {
        wishlistId: userId,
        gameId,
      },
    });
    if (existing) {
      // Si ya existe, retorna null para que el controlador devuelva 409
      return null;
    }

    // Si no existe, lo crea
    return prisma.game.create({
      data: {
        wishlistId: userId,
        gameId,
        gameName,
        imageUrl: imageUrl ?? null,
      },
    });
  },

  deleteGameById(id: string) {
    return prisma.game.delete({
      where: { id },
    });
  },

  async getAllDistinctGames() {
    const games = await prisma.game.findMany({
      select: { gameName: true },
      distinct: ["gameName"],
    });
    return games.map((g) => g.gameName);
  },

  async updateGamePrices(
    gameName: string,
    priceCents: number | null,
    originalPriceCents: number | null,
    currency: string | null,
    store: string | null,
    imageUrl?: string | null,
  ) {
    return prisma.game.updateMany({
      where: { gameName },
      data: {
        priceCents,
        originalPriceCents,
        currency,
        store,
        imageUrl: imageUrl ?? null,
      },
    });
  },

  async getSubscribersForGames(gameNames: string[]) {
    const games = await prisma.game.findMany({
      where: { gameName: { in: gameNames } },
      include: {
        wishlist: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const result: Record<
      string,
      { id: string; name: string; email: string }[]
    > = {};
    for (const name of gameNames) {
      result[name] = [];
    }

    for (const game of games) {
      if (game.wishlist && game.wishlist.user) {
        // Ensure no duplicate users for the same game
        if (
          !result[game.gameName].some((u) => u.id === game.wishlist.user.id)
        ) {
          result[game.gameName].push(game.wishlist.user);
        }
      }
    }

    return result;
  },
};
