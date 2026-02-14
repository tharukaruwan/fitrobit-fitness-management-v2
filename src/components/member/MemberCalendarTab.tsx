import * as React from "react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, 
  Trash2, ChevronRight as ChevronRightIcon, Loader2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
const TARGET_CATEGORIES = [
  { value: "sleep", label: "Sleep", unit: "hours" },
  { value: "steps", label: "Step Count", unit: "steps" },
  { value: "water", label: "Water Intake", unit: "liters" },
  { value: "calories_burn", label: "Calories Burn", unit: "kcal" },
  { value: "workout", label: "Workout Duration", unit: "minutes" },
] as const;

type TargetCategory = typeof TARGET_CATEGORIES[number]["value"];

interface MemberCalendarEvent {
  id: string;
  title: string;
  start: Date;
  type: "attendance" | "pt_session" | "class" | "target" | "workout" | "diet";
  color: string;
  description?: string;
  time?: string;
  instructor?: string;
  status?: "completed" | "scheduled" | "cancelled";
  targetCategory?: TargetCategory;
  targetValue?: number;
  actualValue?: number;
  targetUnit?: string;
}

const memberEventTypes = [
  { value: "attendance", label: "Attendance", color: "bg-primary" },
  { value: "pt_session", label: "PT Session", color: "bg-warning" },
  { value: "class", label: "Class", color: "bg-purple-500" },
  { value: "target", label: "Target", color: "bg-emerald-500" },
  { value: "workout", label: "Workout Plan", color: "bg-orange-500" },
  { value: "diet", label: "Diet Plan", color: "bg-teal-500" },
];

