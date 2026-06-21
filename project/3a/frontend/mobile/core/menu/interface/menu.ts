export type MenuCategoryType =
  | 'ENTRADA'
  | 'PLATO'
  | 'POSTRE'
  | 'BEBIDA'
  | 'ENSALADA'
  | 'ADICIONAL';

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: number;
  category: MenuCategoryType;
  items: MenuItem[];
}
