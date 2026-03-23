import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const DELIVERY_FEE = 40;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { restaurant_id, customer_name, customer_phone, address, items } = await req.json();

    // Server-side input validation
    if (!restaurant_id || !customer_name || !customer_phone || !address || !items?.length) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof customer_name !== "string" || customer_name.trim().length === 0 || customer_name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name (max 100 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!PHONE_REGEX.test(customer_phone.trim())) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof address !== "string" || address.trim().length === 0 || address.trim().length > 300) {
      return new Response(JSON.stringify({ error: "Invalid address (max 300 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract dish IDs and look up authoritative prices from DB
    const dishIds = items.map((i: any) => i.dish_id).filter(Boolean);
    if (dishIds.length === 0 || dishIds.length !== items.length) {
      return new Response(JSON.stringify({ error: "All items must include a valid dish_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: dishes, error: dishError } = await supabase
      .from("dishes")
      .select("id, name, price, is_available, restaurant_id")
      .in("id", dishIds)
      .eq("restaurant_id", restaurant_id);

    if (dishError || !dishes || dishes.length !== dishIds.length) {
      return new Response(JSON.stringify({ error: "One or more dishes not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check availability and build price map
    const priceMap = new Map<string, { price: number; name: string }>();
    for (const dish of dishes) {
      if (!dish.is_available) {
        return new Response(JSON.stringify({ error: `"${dish.name}" is currently unavailable` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      priceMap.set(dish.id, { price: dish.price, name: dish.name });
    }

    // Calculate server-side total
    let subtotal = 0;
    const orderItems: { dish_name: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const dish = priceMap.get(item.dish_id)!;
      subtotal += dish.price * quantity;
      orderItems.push({ dish_name: dish.name, quantity, price: dish.price });
    }

    const total = subtotal + DELIVERY_FEE;

    // Check if RAZORPAY_KEY_SECRET is set for real payment
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const isLive = !!(razorpaySecret && razorpayKeyId);

    let razorpayOrderId: string | null = null;

    if (isLive) {
      const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpaySecret}`),
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });
      const rpData = await rpRes.json();
      if (!rpRes.ok) {
        return new Response(JSON.stringify({ error: "Razorpay order creation failed", details: rpData }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      razorpayOrderId = rpData.id;
    } else {
      razorpayOrderId = `mock_order_${Date.now()}`;
    }

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id,
        customer_id: user.id,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        address: address.trim(),
        total,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert order items
    await supabase.from("order_items").insert(
      orderItems.map((i) => ({ order_id: order.id, ...i }))
    );

    return new Response(
      JSON.stringify({
        order_id: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_key_id: razorpayKeyId || null,
        is_live: isLive,
        amount: Math.round(total * 100),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
