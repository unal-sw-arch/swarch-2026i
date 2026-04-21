import type { MenuProduct } from "@/features/products/types/products.types";

export const PRODUCTS_MOCK: MenuProduct[] = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    description: "Hamburguesa con queso, lechuga y tomate.",
    price: 12.5,
    isAvailable: true,
    restaurantId: 1,
  },
  {
    id: 2,
    name: "Ensalada de temporada",
    description: "Mix de hojas verdes, tomate cherry y vinagreta.",
    price: 7.2,
    isAvailable: false,
    restaurantId: 1,
  },
  {
    id: 3,
    name: "Limonada natural",
    description: "Bebida fresca con limón y menta.",
    price: 3.5,
    isAvailable: true,
    restaurantId: 1,
  },
];
