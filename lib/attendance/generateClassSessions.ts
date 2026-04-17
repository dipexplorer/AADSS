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
  const slotsToGenerate = timetableSlots.filter(
    slot => !existingTimetableIds.has(slot.id)
  );

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
