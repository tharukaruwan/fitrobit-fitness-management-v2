import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { FilterBar } from "@/components/ui/filter-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Calendar, Users, MapPin, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color: string;
  description?: string;
  location?: string;
  type: string;
  instructor?: string;
}

const eventTypes = [
  { value: "class", label: "Class", color: "bg-primary" },
  { value: "appointment", label: "Appointment", color: "bg-warning" },
  { value: "meeting", label: "Meeting", color: "bg-blue-500" },
  { value: "maintenance", label: "Maintenance", color: "bg-purple-500" },
  { value: "other", label: "Other", color: "bg-muted-foreground" },
];

const getColorClass = (type: string) => {
  return eventTypes.find((t) => t.value === type)?.color || "bg-muted-foreground";
};

// Generate sample events including some days with many events
const generateSampleEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [];
  
  // Regular events
  events.push(
    {
      id: "1",
      title: "Morning Yoga",
      start: today,
      color: "bg-primary",
      type: "class",
      description: "Beginner-friendly yoga session",
      location: "Studio A",
      instructor: "Sarah Johnson",
    },
    {
      id: "2",
      title: "HIIT Training",
      start: today,
      color: "bg-destructive",
      type: "class",
      description: "High intensity interval training",
      location: "Main Floor",
      instructor: "Mike Thompson",
    },
    {
      id: "3",
      title: "Personal Training",
      start: new Date(Date.now() + 86400000),
      color: "bg-warning",
      type: "appointment",
      description: "One-on-one training session",
      location: "Training Room 2",
      instructor: "David Lee",
    },
    {
      id: "4",
      title: "Staff Meeting",
      start: new Date(Date.now() + 172800000),
      color: "bg-blue-500",
      type: "meeting",
      description: "Weekly staff sync",
      location: "Conference Room",
    }
  );

  // Add more events to today to simulate a busy day
  for (let i = 5; i <= 15; i++) {
    events.push({
      id: String(i),
      title: `Class Session ${i - 4}`,
      start: today,
      color: getColorClass(["class", "appointment", "meeting"][i % 3]),
      type: ["class", "appointment", "meeting"][i % 3],
      description: `Session description ${i}`,
      location: `Room ${i}`,
      instructor: `Instructor ${i}`,
    });
  }

  return events;
};

