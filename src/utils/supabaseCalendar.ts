
import { supabase } from "@/integrations/supabase/client";

// Calendar event type
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  created_at: string;
}

export async function fetchCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  if (error) {
    console.error("Failed to fetch calendar events:", error);
    return [];
  }
  return data as CalendarEvent[];
}

export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id" | "user_id" | "created_at">
  , userId: string
): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from("calendar")
    .insert([{ ...event, user_id: userId }])
    .select()
    .single();
  if (error) {
    console.error("Failed to create event:", error);
    return null;
  }
  return data as CalendarEvent;
}

export async function updateCalendarEvent(
  id: string,
  updates: Partial<Omit<CalendarEvent, "id" | "user_id" | "created_at">>
): Promise<boolean> {
  const { error } = await supabase
    .from("calendar")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("Failed to update event:", error);
    return false;
  }
  return true;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("calendar")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Failed to delete event:", error);
    return false;
  }
  return true;
}
