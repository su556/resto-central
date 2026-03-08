import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant } from "@/hooks/useRestaurantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function RestaurantSettings() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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
        }
        setLoading(false);
      });
  }, [restaurantId]);

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

      <Button className="w-full gap-2" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Settings</>}
      </Button>
    </div>
  );
}
