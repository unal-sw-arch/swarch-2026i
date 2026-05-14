import type { CatalogRepository } from "@/services/repositories/catalog.repository";
import { PRODUCTS_MOCK } from "@/mocks/data/products.mock";
import type { MenuProduct } from "@/features/products/types/products.types";

const catalogStore: MenuProduct[] = PRODUCTS_MOCK.map((product) => ({ ...product }));

function delay(ms = 350) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export const catalogMockRepository: CatalogRepository = {
  async getRestaurantMenu(restaurantId) {
    await delay();

    return catalogStore.filter((product) => product.restaurantId === restaurantId).map((product) => ({ ...product }));
  },
  async updateAvailability(productId, payload) {
    await delay();

    const product = catalogStore.find((entry) => entry.id === productId);

    if (!product) {
      throw new Error("No se encontró el producto para actualizar disponibilidad.");
    }

    product.isAvailable = payload.isAvailable;

    return {
      id: product.id,
      isAvailable: product.isAvailable,
      message: "Disponibilidad actualizada correctamente.",
    };
  },
};
