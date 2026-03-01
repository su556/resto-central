import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, Dish, Order, Rider, Offer, INITIAL_ORDERS, INITIAL_RIDERS, INITIAL_OFFERS } from "@/data/mockData";

export type UserRole = "customer" | "admin" | "rider";

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  cart: CartItem[];
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  addOrder: (order: Order) => void;
  riders: Rider[];
  toggleRiderOnline: (riderId: string) => void;
  assignRider: (orderId: string, riderId: string) => void;
  offers: Offer[];
  addOffer: (offer: Offer) => void;
  toggleOffer: (offerId: string) => void;
  deleteOffer: (offerId: string) => void;
  // Rider-specific
  currentRiderId: string;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("customer");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const currentRiderId = "r1"; // Mock logged-in rider

  const addToCart = useCallback((dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id);
      if (existing) return prev.map(i => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { dish, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    setCart(prev => prev.filter(i => i.dish.id !== dishId));
  }, []);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    if (quantity <= 0) { setCart(prev => prev.filter(i => i.dish.id !== dishId)); return; }
    setCart(prev => prev.map(i => i.dish.id === dishId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const toggleRiderOnline = useCallback((riderId: string) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, isOnline: !r.isOnline } : r));
  }, []);

  const assignRider = useCallback((orderId: string, riderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, riderId, status: "out_for_delivery" as const } : o));
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, currentOrderId: orderId } : r));
  }, []);

  const addOffer = useCallback((offer: Offer) => setOffers(prev => [offer, ...prev]), []);
  const toggleOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, isActive: !o.isActive } : o));
  }, []);
  const deleteOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
  }, []);

  return (
    <AppContext.Provider value={{
      role, setRole, cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      orders, updateOrderStatus, addOrder, riders, toggleRiderOnline, assignRider,
      offers, addOffer, toggleOffer, deleteOffer, currentRiderId,
    }}>
      {children}
    </AppContext.Provider>
  );
};
