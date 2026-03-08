import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT } from "@/data/mockData";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, cartCount } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setRole("customer")}>
            <span className="text-xl font-display font-bold text-primary">🍛 {RESTAURANT.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Show logout for admin/rider to return to customer view */}
            {role !== "customer" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setRole("customer")}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Exit {role === "admin" ? "Admin" : "Rider"}</span>
              </Button>
            )}

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
