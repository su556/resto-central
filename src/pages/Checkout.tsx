import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
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
  const [step, setStep] = useState<"details" | "paying">("details");

  const deliveryFee = 40;
  const grandTotal = cartTotal + deliveryFee;

  const handlePay = async () => {
    if (!name || !phone || !address) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Please sign in to place an order", variant: "destructive" });
      navigate("/auth");
      return;
    }
    const restaurantId = cart[0]?.dish.restaurant_id;
    if (!restaurantId) {
      toast({ title: "Error: no restaurant found", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setStep("paying");

    try {
      // Step 1: Create order via edge function
      const { data: createData, error: createError } = await supabase.functions.invoke("create-order", {
        body: {
          restaurant_id: restaurantId,
          customer_name: name,
          customer_phone: phone,
          address,
          total: grandTotal,
          items: cart.map((i) => ({
            dish_name: i.dish.name,
            quantity: i.quantity,
            price: i.dish.price,
          })),
        },
      });

      if (createError || !createData?.order_id) {
        throw new Error(createData?.error || createError?.message || "Failed to create order");
      }

      const { order_id, razorpay_order_id, razorpay_key_id, is_live, amount } = createData;

      if (is_live && razorpay_key_id) {
        // Real Razorpay checkout
        await openRazorpayCheckout({
          key: razorpay_key_id,
          amount,
          order_id: razorpay_order_id,
          db_order_id: order_id,
          prefill: { name, contact: phone },
        });
      } else {
        // Mock payment flow — simulate 2s delay
        await new Promise((r) => setTimeout(r, 2000));

        // Verify/confirm the order
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
          body: {
            order_id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_order_id,
          },
        });

        if (verifyError || !verifyData?.success) {
          throw new Error(verifyData?.error || "Payment verification failed");
        }

        clearCart();
        toast({ title: "Order placed! 🎉", description: "Your order is confirmed." });
        navigate(`/track/${order_id}`);
      }
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
      setStep("details");
    } finally {
      setSubmitting(false);
    }
  };

  const openRazorpayCheckout = ({ key, amount, order_id, db_order_id, prefill }: any) => {
    return new Promise<void>((resolve, reject) => {
      const options = {
        key,
        amount,
        currency: "INR",
        name: "Spice Garden",
        description: "Food Order",
        order_id,
        prefill,
        handler: async (response: any) => {
          try {
            const { data, error } = await supabase.functions.invoke("verify-payment", {
              body: {
                order_id: db_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            if (error || !data?.success) {
              reject(new Error("Verification failed"));
              return;
            }
            clearCart();
            toast({ title: "Payment successful! 🎉" });
            navigate(`/track/${db_order_id}`);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button variant="link" onClick={() => navigate("/menu")}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Checkout</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Delivery Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label>Delivery Address</Label>
            <Textarea placeholder="Full address with landmark" value={address} onChange={(e) => setAddress(e.target.value)} disabled={submitting} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {cart.map((i) => (
            <div key={i.dish.id} className="flex justify-between text-sm">
              <span>{i.dish.name} × {i.quantity}</span>
              <span>₹{i.dish.price * i.quantity}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>₹{deliveryFee}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-2" size="lg" onClick={handlePay} disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {step === "paying" ? "Processing Payment..." : "Creating Order..."}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ₹{grandTotal}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Secured by Razorpay • Mock mode (no real charge)</span>
      </div>
    </div>
  );
}
