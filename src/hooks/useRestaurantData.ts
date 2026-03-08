import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbDish {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_veg: boolean;
  is_popular: boolean;
  rating: number;
  is_available: boolean;
}

export interface DbRestaurant {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  image_url: string | null;
}

export interface DbOffer {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  discount_percent: number;
  min_order: number;
  is_active: boolean;
  valid_until: string | null;
}

export interface DbOrder {
  id: string;
  restaurant_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  address: string;
  total: number;
  status: string;
  rider_id: string | null;
  created_at: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  dish_name: string;
  quantity: number;
  price: number;
}

// Fetch first restaurant (single-restaurant mode)
export function useDefaultRestaurant() {
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("restaurants")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        setRestaurant(data as DbRestaurant | null);
        setLoading(false);
      });
  }, []);

  return { restaurant, loading };
}

// Fetch dishes for a restaurant
export function useDishes(restaurantId: string | null) {
  const [dishes, setDishes] = useState<DbDish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data } = await supabase
      .from("dishes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category", { ascending: true });
    setDishes((data as DbDish[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurantId]);

  return { dishes, loading, refetch: fetchDishes };
}

// Fetch offers for a restaurant
export function useOffers(restaurantId: string | null) {
  const [offers, setOffers] = useState<DbOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    setOffers((data as DbOffer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, [restaurantId]);

  return { offers, loading, refetch: fetchOffers };
}

// Fetch orders for a restaurant (admin) or for customer
export function useOrders(restaurantId?: string | null) {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, order_items(*)") 
      .order("created_at", { ascending: false });

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data } = await query;
    setOrders((data as DbOrder[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  // Realtime subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  return { orders, loading, refetch: fetchOrders };
}

// Admin's restaurant
export function useMyRestaurant(userId: string | null) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("restaurant_admins")
      .select("restaurant_id")
      .eq("user_id", userId)
      .limit(1)
      .single()
      .then(({ data }) => {
        setRestaurantId(data?.restaurant_id ?? null);
        setLoading(false);
      });
  }, [userId]);

  return { restaurantId, loading };
}
