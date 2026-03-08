import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";

// Demo PINs — in production, replace with real server-side authentication
const DEMO_PINS: Record<string, string> = {
  admin: "1234",
  rider: "5678",
};

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { role, setRole } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (role === requiredRole) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DEMO_PINS[requiredRole]) {
      setRole(requiredRole);
      setError("");
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">
            {requiredRole === "admin" ? "Admin Access" : "Rider Access"}
          </CardTitle>
          <CardDescription>
            Enter the {requiredRole} PIN to continue.
            <br />
            <span className="text-xs text-muted-foreground">(Demo PIN: {DEMO_PINS[requiredRole]})</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
