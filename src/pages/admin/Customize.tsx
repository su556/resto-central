import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Palette, Type, Image, LayoutList, Eye, GripVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant } from "@/hooks/useRestaurantData";
import { useRestaurantTheme, applyThemeToDOM, type RestaurantTheme, type ThemeSectionsConfig } from "@/hooks/useRestaurantTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const FONT_OPTIONS = [
  "Playfair Display", "Merriweather", "Lora", "Cormorant Garamond", "Libre Baskerville",
  "Poppins", "Inter", "Roboto", "Open Sans", "Montserrat", "Raleway", "Nunito",
  "DM Sans", "Work Sans", "Outfit", "Space Grotesk", "Plus Jakarta Sans",
];

const DISPLAY_FONTS = ["Playfair Display", "Merriweather", "Lora", "Cormorant Garamond", "Libre Baskerville", "Poppins", "Montserrat", "Raleway", "Outfit", "Space Grotesk"];
const BODY_FONTS = ["DM Sans", "Inter", "Roboto", "Open Sans", "Nunito", "Work Sans", "Plus Jakarta Sans", "Poppins", "Raleway"];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  popular_dishes: "Popular Dishes",
  about_us: "About Us",
  hours: "Operating Hours",
};

function hslToHex(hsl: string): string {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return "#e8533f";
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const DEFAULT_THEME: Omit<RestaurantTheme, "id" | "restaurant_id"> = {
  primary_color: "16 80% 50%",
  accent_color: "345 60% 38%",
  background_color: "30 50% 98%",
  foreground_color: "20 30% 12%",
  font_display: "Playfair Display",
  font_body: "DM Sans",
  logo_url: null,
  banner_url: null,
  hero_title: null,
  hero_subtitle: null,
  sections_config: {
    hero: { visible: true, order: 0 },
    popular_dishes: { visible: true, order: 1 },
    about_us: { visible: true, order: 2 },
    hours: { visible: true, order: 3 },
  },
};

export default function Customize() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);
  const { theme: existingTheme, loading: tLoading } = useRestaurantTheme(restaurantId);

  const [form, setForm] = useState(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    if (existingTheme) {
      const { id, restaurant_id, ...rest } = existingTheme;
      setForm(rest);
    }
  }, [existingTheme]);

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (key: string, field: "visible" | "order", value: boolean | number) => {
    setForm(prev => ({
      ...prev,
      sections_config: {
        ...prev.sections_config,
        [key]: { ...prev.sections_config[key as keyof ThemeSectionsConfig], [field]: value },
      },
    }));
  };

  const togglePreview = () => {
    if (!previewActive) {
      applyThemeToDOM({ ...form, id: "", restaurant_id: "" } as RestaurantTheme);
      setPreviewActive(true);
    } else {
      // Reset to original
      if (existingTheme) applyThemeToDOM(existingTheme);
      else window.location.reload();
      setPreviewActive(false);
    }
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);

    const payload = {
      restaurant_id: restaurantId,
      ...form,
      sections_config: JSON.parse(JSON.stringify(form.sections_config)),
    };

    let error;
    if (existingTheme) {
      ({ error } = await supabase.from("restaurant_themes").update(payload).eq("restaurant_id", restaurantId));
    } else {
      ({ error } = await supabase.from("restaurant_themes").insert(payload as any));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Theme saved!" });
      applyThemeToDOM({ ...form, id: "", restaurant_id: restaurantId } as RestaurantTheme);
    }
    setSaving(false);
  };

  if (rLoading || tLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!restaurantId) {
    return <div className="container py-6 text-center"><p className="text-muted-foreground">No restaurant assigned.</p></div>;
  }

  const sortedSections = Object.entries(form.sections_config).sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="container py-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold">Customize Website</h1>
        <Button variant="outline" size="sm" className="gap-2" onClick={togglePreview}>
          <Eye className="h-4 w-4" />
          {previewActive ? "Stop Preview" : "Live Preview"}
        </Button>
      </div>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {([
            ["primary_color", "Primary Color"],
            ["accent_color", "Accent Color"],
            ["background_color", "Background"],
            ["foreground_color", "Text Color"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hslToHex(form[key])}
                  onChange={e => updateField(key, hexToHsl(e.target.value))}
                  className="h-10 w-14 rounded border cursor-pointer"
                />
                <Input
                  value={form[key]}
                  onChange={e => updateField(key, e.target.value)}
                  className="text-xs font-mono"
                  placeholder="H S% L%"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" /> Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Select value={form.font_display} onValueChange={v => updateField("font_display", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISPLAY_FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: `'${form.font_display}', serif` }}>
              Preview: The Quick Brown Fox
            </p>
          </div>
          <div className="space-y-2">
            <Label>Body Font</Label>
            <Select value={form.font_body} onValueChange={v => updateField("font_body", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BODY_FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: `'${form.font_body}', sans-serif` }}>
              Preview: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" /> Branding Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={form.logo_url ?? ""}
              onChange={e => updateField("logo_url", e.target.value || null)}
              placeholder="https://example.com/logo.png"
            />
            {form.logo_url && (
              <div className="h-16 w-auto">
                <img src={form.logo_url} alt="Logo preview" className="h-full object-contain rounded" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Hero Banner URL</Label>
            <Input
              value={form.banner_url ?? ""}
              onChange={e => updateField("banner_url", e.target.value || null)}
              placeholder="https://example.com/banner.jpg"
            />
            {form.banner_url && (
              <div className="aspect-[3/1] max-w-sm overflow-hidden rounded-lg">
                <img src={form.banner_url} alt="Banner preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custom Hero Title</Label>
              <Input
                value={form.hero_title ?? ""}
                onChange={e => updateField("hero_title", e.target.value || null)}
                placeholder="Leave blank to use restaurant name"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Hero Subtitle</Label>
              <Input
                value={form.hero_subtitle ?? ""}
                onChange={e => updateField("hero_subtitle", e.target.value || null)}
                placeholder="Leave blank to use tagline"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-primary" /> Content Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedSections.map(([key, config]) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 font-medium text-sm">{SECTION_LABELS[key] ?? key}</span>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Order</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={config.order}
                  onChange={e => updateSection(key, "order", parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-xs"
                />
              </div>
              <Switch
                checked={config.visible}
                onCheckedChange={v => updateSection(key, "visible", v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full gap-2" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Theme</>}
      </Button>
    </div>
  );
}
