import { wishlistRepository } from "../repositories/wishlist.repository.js";

export const wishlistService = {
  getWishlist(userId: string) {
    return wishlistRepository.findByUserId(userId);
  },

  addGame(userId: string, gameId: string, gameName: string, imageUrl?: string) {
    return wishlistRepository.addGame(userId, gameId, gameName, imageUrl);
  },

  deleteGame(id: string) {
    return wishlistRepository.deleteGameById(id);
  },

  getAllDistinctGames() {
    return wishlistRepository.getAllDistinctGames();
  },

  updateGamePrices(
    updates: Array<{
      gameName: string;
      priceCents: number | null;
      originalPriceCents: number | null;
      currency: string | null;
      store: string | null;
      imageUrl?: string | null;
    }>,
  ) {
    return Promise.all(
      updates.map((update) =>
        wishlistRepository.updateGamePrices(
          update.gameName,
          update.priceCents,
          update.originalPriceCents,
          update.currency,
          update.store,
          update.imageUrl,
        ),
      ),
    );
  },

  getSubscribersForGames(gameNames: string[]) {
    return wishlistRepository.getSubscribersForGames(gameNames);
  },
};
