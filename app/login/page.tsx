"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/server/auth/login";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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

      toast.success("Login successful 🚀");
      // router.push("/dashboard");
      router.push("/calendar-dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-zinc-800 px-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.01]">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold text-white mb-6 text-center">
            Welcome Back
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/20"
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/20"
              required
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-200"
            >
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