export function MemberCalendarTab() {
  const [events, setEvents] = React.useState<MemberCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<Date>(new Date());
  const [calendarFilterType, setCalendarFilterType] = React.useState("all");
  
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<MemberCalendarEvent | null>(null);
  const [showAddTarget, setShowAddTarget] = React.useState(false);
  const [showLogProgress, setShowLogProgress] = React.useState(false);
  
  const [newTargetCategory, setNewTargetCategory] = React.useState<TargetCategory>("sleep");
  const [newTargetValue, setNewTargetValue] = React.useState("");
  const [newTargetDate, setNewTargetDate] = React.useState<Date>(new Date());
  const [editTargetActual, setEditTargetActual] = React.useState("");
  const [targetCalOpen, setTargetCalOpen] = React.useState(false);

  React.useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateSampleData(); 
      setEvents(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.start, date) && 
      (calendarFilterType === "all" || event.type === calendarFilterType)
    );
  };

  const handleEventClick = (event: MemberCalendarEvent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedEvent(event);
    setEditTargetActual(event.actualValue?.toString() || "");
    setShowLogProgress(false);
    setShowEventModal(true);
  };

  const handleAddTarget = async () => {
    const category = TARGET_CATEGORIES.find(c => c.value === newTargetCategory);
    const newTarget: MemberCalendarEvent = {
      id: Math.random().toString(),
      title: `${category?.label}: ${newTargetValue}`,
      start: newTargetDate,
      type: "target",
      color: "bg-emerald-500",
      targetCategory: newTargetCategory,
      targetValue: Number(newTargetValue),
      targetUnit: category?.unit,
      status: "scheduled"
    };
    setEvents(prev => [...prev, newTarget]);
    setShowAddTarget(false);
    setNewTargetValue("");
  };

  const start = startOfWeek(startOfMonth(calendarMonth));
  const end = endOfWeek(endOfMonth(calendarMonth));
  const calendarDays = [];
  let curr = start;
  while (curr <= end) { calendarDays.push(curr); curr = addDays(curr, 1); }

  const selectedDayEvents = getEventsForDay(selectedCalendarDate);

  if (isLoading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Detail Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>{selectedEvent?.title}</DialogTitle></DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className={cn("w-3 h-3 rounded-full", selectedEvent.color)} />
                <span className="text-sm capitalize font-medium">{selectedEvent.type.replace("_", " ")}</span>
                <StatusBadge status={selectedEvent.status === "completed" ? "success" : "info"} label={selectedEvent.status || "scheduled"} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1 pb-2 border-b">
                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />{format(selectedEvent.start, "PPPP")}</div>
                {selectedEvent.time && <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{selectedEvent.time}</div>}
              </div>
              {selectedEvent.type === "target" && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between text-sm"><span>Target Value:</span> <b>{selectedEvent.targetValue} {selectedEvent.targetUnit}</b></div>
                  {!showLogProgress ? (
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowLogProgress(true)}>Log Progress</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input type="number" className="rounded-xl" placeholder="Value" value={editTargetActual} onChange={(e) => setEditTargetActual(e.target.value)} />
                      <Button className="rounded-xl" onClick={() => setShowEventModal(false)}>Save</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Button variant={calendarFilterType === "all" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setCalendarFilterType("all")}>All</Button>
          {memberEventTypes.map(t => (
            <Button key={t.value} variant={calendarFilterType === t.value ? "default" : "outline"} size="sm" className="rounded-full shrink-0" onClick={() => setCalendarFilterType(t.value)}>
              <div className={cn("w-2 h-2 rounded-full mr-2", t.color)} /> {t.label}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAddTarget(true)} className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Target</Button>
      </div>

      {/* 3. Calendar Grid (With Adaptive Dots) */}
      <Card className="rounded-2xl overflow-hidden shadow-sm border-muted">
        <CardContent className="p-2 sm:p-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold">{format(calendarMonth, "MMMM yyyy")}</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex h-8 rounded-lg" onClick={() => setCalendarMonth(new Date())}>Today</Button>
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border border border-muted rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="bg-muted/40 p-2 text-center text-[10px] font-bold uppercase text-muted-foreground">
                <span className="sm:hidden">{d.charAt(0)}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedCalendarDate);
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => setSelectedCalendarDate(day)} 
                  className={cn(
                    "min-h-[60px] sm:min-h-[100px] bg-card p-1 sm:p-1.5 cursor-pointer transition-all hover:bg-muted/30",
                    !isSameMonth(day, calendarMonth) && "opacity-20",
                    isSelected && "ring-2 ring-primary ring-inset z-10"
                  )}
                >
                  <div className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    isToday ? "bg-primary text-white" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </div>

                  {/* Desktop View: Text Labels */}
                  <div className="hidden sm:block space-y-1">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} onClick={(ev) => handleEventClick(e, ev)} className={cn("text-[9px] px-1.5 py-0.5 rounded-md truncate text-white font-medium", e.color)}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[9px] text-muted-foreground font-bold pl-1">+{dayEvents.length - 3}</div>}
                  </div>

                  {/* Mobile View: Dots (Your Request) */}
                  <div className="flex sm:hidden flex-wrap gap-0.5 justify-center mt-1">
                    {dayEvents.slice(0, 4).map(e => (
                      <div key={e.id} className={cn("w-1.5 h-1.5 rounded-full", e.color)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Daily Agenda */}
      <Card className="rounded-2xl border-muted">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> {format(selectedCalendarDate, "MMMM d, yyyy")}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDayEvents.length > 0 ? selectedDayEvents.map(e => (
              <div key={e.id} onClick={() => handleEventClick(e)} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-muted transition-all cursor-pointer">
                <div className={cn("w-1.5 h-10 rounded-full shrink-0", e.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{e.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {e.time || "Goal"}
                  </p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
                <p className="text-xs text-muted-foreground font-medium">No events for this date.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Add Target Sheet */}
      <QuickAddSheet open={showAddTarget} onOpenChange={setShowAddTarget} title="Set Target" onSubmit={handleAddTarget}>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground ml-1">Date</Label>
            <Popover open={targetCalOpen} onOpenChange={setTargetCalOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left h-11 rounded-xl">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" /> {format(newTargetDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={newTargetDate} onSelect={(d) => { if(d){setNewTargetDate(d); setTargetCalOpen(false)}} } />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground ml-1">Activity</Label>
            <Select value={newTargetCategory} onValueChange={(v) => setNewTargetCategory(v as any)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {TARGET_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground ml-1">Goal Value</Label>
            <Input type="number" placeholder="0.00" className="h-11 rounded-xl" value={newTargetValue} onChange={e => setNewTargetValue(e.target.value)} />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}

// Keep the generateSampleData function as provided in previous code
const generateSampleData = (): MemberCalendarEvent[] => {
  const today = new Date();
  const events: MemberCalendarEvent[] = [];

  // Past attendances
  for (let i = 1; i <= 15; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i * 2);
    events.push({
      id: `att-${i}`,
      title: "Gym Visit",
      start: pastDate,
      type: "attendance",
      color: "bg-primary",
      time: "06:30 AM - 08:00 AM",
      status: "completed",
    });
  }

  // Scheduled PT sessions
  events.push(
    {
      id: "pt-1",
      title: "PT Session",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      type: "pt_session",
      color: "bg-warning",
      time: "10:00 AM",
      instructor: "Mike Johnson",
      status: "scheduled",
    },
    {
      id: "pt-2",
      title: "PT Session",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      type: "pt_session",
      color: "bg-warning",
      time: "10:00 AM",
      instructor: "Mike Johnson",
      status: "scheduled",
    },
    {
      id: "pt-3",
      title: "PT Session",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      type: "pt_session",
      color: "bg-warning",
      time: "10:00 AM",
      instructor: "Mike Johnson",
      status: "completed",
    }
  );

  // Scheduled classes
  events.push(
    {
      id: "class-1",
      title: "HIIT Class",
      start: today,
      type: "class",
      color: "bg-purple-500",
      time: "07:00 AM",
      instructor: "Sarah Wilson",
      status: "scheduled",
    },
    {
      id: "class-2",
      title: "Yoga Session",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      type: "class",
      color: "bg-purple-500",
      time: "08:00 AM",
      instructor: "Emma Davis",
      status: "scheduled",
    },
    {
      id: "class-3",
      title: "Spin Class",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
      type: "class",
      color: "bg-purple-500",
      time: "06:00 PM",
      instructor: "Lisa Park",
      status: "completed",
    }
  );

  // Sample targets
  for (let i = -5; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    events.push({
      id: `target-sleep-${i}`,
      title: "Sleep: 8 hours",
      start: d,
      type: "target",
      color: "bg-emerald-500",
      targetCategory: "sleep",
      targetValue: 8,
      targetUnit: "hours",
      actualValue: i < 0 ? parseFloat((6 + Math.random() * 3).toFixed(1)) : undefined,
      status: i < 0 ? ((6 + Math.random() * 3) >= 8 ? "completed" : "scheduled") : "scheduled",
    });
    events.push({
      id: `target-steps-${i}`,
      title: "Steps: 10,000",
      start: d,
      type: "target",
      color: "bg-emerald-500",
      targetCategory: "steps",
      targetValue: 10000,
      targetUnit: "steps",
      actualValue: i < 0 ? Math.floor(5000 + Math.random() * 10000) : undefined,
      status: i < 0 ? ((5000 + Math.random() * 10000) >= 10000 ? "completed" : "scheduled") : "scheduled",
    });
  }

  // Workout plan events (show each day the plan is active)
  const workoutStart = new Date(today);
  workoutStart.setDate(today.getDate() - 10);
  const workoutEnd = new Date(today);
  workoutEnd.setDate(today.getDate() + 20);
  let wd = new Date(workoutStart);
  while (wd <= workoutEnd) {
    events.push({
      id: `workout-${wd.getTime()}`,
      title: "Strength Training Plan",
      start: new Date(wd),
      type: "workout",
      color: "bg-orange-500",
      description: `${format(workoutStart, "MMM d")} – ${format(workoutEnd, "MMM d")} • Assigned by Mike Johnson`,
      status: wd < today ? "completed" : "scheduled",
    });
    wd = new Date(wd);
    wd.setDate(wd.getDate() + 1);
  }

  // Diet plan events
  const dietStart = new Date(today);
  dietStart.setDate(today.getDate() - 7);
  const dietEnd = new Date(today);
  dietEnd.setDate(today.getDate() + 23);
  let dd = new Date(dietStart);
  while (dd <= dietEnd) {
    events.push({
      id: `diet-${dd.getTime()}`,
      title: "High Protein Diet",
      start: new Date(dd),
      type: "diet",
      color: "bg-teal-500",
      description: `${format(dietStart, "MMM d")} – ${format(dietEnd, "MMM d")} • 2,500 kcal/day`,
      status: dd < today ? "completed" : "scheduled",
    });
    dd = new Date(dd);
    dd.setDate(dd.getDate() + 1);
  }

  return events; 
};