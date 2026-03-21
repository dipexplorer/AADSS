import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // 2. Get student profile
  const { data: profile } = await supabase
    .from("student_profiles")
    .select(
      `
      id,
      session_id,
      program_id,
      semester_id
    `,
    )
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-4">
        <p>User ID: {user.id}</p>
        <p>Profile ID: {profile?.id}</p>
      </div>
    </div>
  );
}
