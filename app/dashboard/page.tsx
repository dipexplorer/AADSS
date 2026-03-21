"use clientssss";

export default async function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="bg-white/10 p-6 rounded-xl border border-white/20 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Dev Dashboard</h1>

        <p className="text-sm text-gray-300 mb-2">You are logged in ✅</p>
      </div>
    </div>
  );
}
