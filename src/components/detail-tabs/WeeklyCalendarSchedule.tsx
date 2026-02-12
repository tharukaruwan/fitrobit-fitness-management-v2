import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, X, Clock, Save, Repeat,
  ChevronLeft, ChevronRight, CalendarDays, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  addWeeks,
  differenceInCalendarWeeks,
  eachDayOfInterval,
} from "date-fns";

// ── Types & Constants ──

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5);

type DayName = (typeof DAYS_OF_WEEK)[number];

export interface ScheduleSlot {
  id: string;
  startDay: DayName;
  startHour: number;
  startMinute: number;
  endDay: DayName;
  endHour: number;
  endMinute: number;
  label?: string;
  color?: string;
  recurring?: boolean;
  startDate?: string;
  endDate?: string;
  // Rich metadata
  slotType?: "class" | "pt";
  title?: string;
  description?: string;
  notes?: string;
}

interface WeeklyCalendarScheduleProps {
  mode: "single-week" | "recurring";
  slots?: ScheduleSlot[];
  onSave?: (slots: ScheduleSlot[]) => void;
  entityType?: string;
}

const SLOT_COLORS = [
  "bg-primary/20 border-primary/40 text-primary",
  "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  "bg-violet-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300",
  "bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300",
];

const DOT_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h} ${ampm}`;
}

const timeOptions: { label: string; hour: number; minute: number }[] = [];
for (let h = 5; h <= 23; h++) {
  for (const m of [0, 30]) {
    timeOptions.push({ label: formatTime(h, m), hour: h, minute: m });
  }
}

function getDayIndex(day: DayName): number {
  return DAYS_OF_WEEK.indexOf(day);
}

function toDayName(date: Date): DayName {
  const idx = date.getDay();
  return DAYS_OF_WEEK[idx === 0 ? 6 : idx - 1];
}

function getSlotsForDate(slots: ScheduleSlot[], date: Date): ScheduleSlot[] {
  return slots.filter((s) => {
    if (!s.startDate || !s.endDate) return false;
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    return !(isAfter(dayStart, end) || isAfter(start, dayEnd));
  });
}

function getWeekDates(date: Date): Date[] {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// ── Default sample slots ──
function createDefaultDateSlots(): ScheduleSlot[] {
  const today = new Date();
  const weekDates = getWeekDates(today);

  const makeSlot = (dayIdx: number, sh: number, sm: number, eh: number, em: number, title: string, id: string, slotType: "class" | "pt"): ScheduleSlot => {
    const d = new Date(weekDates[dayIdx]);
    d.setHours(sh, sm, 0, 0);
    const e = new Date(weekDates[dayIdx]);
    e.setHours(eh, em, 0, 0);
    return {
      id, startDay: toDayName(d), startHour: sh, startMinute: sm,
      endDay: toDayName(e), endHour: eh, endMinute: em,
      label: title, title, slotType,
      startDate: d.toISOString(), endDate: e.toISOString(),
    };
  };

  return [
    makeSlot(0, 6, 0, 8, 0, "Morning Session", "d1", "class"),
    makeSlot(2, 18, 0, 20, 0, "Evening Session", "d2", "class"),
    makeSlot(4, 17, 0, 19, 30, "PT Session", "d3", "pt"),
  ];
}

const defaultDaySlots: ScheduleSlot[] = [
  { id: "1", startDay: "Monday", startHour: 6, startMinute: 0, endDay: "Monday", endHour: 8, endMinute: 0, label: "Morning Session" },
  { id: "2", startDay: "Monday", startHour: 18, startMinute: 0, endDay: "Monday", endHour: 20, endMinute: 0, label: "Evening Session" },
  { id: "3", startDay: "Wednesday", startHour: 6, startMinute: 0, endDay: "Wednesday", endHour: 8, endMinute: 0, label: "Morning Session" },
  { id: "4", startDay: "Friday", startHour: 17, startMinute: 0, endDay: "Friday", endHour: 19, endMinute: 30, label: "Afternoon Session" },
];

// ── Day-based Slot Drawer (single-week / Membership) ──
function DayBasedSlotDrawer({
  open, onOpenChange, slot, onSave, onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot?: ScheduleSlot;
  onSave: (slot: Omit<ScheduleSlot, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}) {
  const [startDay, setStartDay] = useState<DayName>(slot?.startDay || "Monday");
  const [startTime, setStartTime] = useState(`${slot?.startHour ?? 9}:${slot?.startMinute ?? 0}`);
  const [endDay, setEndDay] = useState<DayName>(slot?.endDay || "Monday");
  const [endTime, setEndTime] = useState(`${slot?.endHour ?? 10}:${slot?.endMinute ?? 0}`);
  const [label, setLabel] = useState(slot?.label || "");
  const [anyTime, setAnyTime] = useState(false);

  const handleSubmit = () => {
    const [sh, sm] = anyTime ? [5, 0] : startTime.split(":").map(Number);
    const [eh, em] = anyTime ? [23, 0] : endTime.split(":").map(Number);
    onSave({
      id: slot?.id,
      startDay: anyTime ? "Monday" : startDay, startHour: sh, startMinute: sm,
      endDay: anyTime ? "Sunday" : endDay, endHour: eh, endMinute: em,
      label: anyTime ? "Any Time" : label, recurring: false,
    });
    onOpenChange(false);
  };

  return (
    <QuickAddSheet
      open={open}
      onOpenChange={onOpenChange}
      title={slot ? "Edit Time Slot" : "Add Time Slot"}
      description={slot ? "Modify or delete this time slot" : "Add a new time slot to the weekly schedule"}
      onSubmit={handleSubmit}
      submitLabel={slot ? "Update Slot" : "Add Slot"}
    >
      <div className="flex items-center justify-between rounded-lg border p-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Any Time (Full week)</span>
        </div>
        <Switch checked={anyTime} onCheckedChange={setAnyTime} />
      </div>
      {!anyTime && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Day</label>
              <Select value={startDay} onValueChange={(v) => setStartDay(v as DayName)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS_OF_WEEK.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Time</label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{timeOptions.map((t) => <SelectItem key={`${t.hour}:${t.minute}`} value={`${t.hour}:${t.minute}`}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Day</label>
              <Select value={endDay} onValueChange={(v) => setEndDay(v as DayName)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS_OF_WEEK.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Time</label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{timeOptions.map((t) => <SelectItem key={`${t.hour}:${t.minute}`} value={`${t.hour}:${t.minute}`}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label (optional)</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Morning Session" className="h-9" />
          </div>
        </>
      )}

      {/* Delete Button */}
      {slot && onDelete && (
        <div className="pt-2 border-t">
          <Button variant="destructive" size="sm" className="w-full" onClick={() => { onDelete(slot.id); onOpenChange(false); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Slot
          </Button>
        </div>
      )}
    </QuickAddSheet>
  );
}

// ── Single-Week Calendar Grid (Membership) ──
function SingleWeekCalendarGrid({
  slots,
  selectedDay,
  onDayClick,
  onSlotClick,
}: {
  slots: ScheduleSlot[];
  selectedDay: DayName | null;
  onDayClick: (day: DayName) => void;
  onSlotClick: (slot: ScheduleSlot) => void;
}) {
  const today = new Date();
  const todayDay = toDayName(today);

  function getSlotsForDay(day: DayName): ScheduleSlot[] {
    return slots.filter((s) => {
      const si = getDayIndex(s.startDay);
      const ei = getDayIndex(s.endDay);
      const di = getDayIndex(day);
      return di >= si && di <= ei;
    });
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {DAY_SHORT.map((d) => (
          <div key={d} className="p-1.5 text-center border-r last:border-r-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === todayDay;
          const isSelected = selectedDay === day;
          const daySlots = getSlotsForDay(day);

          return (
            <div
              key={day}
              className={cn(
                "min-h-[80px] sm:min-h-[110px] border-r last:border-r-0 p-0.5 sm:p-1 cursor-pointer hover:bg-muted/40 transition-colors relative",
                isSelected && "bg-primary/10 ring-2 ring-inset ring-primary/40",
              )}
              onClick={() => onDayClick(day)}
            >
              <div className={cn(
                "text-[10px] sm:text-[11px] font-medium leading-none mb-0.5 sm:mb-1 w-5 h-5 flex items-center justify-center rounded-full mx-auto sm:mx-0",
                isToday && "bg-primary text-primary-foreground",
              )}>
                {day.slice(0, 1)}
              </div>

              {/* Mobile: dots */}
              {daySlots.length > 0 && (
                <div className="flex items-center justify-center gap-0.5 flex-wrap sm:hidden mt-0.5">
                  {daySlots.slice(0, 4).map((slot) => (
                    <span key={slot.id} className={cn("w-1.5 h-1.5 rounded-full", DOT_COLORS[slots.indexOf(slot) % DOT_COLORS.length])} />
                  ))}
                  {daySlots.length > 4 && <span className="text-[8px] text-muted-foreground font-medium">+{daySlots.length - 4}</span>}
                </div>
              )}

              {/* Desktop: slot cards */}
              <div className="hidden sm:block space-y-0.5">
                {daySlots.slice(0, 3).map((slot) => (
                  <button
                    key={slot.id}
                    className={cn("w-full text-left rounded-md px-1.5 py-0.5 text-[10px] leading-tight truncate block border transition-colors hover:shadow-sm", SLOT_COLORS[slots.indexOf(slot) % SLOT_COLORS.length])}
                    onClick={(ev) => { ev.stopPropagation(); onSlotClick(slot); }}
                  >
                    <span className="font-medium">{slot.label || formatTime(slot.startHour, slot.startMinute)}</span>
                    {slot.label !== "Any Time" && <span className="hidden md:inline text-muted-foreground ml-1">{formatTime(slot.startHour, slot.startMinute)}</span>}
                  </button>
                ))}
                {daySlots.length > 3 && <span className="text-[9px] text-primary font-medium px-1 cursor-pointer hover:underline">+{daySlots.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day Agenda for Single-Week (day-name based) ──
function WeekDayAgenda({
  dayName,
  slots,
  onSlotClick,
  onClose,
  onCreateSlot,
}: {
  dayName: DayName;
  slots: ScheduleSlot[];
  onSlotClick: (slot: ScheduleSlot) => void;
  onClose: () => void;
  onCreateSlot: () => void;
}) {
  const daySlots = slots.filter((s) => {
    const si = getDayIndex(s.startDay);
    const ei = getDayIndex(s.endDay);
    const di = getDayIndex(dayName);
    return di >= si && di <= ei;
  }).sort((a, b) => a.startHour - b.startHour || a.startMinute - b.startMinute);

  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b bg-muted/30">
        <div>
          <h4 className="text-sm font-semibold">{dayName}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">{daySlots.length} slot{daySlots.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-xs" onClick={onCreateSlot}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {daySlots.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No slots on this day</p>
        </div>
      ) : (
        <div className="divide-y">
          {daySlots.map((slot) => (
            <button
              key={slot.id}
              className="w-full text-left px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors flex items-start gap-3"
              onClick={() => onSlotClick(slot)}
            >
              {slot.label !== "Any Time" && (
                <div className="shrink-0 w-16 sm:w-20 pt-0.5">
                  <div className="text-xs font-semibold text-foreground">{formatTime(slot.startHour, slot.startMinute)}</div>
                  <div className="text-[10px] text-muted-foreground">{formatTime(slot.endHour, slot.endMinute)}</div>
                </div>
              )}
              <div className={cn("w-1 self-stretch rounded-full shrink-0", DOT_COLORS[slots.indexOf(slot) % DOT_COLORS.length])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{slot.label || "Untitled Slot"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {slot.label === "Any Time" ? "All day" : (slot.startDay === slot.endDay ? slot.startDay : `${slot.startDay} → ${slot.endDay}`)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Day Agenda Panel ──
function DayAgenda({
  date,
  slots,
  onSlotClick,
  onClose,
  onCreateSlot,
}: {
  date: Date;
  slots: ScheduleSlot[];
  onSlotClick: (slot: ScheduleSlot) => void;
  onClose: () => void;
  onCreateSlot: () => void;
}) {
  const daySlots = getSlotsForDate(slots, date).sort((a, b) => {
    const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
    return aStart - bStart;
  });

  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b bg-muted/30">
        <div>
          <h4 className="text-sm font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-xs" onClick={onCreateSlot}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {daySlots.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No slots on this day</p>
        </div>
      ) : (
        <div className="divide-y">
          {daySlots.map((slot, i) => {
            const s = slot.startDate ? new Date(slot.startDate) : null;
            const e = slot.endDate ? new Date(slot.endDate) : null;
            const colorClass = SLOT_COLORS[slots.indexOf(slot) % SLOT_COLORS.length];

            return (
              <button
                key={slot.id}
                className="w-full text-left px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors flex items-start gap-3"
                onClick={() => onSlotClick(slot)}
              >
                {/* Time indicator */}
                <div className="shrink-0 w-16 sm:w-20 pt-0.5">
                  {s && (
                    <div className="text-xs font-semibold text-foreground">
                      {formatTime(s.getHours(), s.getMinutes())}
                    </div>
                  )}
                  {e && (
                    <div className="text-[10px] text-muted-foreground">
                      {formatTime(e.getHours(), e.getMinutes())}
                    </div>
                  )}
                </div>

                {/* Color bar */}
                <div className={cn("w-1 self-stretch rounded-full shrink-0", DOT_COLORS[slots.indexOf(slot) % DOT_COLORS.length])} />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slot.title || slot.label || "Untitled Slot"}</p>
                  {slot.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{slot.description}</p>
                  )}
                  {slot.notes && (
                    <p className="text-[11px] text-muted-foreground/70 mt-1 italic line-clamp-1">{slot.notes}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Month Calendar Grid (Classes / PT) ──
function MonthCalendarGrid({
  currentMonth,
  slots,
  selectedDate,
  selectedWeekStart,
  onDayClick,
  onWeekSelect,
  onSlotClick,
}: {
  currentMonth: Date;
  slots: ScheduleSlot[];
  selectedDate: Date | null;
  selectedWeekStart: Date | null;
  onDayClick: (date: Date) => void;
  onWeekSelect: (weekStart: Date) => void;
  onSlotClick: (slot: ScheduleSlot) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const today = new Date();

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[32px_repeat(7,1fr)] sm:grid-cols-[40px_repeat(7,1fr)] border-b bg-muted/30">
        <div className="p-1.5 text-[10px] text-muted-foreground text-center border-r" />
        {DAY_SHORT.map((d, i) => (
          <div key={d} className="p-1.5 text-center border-r last:border-r-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => {
        const weekStart = week[0];
        const isWeekSelected = selectedWeekStart && isSameDay(weekStart, selectedWeekStart);

        return (
          <div key={wi} className={cn("grid grid-cols-[32px_repeat(7,1fr)] sm:grid-cols-[40px_repeat(7,1fr)] border-b last:border-b-0 transition-colors", isWeekSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20")}>
            <button
              className={cn(
                "flex items-center justify-center border-r hover:bg-primary/10 transition-colors",
                isWeekSelected && "bg-primary/10"
              )}
              onClick={() => onWeekSelect(weekStart)}
              title="Select this week to repeat"
            >
              <Repeat className={cn("w-3 h-3", isWeekSelected ? "text-primary" : "text-muted-foreground/40")} />
            </button>

            {week.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const daySlots = getSlotsForDate(slots, day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[60px] sm:min-h-[90px] md:min-h-[100px] border-r last:border-r-0 p-0.5 sm:p-1 cursor-pointer hover:bg-muted/40 transition-colors relative",
                    !inMonth && "opacity-40",
                    isSelected && "bg-primary/10 ring-2 ring-inset ring-primary/40",
                  )}
                  onClick={() => onDayClick(day)}
                >
                  {/* Date number */}
                  <div className={cn(
                    "text-[10px] sm:text-[11px] font-medium leading-none mb-0.5 sm:mb-1 w-5 h-5 flex items-center justify-center rounded-full mx-auto sm:mx-0",
                    isToday && "bg-primary text-primary-foreground",
                  )}>
                    {format(day, "d")}
                  </div>

                  {/* Mobile: colored dots */}
                  {daySlots.length > 0 && (
                    <div className="flex items-center justify-center gap-0.5 flex-wrap sm:hidden mt-0.5">
                      {daySlots.slice(0, 4).map((slot) => {
                        const dotColor = DOT_COLORS[slots.indexOf(slot) % DOT_COLORS.length];
                        return (
                          <span key={slot.id} className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                        );
                      })}
                      {daySlots.length > 4 && (
                        <span className="text-[8px] text-muted-foreground font-medium">+{daySlots.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Desktop: slot cards */}
                  <div className="hidden sm:block space-y-0.5">
                    {daySlots.slice(0, 3).map((slot) => {
                      const s = new Date(slot.startDate!);
                      const slotColor = SLOT_COLORS[slots.indexOf(slot) % SLOT_COLORS.length];

                      return (
                        <button
                          key={slot.id}
                          className={cn(
                            "w-full text-left rounded-md px-1.5 py-0.5 text-[10px] leading-tight truncate block border transition-colors hover:shadow-sm",
                            slotColor
                          )}
                          onClick={(ev) => { ev.stopPropagation(); onSlotClick(slot); }}
                        >
                          <span className="font-medium">
                            {slot.title || slot.label || formatTime(s.getHours(), s.getMinutes())}
                          </span>
                          <span className="hidden md:inline text-muted-foreground ml-1">
                            {formatTime(s.getHours(), s.getMinutes())}
                          </span>
                        </button>
                      );
                    })}
                    {daySlots.length > 3 && (
                      <span className="text-[9px] text-primary font-medium px-1 cursor-pointer hover:underline">
                        +{daySlots.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Slot Drawer (sidebar form for date-based slots) ──
function SlotDrawer({
  open,
  onOpenChange,
  slot,
  initialDate,
  onSave,
  onDelete,
  entityType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot?: ScheduleSlot;
  initialDate?: Date;
  onSave: (slot: Omit<ScheduleSlot, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  entityType?: string;
}) {
  const defaultDate = initialDate || new Date();
  const getInit = (dateStr?: string): Date => dateStr ? new Date(dateStr) : defaultDate;

  const resolvedSlotType: "class" | "pt" = entityType === "pt" ? "pt" : "class";
  const [startDate, setStartDate] = useState<Date>(getInit(slot?.startDate));
  const [startTime, setStartTime] = useState(`${slot?.startHour ?? 9}:${slot?.startMinute ?? 0}`);
  const [endDate, setEndDate] = useState<Date>(getInit(slot?.endDate));
  const [endTime, setEndTime] = useState(`${slot?.endHour ?? 10}:${slot?.endMinute ?? 0}`);
  const [title, setTitle] = useState(slot?.title || slot?.label || "");
  const [description, setDescription] = useState(slot?.description || "");
  const [notes, setNotes] = useState(slot?.notes || "");
  const [startCalOpen, setStartCalOpen] = useState(false);
  const [endCalOpen, setEndCalOpen] = useState(false);

  const handleSubmit = () => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const s = new Date(startDate); s.setHours(sh, sm, 0, 0);
    const e = new Date(endDate); e.setHours(eh, em, 0, 0);
    if (isAfter(s, e)) return;

    onSave({
      id: slot?.id,
      startDay: toDayName(s), startHour: sh, startMinute: sm,
      endDay: toDayName(e), endHour: eh, endMinute: em,
      label: title, title, description, notes,
      slotType: resolvedSlotType, recurring: false,
      startDate: s.toISOString(), endDate: e.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <QuickAddSheet
      open={open}
      onOpenChange={onOpenChange}
      title={slot ? "Edit Slot" : "Create Slot"}
      description={slot ? "Modify or delete this time slot" : "Add a new time slot to the schedule"}
      onSubmit={handleSubmit}
      submitLabel={slot ? "Update Slot" : "Create Slot"}
    >
      {/* Title */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title / Heading</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Morning Yoga Session" className="h-9" />
      </div>

      {/* Start Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label>
          <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-start text-sm font-normal">
                <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                {format(startDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={(d) => { if (d) { setStartDate(d); setStartCalOpen(false); } }} />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Time</label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{timeOptions.map((t) => <SelectItem key={`s${t.hour}:${t.minute}`} value={`${t.hour}:${t.minute}`}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* End Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
          <Popover open={endCalOpen} onOpenChange={setEndCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-start text-sm font-normal">
                <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                {format(endDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={(d) => { if (d) { setEndDate(d); setEndCalOpen(false); } }} disabled={(date) => isBefore(date, startDate)} />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Time</label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{timeOptions.map((t) => <SelectItem key={`e${t.hour}:${t.minute}`} value={`${t.hour}:${t.minute}`}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this slot..." className="min-h-[70px]" />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={`Specific notes for this ${resolvedSlotType === "class" ? "class" : "PT"} session...`} className="min-h-[70px]" />
      </div>

      {/* Delete Button */}
      {slot && onDelete && (
        <div className="pt-2 border-t">
          <Button variant="destructive" size="sm" className="w-full" onClick={() => { onDelete(slot.id); onOpenChange(false); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Slot
          </Button>
        </div>
      )}
    </QuickAddSheet>
  );
}

// ── Repeat Week Panel with Preview ──
function RepeatWeekPanel({
  weekLabel,
  weekStart,
  weekSlots,
  allSlots,
  onRepeat,
  onCancel,
}: {
  weekLabel: string;
  weekStart: Date;
  weekSlots: ScheduleSlot[];
  allSlots: ScheduleSlot[];
  onRepeat: (untilDate: Date, excludeIds: string[], previewExcludedIds: string[]) => void;
  onCancel: () => void;
}) {
  const [untilDate, setUntilDate] = useState<Date | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [showDetailedPreview, setShowDetailedPreview] = useState(false);
  const [previewExcluded, setPreviewExcluded] = useState<Set<string>>(new Set());

  const toggleExclude = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const includedSlots = weekSlots.filter(s => !excludedIds.has(s.id));

  // Generate full preview of all slots that will be created
  const generatedPreview = useMemo(() => {
    if (!untilDate || includedSlots.length === 0) return [];
    const totalWeeks = Math.max(0, differenceInCalendarWeeks(untilDate, weekStart, { weekStartsOn: 1 }));
    const result: { weekNum: number; weekLabel: string; slots: { id: string; title: string; day: string; time: string; sourceId: string }[] }[] = [];

    for (let w = 1; w <= totalWeeks; w++) {
      const weekSlotEntries: { id: string; title: string; day: string; time: string; sourceId: string }[] = [];
      includedSlots.forEach((slot) => {
        if (!slot.startDate || !slot.endDate) return;
        const ns = addWeeks(new Date(slot.startDate), w);
        if (isAfter(ns, untilDate)) return;
        const ne = addWeeks(new Date(slot.endDate), w);
        const slotId = `preview-${w}-${slot.id}`;
        weekSlotEntries.push({
          id: slotId,
          title: slot.title || slot.label || "Untitled",
          day: format(ns, "EEE, MMM d"),
          time: `${formatTime(ns.getHours(), ns.getMinutes())} – ${formatTime(ne.getHours(), ne.getMinutes())}`,
          sourceId: slot.id,
        });
      });
      if (weekSlotEntries.length > 0) {
        const wStart = addWeeks(weekStart, w);
        result.push({
          weekNum: w,
          weekLabel: `${format(wStart, "MMM d")} – ${format(addDays(wStart, 6), "MMM d")}`,
          slots: weekSlotEntries,
        });
      }
    }
    return result;
  }, [untilDate, includedSlots, weekStart]);

  const totalPreviewSlots = generatedPreview.reduce((sum, w) => sum + w.slots.filter(s => !previewExcluded.has(s.id)).length, 0);

  const togglePreviewExclude = (id: string) => {
    setPreviewExcluded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!untilDate) return;
    // Convert preview exclusions back to source slot exclusions per-week isn't possible with current onRepeat signature,
    // so we filter and create slots directly here
    onRepeat(untilDate, Array.from(excludedIds), Array.from(previewExcluded));
  };

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Repeat Week Schedule</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Repeating slots from <span className="font-medium text-foreground">{weekLabel}</span>. Deselect any slots you don't want to repeat.
      </p>

      {/* Source slot selection */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {weekSlots.map((slot) => {
          const isIncluded = !excludedIds.has(slot.id);
          const sd = new Date(slot.startDate!);
          return (
            <label
              key={slot.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors",
                isIncluded ? "bg-muted/30 border-border" : "bg-muted/10 border-border/30 opacity-50"
              )}
            >
              <Checkbox checked={isIncluded} onCheckedChange={() => toggleExclude(slot.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{slot.title || slot.label || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(sd, "EEE")} {formatTime(slot.startHour, slot.startMinute)} – {formatTime(slot.endHour, slot.endMinute)}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Repeat until date */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Repeat until</label>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 w-full justify-start text-sm font-normal">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              {untilDate ? format(untilDate, "MMM d, yyyy") : "Select end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={untilDate} onSelect={(d) => { if (d) { setUntilDate(d); setCalOpen(false); setShowDetailedPreview(false); setPreviewExcluded(new Set()); } }} disabled={(date) => isBefore(date, new Date())} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Preview summary & toggle */}
      {untilDate && generatedPreview.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground mb-0.5">Preview Summary</p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{includedSlots.length}</span> slot{includedSlots.length !== 1 ? "s" : ""} × <span className="font-semibold text-foreground">{generatedPreview.length}</span> week{generatedPreview.length !== 1 ? "s" : ""} = <span className="font-semibold text-primary">{totalPreviewSlots}</span> new slot{totalPreviewSlots !== 1 ? "s" : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setShowDetailedPreview(!showDetailedPreview)}>
                {showDetailedPreview ? "Hide Details" : "View All Slots"}
              </Button>
            </div>
          </div>

          {/* Detailed slot-by-slot preview grouped by week */}
          {showDetailedPreview && (
            <div className="rounded-lg border bg-background max-h-[300px] overflow-y-auto">
              {generatedPreview.map((week) => (
                <div key={week.weekNum} className="border-b last:border-b-0">
                  <div className="px-3 py-2 bg-muted/30 sticky top-0 z-10">
                    <p className="text-[11px] font-semibold text-foreground">Week {week.weekNum}: {week.weekLabel}</p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {week.slots.map((slot) => {
                      const isExcluded = previewExcluded.has(slot.id);
                      return (
                        <label
                          key={slot.id}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors",
                            isExcluded && "opacity-40 bg-muted/10"
                          )}
                        >
                          <Checkbox checked={!isExcluded} onCheckedChange={() => togglePreviewExclude(slot.id)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate">{slot.title}</p>
                            <p className="text-[10px] text-muted-foreground">{slot.day} · {slot.time}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" className="h-8" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="h-8" disabled={!untilDate || totalPreviewSlots === 0} onClick={handleConfirm}>
          <Repeat className="w-3.5 h-3.5 mr-1" /> Confirm ({totalPreviewSlots} slots)
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──
export function WeeklyCalendarSchedule({
  mode,
  slots: initialSlots,
  onSave,
  entityType = "program",
}: WeeklyCalendarScheduleProps) {
  const { toast } = useToast();
  const isDateMode = mode === "recurring";

  const [slots, setSlots] = useState<ScheduleSlot[]>(
    initialSlots || (isDateMode ? createDefaultDateSlots() : defaultDaySlots)
  );
  // Single-week mode states
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<DayName | null>(null);

  // Date mode states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSlot, setDrawerSlot] = useState<ScheduleSlot | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRepeat, setShowRepeat] = useState(false);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);

  const goToPrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleSaveAll = () => {
    onSave?.(slots);
    toast({ title: "Saved", description: "Schedule updated successfully." });
  };

  // Date-mode: add/update via drawer
  const handleDrawerSave = useCallback((slotData: Omit<ScheduleSlot, "id"> & { id?: string }) => {
    if (slotData.id) {
      setSlots((prev) => prev.map((s) => (s.id === slotData.id ? { ...slotData, id: s.id } as ScheduleSlot : s)));
    } else {
      setSlots((prev) => [...prev, { ...slotData, id: Date.now().toString() }]);
    }
    setDrawerSlot(undefined);
    setSelectedDate(null);
  }, []);

  const handleDeleteSlot = useCallback((slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  }, []);

  // Single-week mode: add/edit inline
  const handleAddSlot = useCallback((slotData: Omit<ScheduleSlot, "id"> & { id?: string }) => {
    if (slotData.id) {
      setSlots((prev) => prev.map((s) => (s.id === slotData.id ? { ...slotData, id: s.id } as ScheduleSlot : s)));
    } else {
      setSlots((prev) => [...prev, { ...slotData, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingSlot(undefined);
  }, []);

  const handleEditSlot = useCallback((slot: ScheduleSlot) => {
    if (isDateMode) {
      setDrawerSlot(slot);
      setDrawerOpen(true);
    } else {
      setEditingSlot(slot);
      setShowForm(true);
    }
  }, [isDateMode]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowRepeat(false);
  }, []);

  const handleCreateSlotClick = useCallback(() => {
    setDrawerSlot(undefined);
    setDrawerOpen(true);
  }, []);

  const handleWeekSelect = useCallback((weekStart: Date) => {
    setSelectedWeekStart((prev) => prev && isSameDay(prev, weekStart) ? null : weekStart);
  }, []);

  // Get slots for the selected week
  const selectedWeekSlots = useMemo(() => {
    if (!selectedWeekStart) return [];
    const weekEnd = addDays(selectedWeekStart, 6);
    weekEnd.setHours(23, 59, 59, 999);
    return slots.filter((s) => {
      if (!s.startDate) return false;
      const sd = new Date(s.startDate);
      return !isBefore(sd, selectedWeekStart) && !isAfter(sd, weekEnd);
    });
  }, [slots, selectedWeekStart]);

  const handleRepeatWeek = useCallback((untilDate: Date, excludeIds: string[], previewExcludedIds: string[]) => {
    if (!selectedWeekStart) return;

    const weekEnd = addDays(selectedWeekStart, 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekSlots = slots.filter((s) => {
      if (!s.startDate) return false;
      if (excludeIds.includes(s.id)) return false;
      const sd = new Date(s.startDate);
      return !isBefore(sd, selectedWeekStart) && !isAfter(sd, weekEnd);
    });

    if (weekSlots.length === 0) {
      toast({ title: "No slots", description: "No slots selected to repeat.", variant: "destructive" });
      return;
    }

    const totalWeeks = differenceInCalendarWeeks(untilDate, selectedWeekStart, { weekStartsOn: 1 });
    if (totalWeeks <= 0) {
      toast({ title: "Invalid date", description: "Select a date at least one week ahead.", variant: "destructive" });
      return;
    }

    const newSlots: ScheduleSlot[] = [];
    for (let w = 1; w <= totalWeeks; w++) {
      weekSlots.forEach((slot) => {
        if (!slot.startDate || !slot.endDate) return;
        const ns = addWeeks(new Date(slot.startDate), w);
        const ne = addWeeks(new Date(slot.endDate), w);
        if (isAfter(ns, untilDate)) return;

        const previewId = `preview-${w}-${slot.id}`;
        if (previewExcludedIds.includes(previewId)) return;

        newSlots.push({
          ...slot,
          id: `${Date.now()}-${w}-${slot.id}`,
          startDate: ns.toISOString(),
          endDate: ne.toISOString(),
          startDay: toDayName(ns),
          endDay: toDayName(ne),
          startHour: ns.getHours(),
          startMinute: ns.getMinutes(),
          endHour: ne.getHours(),
          endMinute: ne.getMinutes(),
        });
      });
    }

    setSlots((prev) => [...prev, ...newSlots]);
    setShowRepeat(false);
    setSelectedWeekStart(null);
    toast({ title: "Repeated", description: `Added ${newSlots.length} slots across ${totalWeeks} week(s).` });
  }, [slots, selectedWeekStart, toast]);

  const selectedWeekLabel = selectedWeekStart
    ? `${format(selectedWeekStart, "MMM d")} – ${format(addDays(selectedWeekStart, 6), "MMM d, yyyy")}`
    : "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">{isDateMode ? "Schedule Calendar" : "Weekly Schedule"}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isDateMode
              ? `Click a date to select it, then "Create Slot" to add. Click ⟳ on a week row to repeat.`
              : `Click a day to view its agenda and add slots.`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
        </div>
      </div>

      {/* Month Navigation (date mode) */}
      {isDateMode && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
            <Button variant="outline" size="sm" className="h-6 text-[11px] px-2" onClick={goToToday}>Today</Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Selected date indicator - compact bar */}
      {isDateMode && selectedDate && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-primary font-medium">
              Selected: {format(selectedDate, "EEEE, MMM d, yyyy")}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedDate(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Selected week indicator */}
      {isDateMode && selectedWeekStart && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-primary font-medium">
              Week selected: {selectedWeekLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="h-7 text-xs" onClick={() => { setShowRepeat(true); }}>
              <Repeat className="w-3.5 h-3.5 mr-1" /> Repeat Week
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedWeekStart(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Selected day indicator (single-week mode) */}
      {!isDateMode && selectedDay && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-primary font-medium">
              Selected: {selectedDay}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="h-7 text-xs" onClick={() => { setEditingSlot(undefined); setShowForm(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Slot
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedDay(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Slot count */}
      {isDateMode && slots.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground font-medium">{slots.length} slot{slots.length !== 1 ? "s" : ""} total</span>
        </div>
      )}
      {!isDateMode && slots.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {slots.map((slot, i) => {
            const colorClass = SLOT_COLORS[i % SLOT_COLORS.length];
            const sameDay = slot.startDay === slot.endDay;
            const timeLabel = slot.label === "Any Time" ? "Any Time"
              : sameDay
                ? `${DAY_SHORT[getDayIndex(slot.startDay)]} ${formatTime(slot.startHour, slot.startMinute)} – ${formatTime(slot.endHour, slot.endMinute)}`
                : `${DAY_SHORT[getDayIndex(slot.startDay)]} ${formatTime(slot.startHour, slot.startMinute)} → ${DAY_SHORT[getDayIndex(slot.endDay)]} ${formatTime(slot.endHour, slot.endMinute)}`;
            return (
              <Badge key={slot.id} variant="outline" className={cn("text-[11px] px-2 py-1 gap-1 cursor-pointer group border", colorClass)} onClick={() => handleEditSlot(slot)}>
                <span className="truncate max-w-[200px]">{slot.label ? `${slot.label}: ` : ""}{timeLabel}</span>
                <button className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}


      {/* Repeat Week Panel */}
      {showRepeat && isDateMode && selectedWeekStart && (
        <RepeatWeekPanel
          weekLabel={selectedWeekLabel}
          weekStart={selectedWeekStart}
          weekSlots={selectedWeekSlots}
          allSlots={slots}
          onRepeat={handleRepeatWeek}
          onCancel={() => setShowRepeat(false)}
        />
      )}

      {/* Calendar Grid */}
      {isDateMode ? (
        <MonthCalendarGrid
          currentMonth={currentMonth}
          slots={slots}
          selectedDate={selectedDate}
          selectedWeekStart={selectedWeekStart}
          onDayClick={handleDayClick}
          onWeekSelect={handleWeekSelect}
          onSlotClick={handleEditSlot}
        />
      ) : (
        <SingleWeekCalendarGrid
          slots={slots}
          selectedDay={selectedDay}
          onDayClick={(day) => setSelectedDay(day)}
          onSlotClick={handleEditSlot}
        />
      )}

      {/* Day Agenda (expanded view for selected date) */}
      {isDateMode && selectedDate && (
        <DayAgenda
          date={selectedDate}
          slots={slots}
          onSlotClick={handleEditSlot}
          onClose={() => setSelectedDate(null)}
          onCreateSlot={handleCreateSlotClick}
        />
      )}

      {/* Day Agenda for single-week mode */}
      {!isDateMode && selectedDay && (
        <WeekDayAgenda
          dayName={selectedDay}
          slots={slots}
          onSlotClick={handleEditSlot}
          onClose={() => setSelectedDay(null)}
          onCreateSlot={() => { setEditingSlot(undefined); setShowForm(true); }}
        />
      )}

      {/* Slot Drawer (single-week mode) */}
      {!isDateMode && (
        <DayBasedSlotDrawer
          open={showForm}
          onOpenChange={(open) => { setShowForm(open); if (!open) setEditingSlot(undefined); }}
          slot={editingSlot}
          onSave={handleAddSlot}
          onDelete={handleDeleteSlot}
        />
      )}

      {slots.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No time slots configured</p>
          <p className="text-xs mt-1">{isDateMode ? "Click a date and then \"Create Slot\" to get started" : "Click a day to get started"}</p>
        </div>
      )}

      {/* Slot Drawer (date mode only) */}
      {isDateMode && (
        <SlotDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          slot={drawerSlot}
          initialDate={selectedDate || undefined}
          onSave={handleDrawerSave}
          onDelete={handleDeleteSlot}
          entityType={entityType}
        />
      )}
    </div>
  );
}
