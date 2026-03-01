import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChefHat, Truck } from "lucide-react";
import type { Order } from "@/data/mockData";

const STATUS_ACTIONS: Record<string, { label: string; next: Order["status"]; icon: React.ReactNode }[]> = {
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
  const { orders, updateOrderStatus } = useApp();

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">#{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName} • {order.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <Badge variant={statusColor[order.status] as any} className="text-xs capitalize">
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.items.map((item, i) => (
                  <span key={i}>{item.dishName} ×{item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
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
                      onClick={() => updateOrderStatus(order.id, action.next)}
                    >
                      {action.icon} {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
