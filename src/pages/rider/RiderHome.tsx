import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { DbOrder } from "@/hooks/useRestaurantData";

export default function RiderHome() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [myOrder, setMyOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    // Get available orders (preparing, no rider) and my assigned orders
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`and(status.eq.preparing,rider_id.is.null),rider_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const all = (data as DbOrder[]) ?? [];
    setMyOrder(all.find(o => o.rider_id === user.id && o.status !== "delivered") ?? null);
    setOrders(all.filter(o => !o.rider_id && o.status === "preparing"));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("rider-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase.from("orders")
      .update({ rider_id: user.id, status: "out_for_delivery" })
      .eq("id", orderId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchOrders();
  };

  const markDelivered = async (orderId: string) => {
    await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
    fetchOrders();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-6 max-w-lg mx-auto space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-display font-bold">{profile?.display_name ?? "Rider"}</h2>
          <p className="text-sm text-muted-foreground">Delivery Partner</p>
        </CardContent>
      </Card>

      {myOrder && (
        <Card className="border-primary">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">Active Delivery</h3>
              <Badge>#{myOrder.id.slice(0, 8)}</Badge>
            </div>
            <p className="text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{myOrder.address}</p>
            <p className="text-sm text-muted-foreground">
              {myOrder.order_items?.map(i => `${i.dish_name} ×${i.quantity}`).join(", ")}
            </p>
            {myOrder.status === "out_for_delivery" && (
              <Button className="w-full" onClick={() => markDelivered(myOrder.id)}>Mark Delivered</Button>
            )}
          </CardContent>
        </Card>
      )}

      {!myOrder && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" /> Available Orders
          </h3>
          {orders.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No orders available right now</CardContent></Card>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="border-warning/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">#{order.id.slice(0, 8)}</span>
                    <span className="font-bold text-primary">₹{order.total}</span>
                  </div>
                  <p className="text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{order.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.map(i => `${i.dish_name} ×${i.quantity}`).join(", ")}
                  </p>
                  <Button className="w-full" onClick={() => acceptOrder(order.id)}>Accept Order</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
