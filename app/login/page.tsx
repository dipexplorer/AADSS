"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/server/auth/login";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      const res = await login(email, password);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Welcome back! 🚀");
      if (res.needsOnboarding) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background font-sans">
      {/* Dynamic Background Mesh Gradient - Monochrome/Zinc style */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-zinc-500/10 via-background to-black pointer-events-none" />
      <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-zinc-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-zinc-800/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Floating Sparkles for depth */}
      <Sparkles className="absolute top-[15%] left-[20%] text-zinc-400/20 w-8 h-8 animate-pulse" />
      <Sparkles className="absolute bottom-[20%] right-[25%] text-zinc-500/10 w-12 h-12" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 mx-4 bg-background/50 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] z-10 transition-transform duration-500 hover:scale-[1.01]">
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 ring-1 ring-border/20">
            <GraduationCap className="text-primary-foreground w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center tracking-tight">
            Welcome to Acadence
          </h1>
          <p className="text-muted-foreground text-sm text-center font-medium">
            Sign in to continue your academic journey
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent rounded-xl transition-all"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent rounded-xl transition-all"
                required
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-[13px] text-muted-foreground">
          <p>
            Accounts are strictly provisioned by the University Administration.
          </p>
          <p className="mt-1">
            Contact your Administration if you cannot access your account.
          </p>
        </div>
      </div>
    </div>
  );
}
