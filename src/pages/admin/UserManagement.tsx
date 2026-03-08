import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: AppRole;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (profiles && roles) {
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));
      setUsers(
        profiles.map(p => ({
          ...p,
          role: roleMap.get(p.user_id) ?? "customer",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdating(userId);
    // Update existing role row
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      // If no row exists, insert
      if (error.code === "PGRST116") {
        await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setUpdating(null);
        return;
      }
    }

    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
    toast({ title: "Role updated", description: `User role changed to ${newRole}.` });
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage user roles across the platform</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {users.map(user => (
          <Card key={user.user_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-full bg-muted shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{user.display_name || "Unnamed"}</h3>
                    <p className="text-xs text-muted-foreground truncate">{user.user_id.slice(0, 8)}…</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {updating === user.user_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Select value={user.role} onValueChange={(v) => handleRoleChange(user.user_id, v as AppRole)}>
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="rider">Rider</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <p className="text-muted-foreground col-span-2 text-center py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}
