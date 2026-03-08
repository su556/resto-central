import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, DollarSign, Truck, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant, useOrders } from "@/hooks/useRestaurantData";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);
  const { orders, loading: oLoading } = useOrders(restaurantId);

  if (rLoading || oLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!restaurantId) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-display font-bold">No Restaurant Assigned</h1>
        <p className="text-muted-foreground mt-2">A super admin needs to assign you to a restaurant first.</p>
      </div>
    );
  }

  const todayOrders = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "pending").length;

  const stats = [
    { label: "Total Orders", value: todayOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Pending", value: pending, icon: TrendingUp, color: "text-destructive" },
  ];

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold text-sm">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_name} • {order.order_items?.length ?? 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{order.total}</p>
                  <Badge variant={order.status === "delivered" ? "default" : order.status === "pending" ? "destructive" : "secondary"} className="text-xs">
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-muted-foreground py-4">No orders yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
