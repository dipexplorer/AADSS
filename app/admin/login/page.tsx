// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setIsPending(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Role check
      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background font-sans dark">
      {/* Dynamic Background Mesh Gradient - Monochrome/Zinc style */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-zinc-600/20 via-background to-black/90 pointer-events-none" />
      <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-zinc-500/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-zinc-700/20 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Floating Sparkles for depth */}
      <Sparkles className="absolute top-[15%] left-[20%] text-zinc-400/30 w-8 h-8 animate-pulse" />
      <Sparkles className="absolute bottom-[20%] right-[25%] text-zinc-500/20 w-12 h-12 animate-pulse" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 mx-4 bg-background/60 backdrop-blur-3xl border border-zinc-800/50 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-10 transition-transform duration-500 hover:scale-[1.01]">
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-6 shadow-xl shadow-black/40 ring-1 ring-white/10">
            <Shield className="text-zinc-100 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 mb-2 text-center tracking-tight">
            Admin Portal
          </h1>
          <p className="text-zinc-400 text-sm text-center font-medium">
            Acadence — Restricted Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-200 transition-colors" />
              <Input
                type="email"
                placeholder="admin@acadence.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:border-transparent rounded-xl transition-all"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-200 transition-colors" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:border-transparent rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 mt-2 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/20 active:scale-[0.98]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
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
        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center text-sm">
          <Link
            href="/login"
            className="text-zinc-400 font-medium hover:text-zinc-200 transition-colors inline-flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Return to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

