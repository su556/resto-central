import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves restaurant from subdomain.
 * e.g. spicegarden.resto-central.lovable.app → looks up restaurant with slug "spicegarden"
 * Falls back to first restaurant if no subdomain or no match (single-tenant mode).
 */
export function useSubdomainRestaurant() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      const hostname = window.location.hostname;
      // Extract subdomain: anything before the first known domain segment
      // Supports: sub.resto-central.lovable.app, sub.yourdomain.com, localhost (no subdomain)
      const parts = hostname.split(".");
      let sub: string | null = null;

      if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "id-preview--84c9345d-b10d-42ad-8ce4-f8752f19b411") {
        // Likely a subdomain
        sub = parts[0].toLowerCase();
      }

      setSubdomain(sub);

      if (sub) {
        // Try matching by restaurant name (slug-like matching)
        const { data } = await supabase
          .from("restaurants")
          .select("id")
          .ilike("name", `%${sub}%`)
          .limit(1)
          .maybeSingle();

        if (data) {
          setRestaurantId(data.id);
          setLoading(false);
          return;
        }
      }

      // Fallback: first restaurant
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .limit(1)
        .single();

      setRestaurantId(data?.id ?? null);
      setLoading(false);
    };

    resolve();
  }, []);

  return { restaurantId, subdomain, loading };
}
