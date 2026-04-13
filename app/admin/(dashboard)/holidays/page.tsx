import { createClient } from "@/lib/supabase/server";
import { getHolidays } from "@/lib/admin/holidays";
import HolidaysClient from "./components/HolidaysClient";

export const metadata = {
  title: "Global Holidays | Admin Panel",
};

export default async function AdminHolidaysPage() {
  const supabase = await createClient();

  // Find the active session
  const { data: activeSessions } = await supabase
    .from("academic_sessions")
    .select("id, name, status")
    .order("start_date", { ascending: false });

  const currentSession =
    activeSessions?.find((s) => s.status === "active") || activeSessions?.[0];

  if (!currentSession) {
    return (
      <div className="p-8 text-center mt-20">
        <h1 className="text-xl font-bold text-zinc-800">No Active Session</h1>
        <p className="text-zinc-500 mt-2">
          Please set up an academic session before managing holidays.
        </p>
      </div>
    );
  }

  // Fetch holidays for the active session
  const { data: holidays, error } = await getHolidays(currentSession.id);

  return (
    <HolidaysClient
      holidays={holidays}
      session={currentSession}
      error={error}
    />
  );
}
