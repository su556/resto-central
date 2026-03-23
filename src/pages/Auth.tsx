import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseAuth, RecaptchaVerifier, signInWithPhoneNumber } from "@/integrations/firebase/client";
import type { ConfirmationResult } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, Phone, ChefHat, ShieldCheck } from "lucide-react";
import authHero from "@/assets/auth-hero.jpg";

export default function Auth() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero */}
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

      {/* Right — Phone Auth */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <PhoneAuthFlow />
        </div>
      </div>
    </div>
  );
}

/* ─── Phone Auth Flow ─── */
function PhoneAuthFlow() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState("");

  // Setup invisible reCAPTCHA
  const setupRecaptcha = useCallback(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        { size: "invisible", callback: () => {} }
      );
    }
  }, []);

  useEffect(() => {
    setupRecaptcha();
  }, [setupRecaptcha]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setPhone(formattedPhone);
      setStep("otp");
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch {}
        (window as any).recaptchaVerifier = null;
      }
      setupRecaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !confirmationResult) return;
    setSubmitting(true);
    setError("");

    try {
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();

      // Exchange Firebase token for Supabase session
      const { data, error: fnError } = await supabase.functions.invoke("firebase-phone-auth", {
        body: { firebase_token: idToken, phone, role: "customer" },
      });

      if (fnError) throw new Error(fnError.message);

      // Use the magic link to establish session
      if (data?.action_link) {
        const url = new URL(data.action_link);
        const token_hash = url.searchParams.get("token_hash") || url.searchParams.get("token");
        const type = url.searchParams.get("type") || "magiclink";

        if (token_hash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (verifyError) throw verifyError;
        }
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !submitting) {
      handleVerifyOTP();
    }
  }, [otp]);

  if (step === "otp") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
          >
            <ArrowLeft className="h-4 w-4" /> Change number
          </button>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground text-center">Verify OTP</h1>
          <p className="text-muted-foreground text-center">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <Button
          className="w-full h-11 text-base font-semibold"
          disabled={otp.length !== 6 || submitting}
          onClick={handleVerifyOTP}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="text-primary font-semibold hover:underline"
            onClick={() => { setStep("phone"); setOtp(""); }}
          >
            Resend
          </button>
        </p>
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
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome</h1>
        <p className="text-muted-foreground">Enter your phone number to get started</p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="pl-10 h-11"
              placeholder="+91 98765 43210"
            />
          </div>
          <p className="text-xs text-muted-foreground">We'll send you a one-time verification code</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
        </Button>
      </form>

      <div id="recaptcha-container" />
    </div>
  );
}
