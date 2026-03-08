import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ChefHat, Truck, PartyPopper, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DbOrder } from "@/hooks/useRestaurantData";

const STEPS = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PartyPopper },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!orderId) return;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    setOrder(data as DbOrder | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, () => {
        fetchOrder();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!order) {
    return <div className="container py-16 text-center"><h2 className="text-2xl font-display">Order not found</h2></div>;
  }

  const currentStepIdx = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Track Order</h1>
        <Badge variant="secondary" className="text-sm">#{order.id.slice(0, 8)}</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const isCompleted = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors ${
                    isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  } ${isCurrent ? "animate-pulse-soft ring-2 ring-primary/30" : ""}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    {isCurrent && <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> In progress...</p>}
                  </div>
                  {isCompleted && !isCurrent && <CheckCircle2 className="h-5 w-5 text-success" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {order.order_items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.dish_name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span><span>₹{order.total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
