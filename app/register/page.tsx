"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/server/auth/register";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  Sparkles,
  UserPlus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.SubmitEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      const res = await register(email, password);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Registration successful. Please check your email for verification.",
        { duration: 5000 },
      );
      router.push("/login");
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-zinc-500/10 via-background to-black pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-zinc-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-zinc-800/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Floating Sparkles for depth */}
      <Sparkles className="absolute top-[25%] right-[20%] text-zinc-400/20 w-8 h-8 animate-pulse" />
      <Sparkles className="absolute bottom-[15%] left-[15%] text-zinc-500/10 w-12 h-12" />

      {/* Main Registration Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 mx-4 bg-background/50 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] z-10 transition-transform duration-500 hover:scale-[1.01]">
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 ring-1 ring-border/20">
            <GraduationCap className="text-primary-foreground w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center tracking-tight">
            Join Acadence
          </h1>
          <p className="text-muted-foreground text-sm text-center font-medium">
            Create an account to manage your academic life
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">
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
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent rounded-xl transition-all"
                required
                minLength={6}
              />
            </div>
            <p className="text-[10px] text-muted-foreground ml-1">
              Password must be at least 6 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Account
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-semibold hover:underline transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
