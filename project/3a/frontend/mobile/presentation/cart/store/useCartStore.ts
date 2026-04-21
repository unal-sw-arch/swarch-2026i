import type { MenuItem } from '@/core/menu/interface/menu';
import { create } from 'zustand';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addItem: (menuItem: MenuItem, restaurantId: number, restaurantName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  addItem: (menuItem, restaurantId, restaurantName) => {
    const { items, restaurantId: currentRestaurantId } = get();

    // If adding from a different restaurant, clear cart first
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      set({ items: [], restaurantId: null, restaurantName: null });
    }

    const existingIndex = items.findIndex((i) => i.menuItem.id === menuItem.id);

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      set({ items: updated, restaurantId, restaurantName });
    } else {
      set({
        items: [...items, { menuItem, quantity: 1, restaurantId, restaurantName }],
        restaurantId,
        restaurantName,
      });
    }
  },

  removeItem: (menuItemId) => {
    const filtered = get().items.filter((i) => i.menuItem.id !== menuItemId);
    if (filtered.length === 0) {
      set({ items: [], restaurantId: null, restaurantName: null });
    } else {
      set({ items: filtered });
    }
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    const updated = get().items.map((i) =>
      i.menuItem.id === menuItemId ? { ...i, quantity } : i
    );
    set({ items: updated });
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
