import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Package } from "lucide-react";

export default function AdminRiders() {
  const { riders, orders } = useApp();

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Riders</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {riders.map(rider => {
          const currentOrder = orders.find(o => o.id === rider.currentOrderId);
          return (
            <Card key={rider.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted"><User className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-semibold">{rider.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{rider.phone}</p>
                    </div>
                  </div>
                  <Badge variant={rider.isOnline ? "default" : "secondary"}>{rider.isOnline ? "Online" : "Offline"}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {rider.totalDeliveries} deliveries</span>
                  {currentOrder && <Badge variant="outline">On delivery: #{currentOrder.id}</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
