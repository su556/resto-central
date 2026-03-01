import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Percent, Truck } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/offers", label: "Offers", icon: Percent },
  { to: "/admin/riders", label: "Riders", icon: Truck },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card p-4 gap-1">
        {NAV.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}>
              <Button variant={active ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex justify-around p-2">
        {NAV.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-0.5">
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
