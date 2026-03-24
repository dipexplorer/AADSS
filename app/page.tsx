import Link from "next/link";

export const metadata = {
  title: "Acadence — Smart Attendance Tracking",
  description:
    "Academic Attendance Decision Support System. Track, analyze, and optimize your attendance.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg
              className="w-9 h-9 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Acadence
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            Smart attendance tracking with analytics, simulations, and
            decision&nbsp;support — so you never fall behind.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 transition-all"
            >
              Sign In
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl border border-border text-foreground font-semibold text-base hover:bg-muted transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Live Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                Real-time attendance percentages, risk scores, and weekly trends
                per subject.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.346A3.99 3.99 0 0114 18H10a3.99 3.99 0 01-2.828-1.172l-.347-.346z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Smart Simulation
              </h3>
              <p className="text-sm text-muted-foreground">
                Skip planner, recovery planner, and worst-case analysis to make
                informed decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Geo-Verified
              </h3>
              <p className="text-sm text-muted-foreground">
                GPS-based attendance verification ensures you&apos;re physically
                in the classroom.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Acadence — Academic Attendance Decision Support System
        </p>
      </footer>
    </div>
  );
}
