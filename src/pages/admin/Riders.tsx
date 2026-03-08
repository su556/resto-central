import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RiderProfile {
  user_id: string;
  display_name: string | null;
}

export default function AdminRiders() {
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiders = async () => {
      // Get all users with rider role
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "rider");
      if (!roles || roles.length === 0) { setLoading(false); return; }

      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      setRiders(profiles ?? []);
      setLoading(false);
    };
    fetchRiders();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-display font-bold">Riders</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {riders.map(rider => (
          <Card key={rider.user_id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted"><User className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold">{rider.display_name || "Unnamed Rider"}</h3>
                  <p className="text-xs text-muted-foreground">{rider.user_id.slice(0, 8)}…</p>
                </div>
                <Badge className="ml-auto">Rider</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {riders.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No riders registered yet.</p>}
      </div>
    </div>
  );
}
