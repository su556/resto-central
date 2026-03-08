import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Percent, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant, useOffers } from "@/hooks/useRestaurantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Offers() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);
  const { offers, loading, refetch } = useOffers(restaurantId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [discount, setDiscount] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const handleAdd = async () => {
    if (!title || !discount || !restaurantId) return;
    const { error } = await supabase.from("offers").insert({
      restaurant_id: restaurantId,
      title,
      description: desc || null,
      discount_percent: Number(discount),
      min_order: Number(minOrder) || 0,
      is_active: true,
      valid_until: "2026-04-30",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTitle(""); setDesc(""); setDiscount(""); setMinOrder("");
    setOpen(false);
    toast({ title: "Offer created!" });
    refetch();
  };

  const toggleOffer = async (id: string, current: boolean) => {
    await supabase.from("offers").update({ is_active: !current }).eq("id", id);
    refetch();
  };

  const deleteOffer = async (id: string) => {
    await supabase.from("offers").delete().eq("id", id);
    toast({ title: "Offer deleted" });
    refetch();
  };

  if (rLoading || loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Offers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Offer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Create Offer</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Weekend Special" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="15% off on orders above ₹500" /></div>
              <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="15" /></div>
              <div className="space-y-2"><Label>Min Order (₹)</Label><Input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="500" /></div>
              <Button className="w-full" onClick={handleAdd}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {offers.map(offer => (
          <Card key={offer.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary"><Percent className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{offer.title}</h3>
                  <Badge variant={offer.is_active ? "default" : "secondary"}>{offer.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{offer.description}</p>
                <p className="text-xs text-muted-foreground">Min ₹{offer.min_order} • Until {offer.valid_until}</p>
              </div>
              <Switch checked={offer.is_active} onCheckedChange={() => toggleOffer(offer.id, offer.is_active)} />
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteOffer(offer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {offers.length === 0 && <p className="text-center text-muted-foreground py-8">No offers yet</p>}
      </div>
    </div>
  );
}
