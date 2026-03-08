import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useApp();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOrder = async () => {
    if (!name || !phone || !address) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in to place an order", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    // Get restaurant_id from the first cart item
    const restaurantId = cart[0]?.dish.restaurant_id;
    if (!restaurantId) {
      toast({ title: "Error: no restaurant found", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        customer_id: user.id,
        customer_name: name,
        customer_phone: phone,
        address,
        total: cartTotal + 40,
        status: "confirmed",
      })
      .select()
      .single();

    if (error || !order) {
      toast({ title: "Failed to place order", description: error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Insert order items
    const items = cart.map(i => ({
      order_id: order.id,
      dish_name: i.dish.name,
      quantity: i.quantity,
      price: i.dish.price,
    }));

    await supabase.from("order_items").insert(items);

    clearCart();
    toast({ title: "Order placed! 🎉", description: `Your order is confirmed.` });
    navigate(`/track/${order.id}`);
    setSubmitting(false);
  };

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Checkout</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Delivery Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Delivery Address</Label>
            <Textarea placeholder="Full address with landmark" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {cart.map(i => (
            <div key={i.dish.id} className="flex justify-between text-sm">
              <span>{i.dish.name} × {i.quantity}</span>
              <span>₹{i.dish.price * i.quantity}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>₹40</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{cartTotal + 40}</span></div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleOrder} disabled={submitting}>
        {submitting ? "Placing Order..." : `Pay ₹${cartTotal + 40} with Razorpay`}
      </Button>
      <p className="text-xs text-center text-muted-foreground">Mock payment — no real transaction</p>
    </div>
  );
}
