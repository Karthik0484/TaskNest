import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import { toast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@/utils/supabaseCalendar";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  dateString: string;       // also include dateString for matching
  events: CalendarEvent[];
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Dynamically load tasks/events from the backend
  const { events, addEvent, updateEvent, refreshEvents } = useCalendar();

  // Group events by date string
  const eventMap: Record<string, typeof events> = {};
  for (const ev of events) {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    eventMap[ev.date].push(ev);
  }

  // Form state for adding a new event
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAddEvent = async () => {
    if (!selectedDate) return;
    if (!newTitle.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    await addEvent({
      title: newTitle,
      description: newDesc,
      date: selectedDate.toISOString().split('T')[0],
      completed: false,
    });
    setNewTitle("");
    setNewDesc("");
    setIsAddOpen(false);
    refreshEvents();
    toast({ title: "Event added!" });
  };

  // Mock data for tasks on specific dates
  // const taskData: Record<string, { id: number; title: string; completed: boolean; }[]> = {
  //   "2025-06-15": [
  //     { id: 1, title: "Team meeting", completed: true },
  //     { id: 2, title: "Code review", completed: true },
  //     { id: 3, title: "Update documentation", completed: false },
  //   ],
  //   "2025-06-16": [
  //     { id: 4, title: "Design mockups", completed: true },
  //   ],
  //   "2025-06-18": [
  //     { id: 5, title: "Client presentation", completed: false },
  //     { id: 6, title: "Deploy to staging", completed: true },
  //   ],
  // };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startCalendar = new Date(firstDayOfMonth);
    const endCalendar = new Date(lastDayOfMonth);

    // Start from the beginning of the week
    startCalendar.setDate(startCalendar.getDate() - startCalendar.getDay());
    // End at the end of the week
    endCalendar.setDate(endCalendar.getDate() + (6 - endCalendar.getDay()));

    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startCalendar);

    while (currentDateIter <= endCalendar) {
      const dateString = currentDateIter.toISOString().split('T')[0];
      days.push({
        date: currentDateIter.getDate(),
        isCurrentMonth: currentDateIter.getMonth() === month,
        dateString,
        events: eventMap[dateString] || [],
      });
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDateClick = (dayIndex: number) => {
    const days = getDaysInMonth(currentDate);
    const clickedDay = days[dayIndex];
    if (clickedDay.isCurrentMonth) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), clickedDay.date);
      setSelectedDate(clickedDate);
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Calendar View</h2>
        <p className="text-slate-600">Track your task activity by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="text-blue-500" size={20} />
                  {formatDate(currentDate)}
                </CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft size={16} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigateMonth('next')}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day.isCurrentMonth && 
                    day.date === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();
                  
                  const isSelected = selectedDate &&
                    day.isCurrentMonth &&
                    day.date === selectedDate.getDate() &&
                    currentDate.getMonth() === selectedDate.getMonth() &&
                    currentDate.getFullYear() === selectedDate.getFullYear();

                  const completedEvents = day.events.filter(ev => ev.completed).length;
                  const totalEvents = day.events.length;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day.isCurrentMonth) setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date));
                      }}
                      className={`
                        p-2 h-20 text-left rounded-lg transition-all duration-200 relative
                        ${day.isCurrentMonth 
                          ? 'text-slate-800 hover:bg-blue-50 hover:border-blue-200' 
                          : 'text-slate-300'}
                        ${isToday ? 'bg-blue-100 border-2 border-blue-300' : 'border border-slate-200'}
                        ${isSelected ? 'bg-blue-600 text-white' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">{day.date}</div>
                      {totalEvents > 0 && (
                        <div className="absolute bottom-1 right-1">
                          <div className={`
                            text-xs px-1 py-0.5 rounded flex items-center gap-1
                            ${isSelected 
                              ? 'bg-white/20 text-white' 
                              : completedEvents === totalEvents 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          `}>
                            {completedEvents === totalEvents && <CheckCircle size={8} />}
                            {completedEvents}/{totalEvents}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Details Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Events for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Select a Date'
                }
              </CardTitle>
              <CardDescription>
                {selectedDate 
                  ? 'View events and activities for this date'
                  : 'Click on a calendar date to view events'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  <Button
                    size="sm"
                    className="mb-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsAddOpen(!isAddOpen)}
                  >
                    Add Event
                  </Button>
                  {isAddOpen && (
                    <div className="mb-2 space-y-2">
                      <input 
                        className="w-full border px-2 py-1 rounded"
                        placeholder="Event title"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                      />
                      <input 
                        className="w-full border px-2 py-1 rounded"
                        placeholder="Description (optional)"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                      />
                      <Button size="sm" onClick={handleAddEvent} className="bg-green-600 hover:bg-green-700">
                        Save
                      </Button>
                    </div>
                  )}
                  {(() => {
                    // Grab events for selectedDate
                    const dateString = selectedDate.toISOString().split('T')[0];
                    const dayEvents = eventMap[dateString] || [];
                    if (dayEvents.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500">
                          <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No events for this date</p>
                        </div>
                      );
                    }
                    return dayEvents.map(ev => (
                      <div key={ev.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle 
                          className={ev.completed ? 'text-green-500' : 'text-slate-300'} 
                          size={16} 
                        />
                        <span className={`text-sm ${ev.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                          {ev.title}
                        </span>
                        {ev.completed && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Done
                          </Badge>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Select a date from the calendar to view your events and activities.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats (static for now, can be wired to events if needed) */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Events</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {events.filter(e=>e.completed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Success Rate</span>
                  <span className="font-medium">
                    {events.length === 0 ? "0%" : `${Math.round(100 * events.filter(e=>e.completed).length / events.length)}%`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
