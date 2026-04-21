"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MenuItem } from "@/lib/types";

type CartItem = {
  menuItemId: number;
  restaurantId: number;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  activeRestaurantId: number | null;
  itemCount: number;
  subtotal: number;
  addItem: (restaurantId: number, item: MenuItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "customer-app-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const activeRestaurantId = items[0]?.restaurantId ?? null;
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.quantity * item.price, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      activeRestaurantId,
      itemCount,
      subtotal,
      addItem: (restaurantId, item) => {
        setItems((current) => {
          if (
            current.length > 0 &&
            current.some((cartItem) => cartItem.restaurantId !== restaurantId)
          ) {
            return [
              {
                menuItemId: item.id,
                restaurantId,
                name: item.name,
                price: item.price,
                quantity: 1,
              },
            ];
          }

          const existing = current.find((cartItem) => cartItem.menuItemId === item.id);
          if (!existing) {
            return [
              ...current,
              {
                menuItemId: item.id,
                restaurantId,
                name: item.name,
                price: item.price,
                quantity: 1,
              },
            ];
          }

          return current.map((cartItem) =>
            cartItem.menuItemId === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          );
        });
      },
      removeItem: (menuItemId) => {
        setItems((current) =>
          current.filter((cartItem) => cartItem.menuItemId !== menuItemId),
        );
      },
      updateQuantity: (menuItemId, quantity) => {
        setItems((current) =>
          current
            .map((cartItem) =>
              cartItem.menuItemId === menuItemId
                ? { ...cartItem, quantity }
                : cartItem,
            )
            .filter((cartItem) => cartItem.quantity > 0),
        );
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [activeRestaurantId, itemCount, items, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
