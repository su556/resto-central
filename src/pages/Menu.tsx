import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Search, Plus, Minus } from "lucide-react";
import { DISHES, CATEGORIES } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";

export default function Menu() {
  const { cart, addToCart, updateQuantity } = useApp();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = DISHES.filter(d => {
    const matchCat = category === "All" || d.category === category;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCartQty = (dishId: string) => cart.find(i => i.dish.id === dishId)?.quantity || 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-display font-bold">Our Menu</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search dishes..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)} className="shrink-0">
            {cat}
          </Button>
        ))}
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(dish => {
          const qty = getCartQty(dish.id);
          return (
            <Card key={dish.id} className="overflow-hidden">
              <div className="aspect-video overflow-hidden relative">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                {dish.isPopular && (
                  <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">Popular</Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-sm border shrink-0 ${dish.isVeg ? "border-success bg-success/20" : "border-destructive bg-destructive/20"}`} />
                  <h3 className="font-semibold font-display text-lg">{dish.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {dish.rating}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">₹{dish.price}</span>
                  {qty === 0 ? (
                    <Button size="sm" onClick={() => addToCart(dish)} className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(dish.id, qty - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center font-semibold">{qty}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(dish.id, qty + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
