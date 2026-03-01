import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, Package, Bell } from "lucide-react";

export default function RiderHome() {
  const { riders, toggleRiderOnline, orders, assignRider, currentRiderId, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const rider = riders.find(r => r.id === currentRiderId)!;

  const availableOrders = orders.filter(o => o.status === "preparing" && !o.riderId);
  const myActiveOrder = orders.find(o => o.riderId === currentRiderId && o.status !== "delivered");

  return (
    <div className="container py-6 max-w-lg mx-auto space-y-6">
      {/* Rider status */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold">{rider.name}</h2>
            <p className="text-sm text-muted-foreground">{rider.totalDeliveries} deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{rider.isOnline ? "Online" : "Offline"}</span>
            <Switch checked={rider.isOnline} onCheckedChange={() => toggleRiderOnline(currentRiderId)} />
          </div>
        </CardContent>
      </Card>

      {/* Active delivery */}
      {myActiveOrder && (
        <Card className="border-primary">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">Active Delivery</h3>
              <Badge>#{myActiveOrder.id}</Badge>
            </div>
            <p className="text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{myActiveOrder.address}</p>
            <p className="text-sm text-muted-foreground">{myActiveOrder.items.map(i => `${i.dishName} ×${i.quantity}`).join(", ")}</p>
            <div className="flex gap-2">
              {myActiveOrder.status === "out_for_delivery" && (
                <Button className="flex-1" onClick={() => {
                  updateOrderStatus(myActiveOrder.id, "delivered");
                }}>
                  Mark Delivered
                </Button>
              )}
              {myActiveOrder.status === "preparing" && (
                <Button className="flex-1" onClick={() => updateOrderStatus(myActiveOrder.id, "out_for_delivery")}>
                  Picked Up
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming orders */}
      {rider.isOnline && !myActiveOrder && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" /> Incoming Orders
          </h3>
          {availableOrders.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No orders available right now</CardContent></Card>
          ) : (
            availableOrders.map(order => (
              <Card key={order.id} className="border-warning/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">#{order.id}</span>
                    <span className="font-bold text-primary">₹{order.total}</span>
                  </div>
                  <p className="text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{order.address}</p>
                  <p className="text-sm text-muted-foreground">{order.items.map(i => `${i.dishName} ×${i.quantity}`).join(", ")}</p>
                  <Button className="w-full" onClick={() => assignRider(order.id, currentRiderId)}>
                    Accept Order
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {!rider.isOnline && (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Go online to receive orders</CardContent></Card>
      )}
    </div>
  );
}
