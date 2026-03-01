import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DISHES, Dish } from "@/data/mockData";

export default function MenuManagement() {
  const [dishes, setDishes] = useState<Dish[]>(DISHES);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [open, setOpen] = useState(false);

  const handleDelete = (id: string) => setDishes(prev => prev.filter(d => d.id !== id));

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Menu Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditDish(null)}><Plus className="h-4 w-4" /> Add Dish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editDish ? "Edit Dish" : "Add New Dish"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Name</Label><Input defaultValue={editDish?.name} placeholder="Dish name" /></div>
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" defaultValue={editDish?.price} placeholder="249" /></div>
              <div className="space-y-2"><Label>Category</Label><Input defaultValue={editDish?.category} placeholder="Main Course" /></div>
              <div className="space-y-2"><Label>Description</Label><Input defaultValue={editDish?.description} placeholder="A brief description" /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input defaultValue={editDish?.image} placeholder="https://..." /></div>
              <Button className="w-full" onClick={() => setOpen(false)}>Save Dish</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {dishes.map(dish => (
          <Card key={dish.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <img src={dish.image} alt={dish.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${dish.isVeg ? "bg-success" : "bg-destructive"}`} />
                  <h3 className="font-semibold truncate">{dish.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{dish.category} • ₹{dish.price}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditDish(dish); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(dish.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
