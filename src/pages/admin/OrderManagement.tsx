import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChefHat, Truck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant, useOrders } from "@/hooks/useRestaurantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STATUS_ACTIONS: Record<string, { label: string; next: string; icon: React.ReactNode }[]> = {
  pending: [
    { label: "Accept", next: "confirmed", icon: <Check className="h-4 w-4" /> },
    { label: "Reject", next: "rejected", icon: <X className="h-4 w-4" /> },
  ],
  confirmed: [{ label: "Start Preparing", next: "preparing", icon: <ChefHat className="h-4 w-4" /> }],
  preparing: [{ label: "Out for Delivery", next: "out_for_delivery", icon: <Truck className="h-4 w-4" /> }],
};

const statusColor: Record<string, string> = {
  pending: "destructive",
  confirmed: "default",
  preparing: "secondary",
  out_for_delivery: "default",
  delivered: "default",
  rejected: "destructive",
};

export default function OrderManagement() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);
  const { orders, loading, refetch } = useOrders(restaurantId);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else refetch();
  };

  if (rLoading || loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name} • {order.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <Badge variant={statusColor[order.status] as any} className="text-xs capitalize">
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.order_items?.map((item, i) => (
                  <span key={i}>{item.dish_name} ×{item.quantity}{i < (order.order_items?.length ?? 0) - 1 ? ", " : ""}</span>
                ))}
              </div>
              {STATUS_ACTIONS[order.status] && (
                <div className="flex gap-2">
                  {STATUS_ACTIONS[order.status].map(action => (
                    <Button
                      key={action.next}
                      size="sm"
                      variant={action.next === "rejected" ? "destructive" : "default"}
                      className="gap-1"
                      onClick={() => updateStatus(order.id, action.next)}
                    >
                      {action.icon} {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet</p>}
      </div>
    </div>
  );
}
