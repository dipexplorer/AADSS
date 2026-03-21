"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/server/auth/register";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
      );
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form className="flex flex-col gap-4 w-80" onSubmit={handleRegister}>
        <h1 className="text-xl font-semibold">Register</h1>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
