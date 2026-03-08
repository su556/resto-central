import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ChevronRight, Loader2, Phone } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useDefaultRestaurant, useDishes } from "@/hooks/useRestaurantData";

export default function Landing() {
  const { addToCart } = useApp();
  const { restaurant, loading: rLoading } = useDefaultRestaurant();
  const { dishes, loading: dLoading } = useDishes(restaurant?.id ?? null);
  const featured = dishes.filter(d => d.is_popular);

  const getOpenStatus = () => {
    const hours = (restaurant as any)?.operating_hours;
    if (!hours) return null;
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const dayHours = hours[day];
    if (!dayHours || dayHours.is_closed) return { isOpen: false, label: "Closed Today" };
    const [openH, openM] = dayHours.open.split(":").map(Number);
    const [closeH, closeM] = dayHours.close.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    if (mins >= openMins && mins < closeMins) return { isOpen: true, label: `Open · Closes at ${dayHours.close}` };
    return { isOpen: false, label: mins < openMins ? `Opens at ${dayHours.open}` : "Closed Now" };
  };
  const openStatus = getOpenStatus();

  if (rLoading || dLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!restaurant) {
    return <div className="container py-16 text-center"><p className="text-muted-foreground">No restaurant found.</p></div>;
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary to-background py-16 md:py-24">
        <div className="container text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            <Star className="h-3.5 w-3.5 mr-1 fill-warning text-warning" />
            {restaurant.rating} • {restaurant.review_count.toLocaleString()} reviews
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
            {restaurant.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {restaurant.tagline}
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

      <section className="container py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-display font-bold">Popular Dishes</h2>
          <Link to="/menu"><Button variant="ghost" className="gap-1">View All <ChevronRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(dish => (
            <Card key={dish.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img src={dish.image_url || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-sm border ${dish.is_veg ? "border-success bg-success/20" : "border-destructive bg-destructive/20"}`} />
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

      <section className="bg-card border-t">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">About Us</h2>
              <p className="text-muted-foreground">{restaurant.description}</p>
              {restaurant.address && (
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  {restaurant.phone}
                </p>
              )}
            </div>

            {(restaurant as any).operating_hours && (
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Hours
                </h2>
                <div className="space-y-2">
                  {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => {
                    const hours = ((restaurant as any).operating_hours as Record<string, { open: string; close: string; is_closed: boolean }>)[day];
                    if (!hours) return null;
                    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                    const isToday = today === day;
                    return (
                      <div key={day} className={`flex justify-between text-sm py-1.5 px-3 rounded-md ${isToday ? "bg-primary/10 font-semibold" : ""}`}>
                        <span className="capitalize">{day}</span>
                        <span className={hours.is_closed ? "text-destructive" : "text-muted-foreground"}>
                          {hours.is_closed ? "Closed" : `${hours.open} – ${hours.close}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
