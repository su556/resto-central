import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Mail, Lock, User, ChefHat } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import authHero from "@/assets/auth-hero.jpg";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authHero} alt="Restaurant ambiance" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/90 flex items-center justify-center">
              <ChefHat className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold">Spice Garden</span>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-3">
            Authentic flavors,<br />delivered to your door
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Order from the finest restaurants, track in real time, and enjoy every bite.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">✦</span>
              500+ dishes
            </div>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">⚡</span>
              30 min delivery
            </div>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">★</span>
              4.8 rating
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {mode === "login" && <LoginForm onSwitch={setMode} />}
          {mode === "signup" && <SignupForm onSwitch={setMode} />}
          {mode === "forgot" && <ForgotForm onSwitch={setMode} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Login ─── */
function LoginForm({ onSwitch }: { onSwitch: (m: "login" | "signup" | "forgot") => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-primary">Spice Garden</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <GoogleSignInButton />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">or continue with email</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-11" placeholder="you@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <button type="button" className="text-xs text-primary hover:underline font-medium" onClick={() => onSwitch("forgot")}>Forgot password?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 h-11" placeholder="••••••••" />
          </div>
        </div>
        {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button type="button" className="text-primary font-semibold hover:underline" onClick={() => onSwitch("signup")}>Create one</button>
      </p>
    </div>
  );
}

/* ─── Signup ─── */
function SignupForm({ onSwitch }: { onSwitch: (m: "login" | "signup" | "forgot") => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error } = await signUp(email, password, displayName, role);
    if (error) setError(error);
    else setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
          <Mail className="h-8 w-8 text-success" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold">Check your email</h1>
          <p className="text-muted-foreground">We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to activate your account.</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => onSwitch("login")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-primary">Spice Garden</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Create account</h1>
        <p className="text-muted-foreground">Join us and start ordering today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="pl-10 h-11" placeholder="John Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="s-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-11" placeholder="you@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="s-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="pl-10 h-11" placeholder="Min. 6 characters" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">I am a</Label>
          <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">🍽️ Customer</SelectItem>
              <SelectItem value="admin">👨‍🍳 Restaurant Admin</SelectItem>
              <SelectItem value="rider">🏍️ Delivery Rider</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" className="text-primary font-semibold hover:underline" onClick={() => onSwitch("login")}>Sign in</button>
      </p>
    </div>
  );
}

/* ─── Forgot Password ─── */
function ForgotForm({ onSwitch }: { onSwitch: (m: "login" | "signup" | "forgot") => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error } = await resetPassword(email);
    if (error) setError(error);
    else setSent(true);
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold">Check your inbox</h1>
          <p className="text-muted-foreground">We've sent a password reset link to your email.</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => onSwitch("login")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <button type="button" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" onClick={() => onSwitch("login")}>
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>
        <h1 className="text-3xl font-display font-bold text-foreground">Reset password</h1>
        <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="f-email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="f-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-11" placeholder="you@example.com" />
          </div>
        </div>
        {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}

/* ─── Google Button ─── */
function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) console.error("Google sign-in error:", error);
    setLoading(false);
  };

  return (
    <Button variant="outline" className="w-full h-11 gap-3 text-sm font-medium border-border/60 hover:bg-muted/50" onClick={handleGoogleSignIn} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}
