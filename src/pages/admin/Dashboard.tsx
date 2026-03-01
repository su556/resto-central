import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, DollarSign, Truck, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { orders, riders } = useApp();

  const todayOrders = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const activeRiders = riders.filter(r => r.isOnline).length;
  const pending = orders.filter(o => o.status === "pending").length;

  const stats = [
    { label: "Today's Orders", value: todayOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${revenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Active Riders", value: activeRiders, icon: Truck, color: "text-warning" },
    { label: "Pending", value: pending, icon: TrendingUp, color: "text-destructive" },
  ];

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent orders */}
      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold text-sm">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName} • {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{order.total}</p>
                  <Badge variant={order.status === "delivered" ? "default" : order.status === "pending" ? "destructive" : "secondary"} className="text-xs">
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
