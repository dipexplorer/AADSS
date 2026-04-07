// app/profile/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFullStudentProfile } from "@/server/profile/getFullStudentProfile";
import { getMyResetRequests } from "@/server/profile/deviceResetRequest";
import Header from "@/components/common/Header";
import ProfileClient from "@/app/profile/ProfileClient";

export const metadata = {
  title: "My Profile — Acadence",
  description: "View your academic profile, device security status, and enrolled subjects.",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile, error }, { data: resetRequests }] = await Promise.all([
    getFullStudentProfile(),
    getMyResetRequests(),
  ]);

  if (!profile || error) redirect("/onboarding");

  return (
    <>
      <Header />
      <ProfileClient profile={profile} resetRequests={resetRequests} />
    </>
  );
}
