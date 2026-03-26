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

  async addGame(userId: string, gameId: string, gameName: string) {
    await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return prisma.game.create({
      data: {
        wishlistId: userId,
        gameId,
        gameName,
      },
    });
  },

  deleteGameById(id: string) {
    return prisma.game.delete({
      where: { id },
    });
  },
};
