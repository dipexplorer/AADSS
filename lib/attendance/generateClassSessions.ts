"use server";

import { createClient } from "@/lib/supabase/server";

export async function generateClassSessionsForDate(
  date: string, // YYYY-MM-DD
  semesterId: string,
): Promise<{ generated: number; error: string | null }> {
  const supabase = createClient();

  // Date se day of week nikalo (0=Sunday, 1=Monday...6=Saturday)
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Is semester ke subjects fetch karo
  const { data: semesterSubjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("semester_id", semesterId);

  if (!semesterSubjects || semesterSubjects.length === 0) {
    return { generated: 0, error: null };
  }

  const subjectIds = semesterSubjects.map((s) => s.id);

  // Is semester ke subjects ke liye timetable fetch karo
  const { data: timetableSlots, error: ttError } = await supabase
    .from("timetable")
    .select(
      `
      id,
      subject_id,
      start_time,
      end_time,
      room,
      created_at,
      subjects!inner (
        semester_id
      )
    `,
    )
    .eq("day_of_week", dayOfWeek)
    .eq("subjects.semester_id", semesterId);

  if (ttError) return { generated: 0, error: ttError.message };
  if (!timetableSlots || timetableSlots.length === 0) {
    return { generated: 0, error: null }; // No classes this day
  }

  // Is date ke already generated sessions laiye taaki duplicates na ho
  const { data: existingSessions } = await supabase
    .from("class_sessions")
    .select("timetable_id")
    .eq("date", date)
    .not("timetable_id", "is", null);

  const existingTimetableIds = new Set((existingSessions || []).map(s => s.timetable_id));

  // Sirf un timetable slots ko insert karo jo abhi tak generate nahi hue
  // AND ensure we don't back-fill classes into the past before the slot was created!
  const slotsToGenerate = timetableSlots.filter((slot) => {
    if (existingTimetableIds.has(slot.id)) return false;
    
    // Check back-fill protection! Do not generate a session for '2026-03-10' if
    // the admin only created this timetable slot on '2026-04-17'.
    const slotCreatedDate = new Date(slot.created_at as string).toLocaleDateString("en-CA");
    if (date < slotCreatedDate) {
      return false; // Skip back-filling ancient dates for newly created slots
    }
    
    return true;
  });

  if (slotsToGenerate.length === 0) {
    return { generated: 0, error: null }; // Sab kuch already generated hai
  }

  // Class sessions insert karo
  const sessionsToInsert = slotsToGenerate.map((slot) => ({
    timetable_id: slot.id,
    subject_id: slot.subject_id,
    date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: "scheduled" as const,
  }));

  const { error: insertError } = await supabase
    .from("class_sessions")
    .insert(sessionsToInsert);

  if (insertError) return { generated: 0, error: insertError.message };

  return { generated: sessionsToInsert.length, error: null };
}
