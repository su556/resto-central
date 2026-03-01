import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h2 className="text-2xl font-display font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some delicious dishes from our menu!</p>
        <Link to="/menu"><Button>Browse Menu</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Your Cart</h1>
      <div className="space-y-3">
        {cart.map(item => (
          <Card key={item.dish.id}>
            <CardContent className="p-4 flex gap-4">
              <img src={item.dish.image} alt={item.dish.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{item.dish.name}</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.dish.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">₹{item.dish.price} each</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-bold">₹{item.dish.price * item.quantity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>₹40</span></div>
        <Separator />
        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{cartTotal + 40}</span></div>
      </div>

      <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
        Proceed to Checkout
      </Button>
    </div>
  );
}
