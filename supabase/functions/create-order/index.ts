import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { restaurant_id, customer_name, customer_phone, address, total, items } = await req.json();

    if (!restaurant_id || !customer_name || !customer_phone || !address || !total || !items?.length) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if RAZORPAY_KEY_SECRET is set for real payment
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const isLive = !!(razorpaySecret && razorpayKeyId);

    let razorpayOrderId: string | null = null;

    if (isLive) {
      // Create real Razorpay order
      const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpaySecret}`),
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // paise
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
      // Mock order ID
      razorpayOrderId = `mock_order_${Date.now()}`;
    }

    // Create order in DB with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id,
        customer_id: user.id,
        customer_name,
        customer_phone,
        address,
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
    const orderItems = items.map((i: any) => ({
      order_id: order.id,
      dish_name: i.dish_name,
      quantity: i.quantity,
      price: i.price,
    }));
    await supabase.from("order_items").insert(orderItems);

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
