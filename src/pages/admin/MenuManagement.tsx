import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyRestaurant, useDishes, type DbDish } from "@/hooks/useRestaurantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function MenuManagement() {
  const { user } = useAuth();
  const { restaurantId, loading: rLoading } = useMyRestaurant(user?.id ?? null);
  const { dishes, loading, refetch } = useDishes(restaurantId);
  const [editDish, setEditDish] = useState<DbDish | null>(null);
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName(""); setPrice(""); setCategory(""); setDescription(""); setImageUrl(""); setIsVeg(true); setIsPopular(false);
  };

  const openEdit = (dish: DbDish) => {
    setEditDish(dish);
    setName(dish.name);
    setPrice(String(dish.price));
    setCategory(dish.category);
    setDescription(dish.description ?? "");
    setImageUrl(dish.image_url ?? "");
    setIsVeg(dish.is_veg);
    setIsPopular(dish.is_popular);
    setOpen(true);
  };

  const openNew = () => {
    setEditDish(null);
    resetForm();
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name || !price || !restaurantId) return;
    setSaving(true);

    const dishData = {
      restaurant_id: restaurantId,
      name,
      price: Number(price),
      category: category || "Main Course",
      description: description || null,
      image_url: imageUrl || null,
      is_veg: isVeg,
      is_popular: isPopular,
    };

    if (editDish) {
      const { error } = await supabase.from("dishes").update(dishData).eq("id", editDish.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Dish updated!" }); }
    } else {
      const { error } = await supabase.from("dishes").insert(dishData);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Dish added!" }); }
    }

    setSaving(false);
    setOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("dishes").delete().eq("id", id);
    toast({ title: "Dish deleted" });
    refetch();
  };

  if (rLoading || loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!restaurantId) {
    return <div className="container py-6 text-center"><p className="text-muted-foreground">No restaurant assigned.</p></div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Menu Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Add Dish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editDish ? "Edit Dish" : "Add New Dish"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Dish name" /></div>
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="249" /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Main Course" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description" /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={isVeg} onCheckedChange={setIsVeg} /><Label>Vegetarian</Label></div>
                <div className="flex items-center gap-2"><Switch checked={isPopular} onCheckedChange={setIsPopular} /><Label>Popular</Label></div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Dish"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {dishes.map(dish => (
          <Card key={dish.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <img src={dish.image_url || "/placeholder.svg"} alt={dish.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${dish.is_veg ? "bg-success" : "bg-destructive"}`} />
                  <h3 className="font-semibold truncate">{dish.name}</h3>
                  {dish.is_popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{dish.category} • ₹{dish.price}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dish)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(dish.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {dishes.length === 0 && <p className="text-center text-muted-foreground py-8">No dishes yet. Add your first dish!</p>}
      </div>
    </div>
  );
}
