import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, Order } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  deliveryFee: number;
  tax: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('supercart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponPercent, setCouponPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('supercart_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to store cart in localStorage', e);
    }
  }, [items]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock || 99) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponPercent(0);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SUPERCART20' || clean === 'FRESH20') {
      setAppliedCoupon(clean);
      setCouponPercent(20);
      return { success: true, message: '20% Super Saver discount applied!' };
    }
    if (clean === 'FRESH10') {
      setAppliedCoupon(clean);
      setCouponPercent(10);
      return { success: true, message: '10% Grocery discount applied!' };
    }
    if (clean === 'FREESHIP') {
      setAppliedCoupon(clean);
      setCouponPercent(0); // special delivery deduction
      return { success: true, message: 'Free Express Delivery unlocked!' };
    }
    return { success: false, message: 'Invalid promo code. Try "SUPERCART20" or "FREESHIP".' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponPercent(0);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Delivery logic: Free over ₹299 or if FREESHIP coupon
  const baseDeliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 29;
  const deliveryFee = appliedCoupon === 'FREESHIP' ? 0 : baseDeliveryFee;
  
  const discount = Math.round((subtotal * couponPercent) / 100);
  const tax = Number(((subtotal - discount) * 0.05).toFixed(2));
  const total = Number((Math.max(0, subtotal - discount) + deliveryFee + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        deliveryFee,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
        activeOrder,
        setActiveOrder,
        isTrackingOpen,
        setIsTrackingOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
