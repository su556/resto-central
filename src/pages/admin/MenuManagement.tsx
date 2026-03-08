import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
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
  const [isVeg, setIsVeg] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName(""); setPrice(""); setCategory(""); setDescription("");
    setIsVeg(true); setIsPopular(false);
    setImageFile(null); setImagePreview(null); setExistingImageUrl(null);
  };

  const openEdit = (dish: DbDish) => {
    setEditDish(dish);
    setName(dish.name);
    setPrice(String(dish.price));
    setCategory(dish.category);
    setDescription(dish.description ?? "");
    setIsVeg(dish.is_veg);
    setIsPopular(dish.is_popular);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(dish.image_url);
    setOpen(true);
  };

  const openNew = () => {
    setEditDish(null);
    resetForm();
    setOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return existingImageUrl;
    setUploading(true);

    const ext = imageFile.name.split(".").pop();
    const fileName = `${restaurantId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("dish-images")
      .upload(fileName, imageFile, { upsert: true });

    setUploading(false);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return existingImageUrl;
    }

    const { data: urlData } = supabase.storage
      .from("dish-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!name || !price || !restaurantId) return;
    setSaving(true);

    const imageUrl = await uploadImage();

    const dishData = {
      restaurant_id: restaurantId,
      name,
      price: Number(price),
      category: category || "Main Course",
      description: description || null,
      image_url: imageUrl,
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

  const currentPreview = imagePreview || existingImageUrl;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Menu Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Add Dish</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editDish ? "Edit Dish" : "Add New Dish"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Dish Photo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {currentPreview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={currentPreview} alt="Preview" className="w-full h-40 object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Change
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    <span className="text-sm text-muted-foreground">Click to upload photo</span>
                    <span className="text-xs text-muted-foreground/70">JPG, PNG up to 5MB</span>
                  </button>
                )}
              </div>

              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Dish name" /></div>
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="249" /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Main Course" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description" /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={isVeg} onCheckedChange={setIsVeg} /><Label>Vegetarian</Label></div>
                <div className="flex items-center gap-2"><Switch checked={isPopular} onCheckedChange={setIsPopular} /><Label>Popular</Label></div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving || uploading}>
                {saving || uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {uploading ? "Uploading..." : "Saving..."}</>
                ) : "Save Dish"}
              </Button>
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
