
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent,
} from "@/utils/supabaseCalendar";

// Context types
interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id" | "user_id" | "created_at">) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, "id" | "user_id" | "created_at">>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const refreshEvents = async () => {
    if (!user?.id) {
      setEvents([]);
      return;
    }
    const data = await fetchCalendarEvents(user.id);
    setEvents(data);
  };

  useEffect(() => {
    refreshEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addEvent = async (event: Omit<CalendarEvent, "id" | "user_id" | "created_at">) => {
    if (!user?.id) return null;
    const created = await createCalendarEvent(event, user.id);
    if (created) setEvents(prev => [created, ...prev]);
    return created;
  };

  const updateEvent = async (id: string, updates: Partial<Omit<CalendarEvent, "id" | "user_id" | "created_at">>) => {
    const ok = await updateCalendarEvent(id, updates);
    if (ok) {
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
    }
    return ok;
  };

  const deleteEvent = async (id: string) => {
    const ok = await deleteCalendarEvent(id);
    if (ok) setEvents(prev => prev.filter(ev => ev.id !== id));
    return ok;
  };

  return (
    <CalendarContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, refreshEvents }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used inside CalendarProvider");
  return ctx;
};
