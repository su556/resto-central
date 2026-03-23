import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeSectionsConfig {
  hero: { visible: boolean; order: number };
  popular_dishes: { visible: boolean; order: number };
  about_us: { visible: boolean; order: number };
  hours: { visible: boolean; order: number };
}

export interface RestaurantTheme {
  id: string;
  restaurant_id: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_display: string;
  font_body: string;
  logo_url: string | null;
  banner_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  sections_config: ThemeSectionsConfig;
}

const DEFAULT_SECTIONS: ThemeSectionsConfig = {
  hero: { visible: true, order: 0 },
  popular_dishes: { visible: true, order: 1 },
  about_us: { visible: true, order: 2 },
  hours: { visible: true, order: 3 },
};

export function useRestaurantTheme(restaurantId: string | null) {
  const [theme, setTheme] = useState<RestaurantTheme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    if (!restaurantId) { setLoading(false); return; }
    const { data } = await supabase
      .from("restaurant_themes")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (data) {
      setTheme({
        ...data,
        sections_config: { ...DEFAULT_SECTIONS, ...(data.sections_config as unknown as ThemeSectionsConfig) },
      } as RestaurantTheme);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTheme(); }, [restaurantId]);

  return { theme, loading, refetch: fetchTheme };
}

export function applyThemeToDOM(theme: RestaurantTheme | null) {
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary_color);
  root.style.setProperty("--accent", theme.accent_color);
  root.style.setProperty("--background", theme.background_color);
  root.style.setProperty("--foreground", theme.foreground_color);
  root.style.setProperty("--ring", theme.primary_color);

  // Load Google Fonts dynamically
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.font_display)}:wght@400;500;600;700&family=${encodeURIComponent(theme.font_body)}:wght@300;400;500;600;700&display=swap`;
  let link = document.getElementById("theme-fonts") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.id = "theme-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = fontUrl;

  root.style.setProperty("--font-display", `'${theme.font_display}', serif`);
  root.style.setProperty("--font-body", `'${theme.font_body}', sans-serif`);
  document.body.style.fontFamily = `'${theme.font_body}', sans-serif`;
}
