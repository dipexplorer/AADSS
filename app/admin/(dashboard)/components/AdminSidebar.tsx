// app/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Clock,
  Users,
  CheckSquare,
  LogOut,
  ShieldAlert,
  Loader2,
  AlertOctagon,
  GraduationCap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Sessions", href: "/admin/sessions", icon: Calendar },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Timetable", href: "/admin/timetable", icon: Clock },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Classes", href: "/admin/classes", icon: CheckSquare },
  { label: "Eligibility", href: "/admin/defaulters", icon: AlertOctagon },
  { label: "Promotions", href: "/admin/promotions", icon: GraduationCap },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out from server:", error);
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col z-50 transition-all duration-300 shadow-xl print:hidden">
      {/* Logo Area */}
      <div className="p-6 border-b border-border/50">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-border/20 group-hover:scale-105 transition-transform duration-300">
            <ShieldAlert className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg tracking-tight leading-none group-hover:text-primary transition-colors">
              Acadence
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Admin Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-foreground rounded-r-full" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-300 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-destructive/90 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-300 disabled:opacity-50 hover:shadow-sm active:scale-[0.98]"
        >
          {signingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
