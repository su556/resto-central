import { Link, useLocation } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { ShoppingCart, UtensilsCrossed, Truck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT } from "@/data/mockData";

const ROLES: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: "customer", label: "Customer", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { value: "admin", label: "Admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { value: "rider", label: "Rider", icon: <Truck className="h-4 w-4" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, cartCount } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-primary">🍛 {RESTAURANT.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Role switcher */}
            <div className="flex rounded-lg border bg-muted p-0.5 gap-0.5">
              {ROLES.map(r => (
                <Button
                  key={r.value}
                  variant={role === r.value ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setRole(r.value)}
                >
                  {r.icon}
                  <span className="hidden sm:inline">{r.label}</span>
                </Button>
              ))}
            </div>

            {/* Cart for customer */}
            {role === "customer" && (
              <Link to="/cart">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
