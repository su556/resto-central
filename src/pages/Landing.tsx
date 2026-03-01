import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ChevronRight } from "lucide-react";
import { RESTAURANT, DISHES } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";

export default function Landing() {
  const { addToCart } = useApp();
  const featured = DISHES.filter(d => d.isPopular);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary to-background py-16 md:py-24">
        <div className="container text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            <Star className="h-3.5 w-3.5 mr-1 fill-warning text-warning" />
            {RESTAURANT.rating} • {RESTAURANT.reviewCount.toLocaleString()} reviews
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
            {RESTAURANT.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {RESTAURANT.tagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/menu">
              <Button size="lg" className="text-base px-8 gap-2">
                Order Now <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 30-45 min</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> 5 km</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="container py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-display font-bold">Popular Dishes</h2>
          <Link to="/menu">
            <Button variant="ghost" className="gap-1">View All <ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(dish => (
            <Card key={dish.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-sm border ${dish.isVeg ? "border-success bg-success/20" : "border-destructive bg-destructive/20"}`} />
                      <h3 className="font-semibold font-display">{dish.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dish.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold">₹{dish.price}</span>
                  <Button size="sm" onClick={() => addToCart(dish)}>Add</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-card border-t">
        <div className="container py-12 space-y-4 text-center">
          <h2 className="text-2xl font-display font-bold">About Us</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{RESTAURANT.description}</p>
          <p className="text-sm text-muted-foreground">{RESTAURANT.address} • {RESTAURANT.phone}</p>
        </div>
      </section>
    </div>
  );
}
