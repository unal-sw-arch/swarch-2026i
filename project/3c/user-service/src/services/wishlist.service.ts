import { wishlistRepository } from "../repositories/wishlist.repository.js";

export const wishlistService = {
  getWishlist(userId: string) {
    return wishlistRepository.findByUserId(userId);
  },

  addGame(userId: string, gameId: string, gameName: string) {
    return wishlistRepository.addGame(userId, gameId, gameName);
  },

  deleteGame(id: string) {
    return wishlistRepository.deleteGameById(id);
  },
};
