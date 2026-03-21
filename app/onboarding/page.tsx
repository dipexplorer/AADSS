"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { createProfile } from "@/server/auth/completeProfile";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type Option = { id: string; name: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  //   const [error, setError] = useState("");

  const [programs, setPrograms] = useState<Option[]>([]);
  const [sessions, setSessions] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);

  const [programId, setProgramId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const supabase = createClient();

  // Programs fetch
  useEffect(() => {
    supabase
      .from("programs")
      .select("id, name")
      .then(({ data }) => setPrograms(data ?? []));

    supabase
      .from("academic_sessions")
      .select("id, name")
      .then(({ data }) => setSessions(data ?? []));
  }, []);

  // Semesters — program select hone ke baad
  useEffect(() => {
    if (!programId) return;
    supabase
      .from("semesters")
      .select("id, semester_number")
      .eq("program_id", programId)
      .then(({ data }) =>
        setSemesters(
          (data ?? []).map((s) => ({
            id: s.id,
            name: `Semester ${s.semester_number}`,
          })),
        ),
      );
  }, [programId]);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!programId || !sessionId || !semesterId) {
      toast.error("Sab fields fill karo");
      return;
    }

    setIsPending(true);
    // setError("");

    try {
      const res = await createProfile(sessionId, programId, semesterId);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile created successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-xl font-semibold">Setup your profile</h1>

        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Academic Session</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={programId}
          onChange={(e) => {
            setProgramId(e.target.value);
            setSemesterId("");
          }}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
          disabled={!programId}
        >
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
