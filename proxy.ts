import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // 🔹 Create Supabase client (handles cookies + session refresh)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 🔹 This line does EVERYTHING:
  // - checks login
  // - refreshes session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // 🔹 Define routes properly (clean separation)
  const publicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isProtectedRoute = pathname.startsWith("/dashboard");

  // 🔒 Protect private routes
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🚫 Prevent logged-in users from auth pages
  if (user && publicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Logged in + protected route → check profile
  if (user && isProtectedRoute && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return res;
}

// middleware only run on this routes
// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/register"],
// };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
