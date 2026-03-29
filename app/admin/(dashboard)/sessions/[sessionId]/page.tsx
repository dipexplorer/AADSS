// app/admin/(dashboard)/sessions/[sessionId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SessionDetailClient from "./components/SessionDetailClient";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function AdminSessionDetailPage(props: Props) {
  const { sessionId } = await props.params;
  const supabase = createClient();

  // Fetch session details
  const { data: session } = await supabase
    .from("academic_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) {
    notFound();
  }

  // Fetch Programs associated with this session (if relationships enforced, they have session_id)
  // Wait, in my schema update I added session_id to programs.
  // So I can query them here.
  const { data: programs } = await supabase
    .from("programs")
    .select("*, semesters(count)")
    .eq("session_id", sessionId)
    .order("name");

  const formattedPrograms = (programs ?? []).map((prog) => ({
    ...prog,
    semesters_count: prog.semesters?.[0]?.count ?? 0,
  }));

  return (
    <SessionDetailClient 
      session={session} 
      programs={formattedPrograms} 
    />
  );
}
