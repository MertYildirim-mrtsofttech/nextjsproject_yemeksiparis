// components/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);
  
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  
  const addToCart = (item) => {
    setCart((prevCart) => {
      
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity || 1;
        return updatedCart;
      } else {
        
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };
  
  
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };
  
  
  const updateQuantity = (itemId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== itemId);
      }
      
      return prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };
  
  
  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  };
  
  
  const clearCart = () => {
    setCart([]);
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalAmount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}