// app/simulate/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/attendance/getStudentProfile";
import { getSimulationData } from "@/lib/engines/simulation/getSimulationData";
import Header from "@/components/common/Header";
import SimulateClient from "./components/SimulateClient";

export const metadata = { title: "Simulate — Acadence" };

export default async function SimulatePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await getStudentProfile();
  if (!profile) redirect("/onboarding");

  const simInputs = await getSimulationData(
    profile.semester_id,
    profile.id,
    profile.session_id,
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[60px] pb-20 md:pb-8">
        <SimulateClient subjects={simInputs} />
      </div>
    </>
  );
}
