import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant } from "@/hooks/useRestaurantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type Day = typeof DAYS[number];

interface DayHours {
  open: string;
  close: string;
  is_closed: boolean;
}

type OperatingHours = Record<Day, DayHours>;

const DEFAULT_HOURS: OperatingHours = {
  monday: { open: "09:00", close: "22:00", is_closed: false },
  tuesday: { open: "09:00", close: "22:00", is_closed: false },
  wednesday: { open: "09:00", close: "22:00", is_closed: false },
  thursday: { open: "09:00", close: "22:00", is_closed: false },
  friday: { open: "09:00", close: "22:00", is_closed: false },
  saturday: { open: "09:00", close: "23:00", is_closed: false },
  sunday: { open: "09:00", close: "23:00", is_closed: false },
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RestaurantSettings() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState<OperatingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? "");
          setTagline(data.tagline ?? "");
          setDescription(data.description ?? "");
          setPhone(data.phone ?? "");
          setAddress(data.address ?? "");
          if (data.operating_hours) {
            setHours({ ...DEFAULT_HOURS, ...(data.operating_hours as unknown as OperatingHours) });
          }
        }
        setLoading(false);
      });
  }, [restaurantId]);

  const updateDay = (day: Day, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Restaurant name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        operating_hours: JSON.parse(JSON.stringify(hours)),
      })
      .eq("id", restaurantId!);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved!" });
    }
    setSaving(false);
  };

  if (rLoading || loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!restaurantId) {
    return <div className="container py-6 text-center"><p className="text-muted-foreground">No restaurant assigned.</p></div>;
  }

  return (
    <div className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Restaurant Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">General Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Restaurant Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Spice Garden" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Authentic flavors, crafted with love" maxLength={150} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell customers about your restaurant..." maxLength={500} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Contact & Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full restaurant address" maxLength={300} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <span className="w-24 text-sm font-medium shrink-0">{capitalize(day)}</span>
              <Switch
                checked={!hours[day].is_closed}
                onCheckedChange={(checked) => updateDay(day, "is_closed", !checked)}
              />
              {hours[day].is_closed ? (
                <span className="text-sm text-muted-foreground italic">Closed</span>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hours[day].open}
                    onChange={(e) => updateDay(day, "open", e.target.value)}
                    className="w-[130px]"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={hours[day].close}
                    onChange={(e) => updateDay(day, "close", e.target.value)}
                    className="w-[130px]"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full gap-2" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Settings</>}
      </Button>
    </div>
  );
}