export default function CalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(generateSampleEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dayEventsDate, setDayEventsDate] = useState<Date | null>(null);

  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterInstructor, setFilterInstructor] = useState("all");

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    location: "",
    type: "class",
    instructor: "",
  });

  // Get unique instructors for filter
  const instructors = useMemo(() => {
    const uniqueInstructors = [...new Set(events.map(e => e.instructor).filter(Boolean))];
    return uniqueInstructors.map(i => ({ value: i!, label: i! }));
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchValue.toLowerCase());
      const matchesType = filterType === "all" || event.type === filterType;
      const matchesInstructor = filterInstructor === "all" || event.instructor === filterInstructor;
      return matchesSearch && matchesType && matchesInstructor;
    });
  }, [events, searchValue, filterType, filterInstructor]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.start, day));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDateClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    setSelectedDate(day);
    
    if (dayEvents.length > 3) {
      setDayEventsDate(day);
      setShowDayEventsModal(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedEvent(event);
    setShowViewModal(true);
    setShowDayEventsModal(false);
  };

  const handleOpenAddSheet = () => {
    setNewEvent({
      title: "",
      date: selectedDate || new Date(),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      location: "",
      type: "class",
      instructor: "",
    });
    setShowAddSheet(true);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event title",
        variant: "destructive",
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      start: newEvent.date,
      color: getColorClass(newEvent.type),
      type: newEvent.type,
      description: newEvent.description,
      location: newEvent.location,
      instructor: newEvent.instructor,
    };

    setEvents([...events, event]);
    setShowAddSheet(false);
    setNewEvent({
      title: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      location: "",
      type: "class",
      instructor: "",
    });

    toast({
      title: "Event created",
      description: `"${event.title}" has been added to the calendar`,
    });
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setShowViewModal(false);
      toast({
        title: "Event deleted",
        description: `"${selectedEvent.title}" has been removed`,
      });
    }
  };

  const filters = [
    {
      key: "type",
      label: "Event Type",
      value: filterType,
      onChange: setFilterType,
      options: eventTypes.map(t => ({ value: t.value, label: t.label })),
    },
    {
      key: "instructor",
      label: "Instructor",
      value: filterInstructor,
      onChange: setFilterInstructor,
      options: instructors,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Calendar & Scheduling</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage classes, appointments, and events
          </p>
        </div>
        <Button onClick={handleOpenAddSheet} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search events..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filters}
      />

      {/* Legend - Scrollable on mobile */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex gap-4 overflow-x-auto pb-1">
            {eventTypes.map((type) => (
              <div key={type.value} className="flex items-center gap-2 shrink-0">
                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                <span className="text-xs sm:text-sm text-muted-foreground">{type.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleToday} className="hidden sm:flex">
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-muted p-1.5 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasMoreEvents = dayEvents.length > 2;

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[60px] sm:min-h-[90px] bg-card p-1 cursor-pointer transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isSelected && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <div
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-0.5 w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mx-auto sm:mx-0",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  
                  {/* Events - Show dots on mobile, cards on desktop */}
                  <div className="hidden sm:block space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={cn(
                          "text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate text-white cursor-pointer hover:opacity-80",
                          event.color
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {hasMoreEvents && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDayEventsDate(day);
                          setShowDayEventsModal(true);
                        }}
                        className="text-[10px] sm:text-xs text-primary font-medium hover:underline w-full text-left px-0.5"
                      >
                        +{dayEvents.length - 2} more
                      </button>
                    )}
                  </div>

                  {/* Mobile: Show event dots */}
                  <div className="sm:hidden flex flex-wrap gap-0.5 justify-center mt-1">
                    {dayEvents.slice(0, 4).map((event) => (
                      <div
                        key={event.id}
                        className={cn("w-1.5 h-1.5 rounded-full", event.color)}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 4}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events - Responsive */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-2 sm:space-y-3">
            {filteredEvents
              .filter((e) => e.start >= new Date())
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className={cn("w-1.5 sm:w-2 h-8 sm:h-10 rounded-full shrink-0", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{event.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {format(event.start, "EEE, MMM d")}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
            {filteredEvents.filter((e) => e.start >= new Date()).length === 0 && (
              <p className="text-muted-foreground text-sm">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Event Sheet */}
      <QuickAddSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add New Event"
        description="Create a new calendar event"
        onSubmit={handleCreateEvent}
        submitLabel="Create Event"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select
              value={newEvent.type}
              onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", type.color)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={format(newEvent.date, "yyyy-MM-dd")}
              onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor/Host</Label>
            <Input
              id="instructor"
              placeholder="Enter instructor name"
              value={newEvent.instructor}
              onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </QuickAddSheet>

      {/* Day Events Modal - For days with many events */}
      <Dialog open={showDayEventsModal} onOpenChange={setShowDayEventsModal}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {dayEventsDate && format(dayEventsDate, "EEEE, MMMM d")}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {dayEventsDate && getEventsForDay(dayEventsDate).length} events
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2 py-2">
              {dayEventsDate && getEventsForDay(dayEventsDate).map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className={cn("w-2 h-10 rounded-full shrink-0", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.location && `${event.location}`}
                      {event.instructor && ` • ${event.instructor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="pt-4 border-t">
            <Button onClick={() => {
              if (dayEventsDate) setSelectedDate(dayEventsDate);
              setShowDayEventsModal(false);
              handleOpenAddSheet();
            }} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event for This Day
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Event Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", selectedEvent?.color)} />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{format(selectedEvent.start, "EEEE, MMMM d, yyyy")}</span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.instructor && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{selectedEvent.instructor}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDeleteEvent} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowViewModal(false)} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
