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
    const { firebase_token, phone, display_name, role } = await req.json();

    if (!firebase_token || !phone) {
      return new Response(
        JSON.stringify({ error: "firebase_token and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Firebase token using Google's public token info endpoint
    const verifyRes = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: firebase_token }),
      }
    );

    if (!verifyRes.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid Firebase token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifyData = await verifyRes.json();
    const firebaseUser = verifyData.users?.[0];
    if (!firebaseUser || firebaseUser.phoneNumber !== phone) {
      return new Response(
        JSON.stringify({ error: "Phone number mismatch" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to manage Supabase users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user with this phone already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with phone
      const email = `${phone.replace(/\+/g, "")}@phone.local`;
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          phone,
          email,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            display_name: display_name || phone,
            role: role || "customer",
          },
        });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Generate a session for the user
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: existingUser?.email || `${phone.replace(/\+/g, "")}@phone.local`,
      });

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the link and use it to create a session
    const linkUrl = new URL(sessionData.properties.action_link);
    const token_hash = linkUrl.searchParams.get("token") || linkUrl.hash;

    return new Response(
      JSON.stringify({
        user_id: userId,
        action_link: sessionData.properties.action_link,
        hashed_token: sessionData.properties.hashed_token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
