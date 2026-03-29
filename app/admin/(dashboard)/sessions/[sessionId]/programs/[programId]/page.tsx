// app/admin/(dashboard)/sessions/[sessionId]/programs/[programId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProgramDetailClient from "./components/ProgramDetailClient";

interface Props {
  params: Promise<{ sessionId: string; programId: string }>;
}

export default async function AdminProgramDetailPage(props: Props) {
  const { sessionId, programId } = await props.params;
  const supabase = createClient();

  // Fetch Program details and ensure it belongs to the session
  const { data: program } = await supabase
    .from("programs")
    .select("*, academic_sessions(name)")
    .eq("id", programId)
    .single();

  const _program = program as any;

  if (!_program || _program.session_id !== sessionId) {
    notFound();
  }

  // Fetch Semesters under this program
  const { data: semesters } = await supabase
    .from("semesters")
    .select("*, subjects(count)")
    .eq("program_id", programId)
    .order("semester_number");

  const formattedSemesters = (semesters ?? []).map((sem) => ({
    ...sem,
    subjects_count: sem.subjects?.[0]?.count ?? 0,
  }));

  return (
    <ProgramDetailClient
      program={_program}
      semesters={formattedSemesters}
      sessionId={sessionId}
    />
  );
}
