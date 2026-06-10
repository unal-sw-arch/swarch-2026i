import { createContext, useContext, useState, type ReactNode } from 'react';
import type { OrderItemState, MenuItem } from '../types';

interface CartContextType {
    cart: OrderItemState[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, delta: number) => void;
    clearCart: () => void;
    cartTotalElements: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<OrderItemState[]>([]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(p => p.menuItemId === item.id);
            if (existing) {
                return prev.map(p => p.menuItemId === item.id
                    ? { ...p, quantity: p.quantity + 1 }
                    : p
                );
            }
            return [...prev, { menuItemId: item.id, quantity: 1, productName: item.name, unitPrice: item.price }];
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => prev.filter(p => p.menuItemId !== itemId));
    };

    const updateQuantity = (itemId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.menuItemId === itemId) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const cartTotalElements = cart.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotalElements }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
