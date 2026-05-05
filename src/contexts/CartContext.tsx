"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Painting } from "@/lib/mockData";

export interface CartItem extends Painting {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (painting: Painting) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartCount: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("monetbox_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("monetbox_cart", JSON.stringify(newCart));
  };

  const addToCart = (painting: Painting) => {
    const exists = cart.find((item) => item.id === painting.id);
    if (!exists) {
      saveCart([...cart, { ...painting, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
