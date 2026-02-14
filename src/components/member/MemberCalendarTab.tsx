import * as React from "react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isAfter } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, 
  Trash2, ChevronRight as ChevronRightIcon, Loader2
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
  // --- State Management ---
  const [events, setEvents] = React.useState<MemberCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<Date>(new Date());
  const [calendarFilterType, setCalendarFilterType] = React.useState("all");
  
  // UI State
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<MemberCalendarEvent | null>(null);
  const [showAddTarget, setShowAddTarget] = React.useState(false);
  const [showLogProgress, setShowLogProgress] = React.useState(false);
  
  // Form State
  const [newTargetCategory, setNewTargetCategory] = React.useState<TargetCategory>("sleep");
  const [newTargetValue, setNewTargetValue] = React.useState("");
  const [newTargetDate, setNewTargetDate] = React.useState<Date>(new Date());
  const [editTargetActual, setEditTargetActual] = React.useState("");
  const [targetCalOpen, setTargetCalOpen] = React.useState(false);

  // --- API Integration Point ---
  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // REPLACE THIS with: const response = await fetch('/api/events');
      const data = generateSampleData(); 
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logic Helpers ---
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
      id: Math.random().toString(), // API will provide real ID
      title: `${category?.label}: ${newTargetValue}`,
      start: newTargetDate,
      type: "target",
      color: "bg-emerald-500",
      targetCategory: newTargetCategory,
      targetValue: Number(newTargetValue),
      targetUnit: category?.unit,
      status: "scheduled"
    };

    // OPTIONAL: API POST here
    setEvents(prev => [...prev, newTarget]);
    setShowAddTarget(false);
    setNewTargetValue("");
  };

  // --- Calendar Grid Calculation ---
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
        <p className="text-muted-foreground animate-pulse">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Event Detail Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-md rounded-xl">
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
                  
                  {selectedEvent.actualValue !== undefined && !showLogProgress && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>Current Progress</span>
                         <span>{Math.round((selectedEvent.actualValue / (selectedEvent.targetValue || 1)) * 100)}%</span>
                       </div>
                       <Progress value={(selectedEvent.actualValue / (selectedEvent.targetValue || 1)) * 100} className="h-2 rounded-full" />
                    </div>
                  )}

                  {!showLogProgress ? (
                    <Button variant="outline" className="w-full rounded-lg" onClick={() => setShowLogProgress(true)}>Log Progress</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input type="number" className="rounded-lg" placeholder="Actual value" value={editTargetActual} onChange={(e) => setEditTargetActual(e.target.value)} />
                      <Button className="rounded-lg" onClick={() => {
                         setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, actualValue: Number(editTargetActual), status: "completed" } : e));
                         setShowEventModal(false);
                      }}>Save</Button>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-destructive rounded-lg hover:text-destructive hover:bg-destructive/10" onClick={() => { setEvents(events.filter(e => e.id !== selectedEvent.id)); setShowEventModal(false); }}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Target
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Button variant={calendarFilterType === "all" ? "default" : "outline"} size="sm" className="rounded-lg" onClick={() => setCalendarFilterType("all")}>All</Button>
          {memberEventTypes.map(t => (
            <Button key={t.value} variant={calendarFilterType === t.value ? "default" : "outline"} size="sm" className="rounded-lg" onClick={() => setCalendarFilterType(t.value)}>
              <div className={cn("w-2 h-2 rounded-full mr-2", t.color)} /> {t.label}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAddTarget(true)} className="shrink-0 rounded-lg"><Plus className="w-4 h-4 mr-1" /> Add Target</Button>
      </div>

      {/* 3. Calendar Grid */}
      <Card className="rounded-xl overflow-hidden shadow-sm border-muted">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">{format(calendarMonth, "MMMM yyyy")}</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg font-medium" onClick={() => {setCalendarMonth(new Date()); setSelectedCalendarDate(new Date())}}>Today</Button>
              <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r border-muted" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border border border-muted rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="bg-muted/40 p-2.5 text-center text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{d}</div>
            ))}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedCalendarDate);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} onClick={() => setSelectedCalendarDate(day)} className={cn(
                  "min-h-[90px] bg-card p-1.5 cursor-pointer transition-all hover:bg-muted/30",
                  !isSameMonth(day, calendarMonth) && "bg-muted/10 opacity-30",
                  isSelected && "ring-2 ring-primary ring-inset z-10"
                )}>
                  <div className={cn(
                    "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1",
                    isToday ? "bg-primary text-white" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} onClick={(ev) => handleEventClick(e, ev)} className={cn("text-[10px] px-2 py-1 rounded-lg truncate text-white font-bold shadow-sm", e.color)}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[9px] text-muted-foreground font-bold pl-1">+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Selected Date Detail List */}
      <Card className="rounded-xl border-muted">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> 
              Activities for {format(selectedCalendarDate, "MMMM d, yyyy")}
            </h4>
            <span className="text-xs bg-primary/10 px-3 py-1 rounded-full text-primary font-bold">
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDayEvents.length > 0 ? selectedDayEvents.map(e => (
              <div key={e.id} onClick={() => handleEventClick(e)} className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-muted transition-all cursor-pointer">
                <div className={cn("w-1.5 h-10 rounded-full shrink-0", e.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{e.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {e.time || "Daily Goal"}
                  </p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
              </div>
            )) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10">
                <p className="text-sm text-muted-foreground font-medium">No scheduled activities for this date.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Add Target Sheet */}
      <QuickAddSheet open={showAddTarget} onOpenChange={setShowAddTarget} title="Set Member Target" onSubmit={handleAddTarget}>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground ml-1">Date</Label>
            <Popover open={targetCalOpen} onOpenChange={setTargetCalOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-11 rounded-xl">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {format(newTargetDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden" align="start">
                <Calendar mode="single" selected={newTargetDate} onSelect={(d) => { if(d){setNewTargetDate(d); setTargetCalOpen(false)}} } />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground ml-1">Activity</Label>
            <Select value={newTargetCategory} onValueChange={(v) => setNewTargetCategory(v as any)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {TARGET_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="rounded-lg">{c.label} ({c.unit})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground ml-1">Daily Goal</Label>
            <div className="relative">
              <Input type="number" placeholder="0.00" className="h-11 pr-16 rounded-xl" value={newTargetValue} onChange={e => setNewTargetValue(e.target.value)} />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                {TARGET_CATEGORIES.find(c => c.value === newTargetCategory)?.unit}
              </div>
            </div>
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}

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