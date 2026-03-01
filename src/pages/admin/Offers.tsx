import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Percent } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Offers() {
  const { offers, addOffer, toggleOffer, deleteOffer } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [discount, setDiscount] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const handleAdd = () => {
    if (!title || !discount) return;
    addOffer({
      id: `off${Date.now()}`,
      title,
      description: desc,
      discountPercent: Number(discount),
      minOrder: Number(minOrder) || 0,
      isActive: true,
      validUntil: "2026-04-30",
    });
    setTitle(""); setDesc(""); setDiscount(""); setMinOrder("");
    setOpen(false);
    toast({ title: "Offer created!" });
  };

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
                  <Badge variant={offer.isActive ? "default" : "secondary"}>{offer.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{offer.description}</p>
                <p className="text-xs text-muted-foreground">Min ₹{offer.minOrder} • Until {offer.validUntil}</p>
              </div>
              <Switch checked={offer.isActive} onCheckedChange={() => toggleOffer(offer.id)} />
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteOffer(offer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
