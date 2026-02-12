import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import {
  DetailPageTemplate,
  DetailTab,
  SectionHeader,
} from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import {
  Layers,
  Info,
  CalendarCheck,
  ListChecks,
  Plus,
  Trash2,
  Eye,
  Users,
  Clock,
  MapPin,
  Save,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateRangeFields } from "@/components/ui/date-range-fields";

// ── Types ──

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  instructor: string;
  price: number;
  status: "available" | "full" | "closed";
}

interface Booking {
  id: string;
  memberName: string;
  instructor: string;
  date: string;
  timeSlot: string;
  duration: string;
  participants: number;
  price: number;
  notes: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  slotId?: string;
}

const statusMap: Record<Booking["status"], "success" | "warning" | "error" | "info"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  completed: "info",
};

// ── Sample Data ──

const sectionsData: Record<string, {
  name: string; description: string; location: string; maxCapacity: number;
  status: "active" | "inactive"; color: string; operatingHours: string;
  pricePerSlot: number; instructor: string; rules: string;
}> = {
  "sec-1": { name: "Shooting Range", description: "Indoor shooting range with 10 lanes. Professional equipment available for rent.", location: "Building A, Ground Floor", maxCapacity: 10, status: "active", color: "#3b82f6", operatingHours: "08:00 - 20:00", pricePerSlot: 50, instructor: "Mike Johnson", rules: "Safety gear mandatory. No children under 16. Follow instructor guidelines at all times." },
  "sec-2": { name: "Swimming Pool", description: "Olympic-size swimming pool with 8 lanes. Heated year-round.", location: "Building B", maxCapacity: 30, status: "active", color: "#06b6d4", operatingHours: "06:00 - 22:00", pricePerSlot: 25, instructor: "Anna Davis", rules: "Shower before entering. No diving in shallow end. Swim cap required." },
  "sec-3": { name: "Tennis Court", description: "2 outdoor tennis courts with floodlights for evening play.", location: "Outdoor Area", maxCapacity: 4, status: "active", color: "#10b981", operatingHours: "07:00 - 21:00", pricePerSlot: 40, instructor: "Carlos Martinez", rules: "Appropriate footwear required. Book max 2 consecutive hours. Return equipment after use." },
  "sec-4": { name: "Sauna", description: "Finnish sauna and steam room with relaxation area.", location: "Building A, 2nd Floor", maxCapacity: 8, status: "inactive", color: "#f59e0b", operatingHours: "10:00 - 20:00", pricePerSlot: 30, instructor: "—", rules: "Towels required. Max 30 minutes per session. Stay hydrated." },
  "sec-5": { name: "Boxing Ring", description: "Professional boxing ring with bags, gloves, and training equipment.", location: "Building C", maxCapacity: 6, status: "active", color: "#ef4444", operatingHours: "08:00 - 21:00", pricePerSlot: 45, instructor: "James Thompson", rules: "Wraps and gloves mandatory. No sparring without instructor. Sign waiver before first session." },
};

const initialSlots: TimeSlot[] = [
  { id: "sl-1", date: "2026-02-12", time: "09:00", duration: "1 hour", capacity: 5, booked: 2, instructor: "Mike Johnson", price: 50, status: "available" },
  { id: "sl-2", date: "2026-02-12", time: "14:00", duration: "1 hour", capacity: 5, booked: 5, instructor: "Mike Johnson", price: 50, status: "full" },
  { id: "sl-3", date: "2026-02-13", time: "10:00", duration: "1.5 hours", capacity: 8, booked: 3, instructor: "Mike Johnson", price: 75, status: "available" },
  { id: "sl-4", date: "2026-02-14", time: "11:00", duration: "1 hour", capacity: 5, booked: 1, instructor: "Mike Johnson", price: 50, status: "available" },
  { id: "sl-5", date: "2026-02-15", time: "09:00", duration: "2 hours", capacity: 10, booked: 4, instructor: "Mike Johnson", price: 100, status: "available" },
  { id: "sl-6", date: "2026-02-11", time: "16:00", duration: "1 hour", capacity: 5, booked: 5, instructor: "Mike Johnson", price: 50, status: "full" },
];

const initialBookings: Booking[] = [
  { id: "bk-1", memberName: "John Smith", instructor: "Mike Johnson", date: "2026-02-12", timeSlot: "09:00", duration: "1 hour", participants: 2, price: 50, notes: "Beginner session", status: "confirmed", slotId: "sl-1" },
  { id: "bk-2", memberName: "Sarah Lee", instructor: "Mike Johnson", date: "2026-02-12", timeSlot: "14:00", duration: "1.5 hours", participants: 1, price: 75, notes: "", status: "pending", slotId: "sl-2" },
  { id: "bk-3", memberName: "David Wilson", instructor: "—", date: "2026-02-13", timeSlot: "10:00", duration: "2 hours", participants: 3, price: 100, notes: "Group booking", status: "confirmed", slotId: "sl-3" },
  { id: "bk-4", memberName: "Emily Brown", instructor: "Mike Johnson", date: "2026-02-11", timeSlot: "16:00", duration: "1 hour", participants: 1, price: 50, notes: "", status: "completed", slotId: "sl-6" },
  { id: "bk-5", memberName: "Mark Taylor", instructor: "—", date: "2026-02-10", timeSlot: "18:00", duration: "45 min", participants: 2, price: 50, notes: "Intermediate", status: "cancelled" },
  { id: "bk-6", memberName: "Lisa Chen", instructor: "Mike Johnson", date: "2026-02-14", timeSlot: "11:00", duration: "1 hour", participants: 1, price: 50, notes: "First time", status: "confirmed", slotId: "sl-4" },
  { id: "bk-7", memberName: "James Brown", instructor: "—", date: "2026-02-15", timeSlot: "09:00", duration: "1 hour", participants: 4, price: 200, notes: "Team event", status: "pending", slotId: "sl-5" },
];

const allTimeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const durationOptions = ["30 min", "45 min", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"];

// ── Calendar Helpers ──

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Component ──

export default function BookingDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const section = sectionsData[id || ""] || sectionsData["sec-1"];

  // ── Info State ──
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: section.name, description: section.description, location: section.location,
    maxCapacity: section.maxCapacity.toString(), operatingHours: section.operatingHours,
    pricePerSlot: section.pricePerSlot.toString(), instructor: section.instructor,
    rules: section.rules, status: section.status,
  });

  // ── Slots & Bookings State ──
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [bookingSearch, setBookingSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<TimeSlot | null>(null);

  const [bookingForm, setBookingForm] = useState({
    memberName: "", instructor: section.instructor, date: "", timeSlot: "", duration: "1 hour",
    participants: "1", price: section.pricePerSlot.toString(), notes: "",
  });

  const [slotForm, setSlotForm] = useState({
    time: "", duration: "1 hour", capacity: section.maxCapacity.toString(),
    instructor: section.instructor, price: section.pricePerSlot.toString(),
  });

  // ── Date Range & Pagination State ──
  const [bookingsStartDate, setBookingsStartDate] = useState<Date>(subDays(new Date(), 90));
  const [bookingsEndDate, setBookingsEndDate] = useState<Date>(new Date());
  const [revenueStartDate, setRevenueStartDate] = useState<Date>(subDays(new Date(), 90));
  const [revenueEndDate, setRevenueEndDate] = useState<Date>(new Date());
  const [bookingsPage, setBookingsPage] = useState(1);
  const [revenuePage, setRevenuePage] = useState(1);
  const bookingsPerPage = 5;

  // ── Calendar State ──
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);

  const slotsByDate = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    slots.forEach((s) => { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); });
    return map;
  }, [slots]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => { if (!map[b.date]) map[b.date] = []; map[b.date].push(b); });
    return map;
  }, [bookings]);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  const selectedDateSlots = selectedDate ? (slotsByDate[selectedDate] || []) : [];
  const selectedDateBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

  // ── Slot CRUD ──
  const handleCreateSlot = () => {
    if (!selectedDate || !slotForm.time) {
      toast({ title: "Missing fields", description: "Please select a date and time.", variant: "destructive" });
      return;
    }
    const newSlot: TimeSlot = {
      id: `sl-${Date.now()}`,
      date: selectedDate,
      time: slotForm.time,
      duration: slotForm.duration,
      capacity: Number(slotForm.capacity) || section.maxCapacity,
      booked: 0,
      instructor: slotForm.instructor || "—",
      price: Number(slotForm.price) || section.pricePerSlot,
      status: "available",
    };
    setSlots((prev) => [...prev, newSlot]);
    setShowCreateSlot(false);
    setSlotForm({ time: "", duration: "1 hour", capacity: section.maxCapacity.toString(), instructor: section.instructor, price: section.pricePerSlot.toString() });
    toast({ title: "Slot created", description: `${newSlot.time} on ${selectedDate}` });
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    toast({ title: "Slot removed" });
  };

  // ── Book a slot ──
  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlotForBooking(slot);
    setBookingForm((f) => ({
      ...f,
      date: slot.date,
      timeSlot: slot.time,
      duration: slot.duration,
      instructor: slot.instructor,
      price: slot.price.toString(),
    }));
    setShowQuickBooking(true);
  };

  // ── Booking CRUD ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = b.memberName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      const bookingDate = parseISO(b.date);
      const matchDate = isWithinInterval(bookingDate, { start: startOfDay(bookingsStartDate), end: endOfDay(bookingsEndDate) });
      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, bookingSearch, filterStatus, bookingsStartDate, bookingsEndDate]);

  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, bookingsPage]);

  const bookingsTotalPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));

  // Revenue filtered data
  const revenueFilteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bookingDate = parseISO(b.date);
      return b.status !== "cancelled" && isWithinInterval(bookingDate, { start: startOfDay(revenueStartDate), end: endOfDay(revenueEndDate) });
    });
  }, [bookings, revenueStartDate, revenueEndDate]);

  const paginatedRevenue = useMemo(() => {
    const start = (revenuePage - 1) * bookingsPerPage;
    return revenueFilteredBookings.slice(start, start + bookingsPerPage);
  }, [revenueFilteredBookings, revenuePage]);

  const revenueTotalPages = Math.max(1, Math.ceil(revenueFilteredBookings.length / bookingsPerPage));

  // Export CSV helper
  const exportCSV = (data: Booking[], filename: string) => {
    const headers = ["Member", "Date", "Time", "Duration", "Instructor", "Participants", "Price", "Status"];
    const rows = data.map((b) => [b.memberName, b.date, b.timeSlot, b.duration, b.instructor, b.participants, b.price, b.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filename}.csv downloaded` });
  };

  const handleSaveBooking = () => {
    if (!bookingForm.memberName || !bookingForm.date || !bookingForm.timeSlot) {
      toast({ title: "Missing fields", description: "Member, date and time are required.", variant: "destructive" });
      return;
    }
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      memberName: bookingForm.memberName,
      instructor: bookingForm.instructor || "—",
      date: bookingForm.date,
      timeSlot: bookingForm.timeSlot,
      duration: bookingForm.duration,
      participants: Number(bookingForm.participants) || 1,
      price: Number(bookingForm.price) || 0,
      notes: bookingForm.notes,
      status: "confirmed",
      slotId: selectedSlotForBooking?.id,
    };
    setBookings((prev) => [newBooking, ...prev]);

    // Update slot booked count
    if (selectedSlotForBooking) {
      setSlots((prev) => prev.map((s) => {
        if (s.id !== selectedSlotForBooking.id) return s;
        const newBooked = s.booked + (Number(bookingForm.participants) || 1);
        return { ...s, booked: newBooked, status: newBooked >= s.capacity ? "full" : "available" };
      }));
    }

    setShowQuickBooking(false);
    setSelectedSlotForBooking(null);
    setBookingForm({ memberName: "", instructor: section.instructor, date: "", timeSlot: "", duration: "1 hour", participants: "1", price: section.pricePerSlot.toString(), notes: "" });
    toast({ title: "Booking created" });
  };

  const handleDeleteBooking = (bkId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bkId));
    toast({ title: "Booking deleted" });
  };

  const handleSaveInfo = () => {
    toast({ title: "Section Updated", description: "Changes saved successfully." });
    setIsEditing(false);
  };

  // ── Revenue Data (from filtered) ──
  const revenueStats = useMemo(() => {
    const data = revenueFilteredBookings;
    const allInRange = bookings.filter((b) => {
      const d = parseISO(b.date);
      return isWithinInterval(d, { start: startOfDay(revenueStartDate), end: endOfDay(revenueEndDate) });
    });
    const confirmed = allInRange.filter((b) => b.status === "confirmed" || b.status === "completed");
    const pending = allInRange.filter((b) => b.status === "pending");
    const cancelled = allInRange.filter((b) => b.status === "cancelled");
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.price, 0);
    const pendingRevenue = pending.reduce((sum, b) => sum + b.price, 0);
    const cancelledRevenue = cancelled.reduce((sum, b) => sum + b.price, 0);
    return { totalRevenue, pendingRevenue, cancelledRevenue, totalBookings: allInRange.length, confirmedCount: confirmed.length, pendingCount: pending.length, cancelledCount: cancelled.length };
  }, [bookings, revenueFilteredBookings, revenueStartDate, revenueEndDate]);

  // ── Booking Table Columns ──
  const bookingColumns: Column<Booking>[] = [
    { key: "memberName", label: "Member", priority: "always", render: (value: string) => <span className="text-sm font-medium">{value}</span> },
    { key: "date", label: "Date & Time", priority: "always", render: (value: string, item) => (<div><p className="text-sm">{value}</p><p className="text-xs text-muted-foreground">{item.timeSlot} • {item.duration}</p></div>) },
    { key: "instructor", label: "Instructor", priority: "md", render: (value: string) => <span className="text-sm text-muted-foreground">{value}</span> },
    { key: "participants", label: "Pax", priority: "lg", render: (value: number) => <span className="text-sm">{value}</span> },
    { key: "price", label: "Price", priority: "md", render: (value: number) => <span className="text-sm font-medium">{formatCurrency(value)}</span> },
    { key: "status", label: "Status", priority: "always", render: (value: Booking["status"]) => <StatusBadge status={statusMap[value]} label={value.charAt(0).toUpperCase() + value.slice(1)} /> },
  ];

  const bookingRowActions: RowAction<Booking>[] = [
    { icon: Eye, label: "View", onClick: (item) => setViewBooking(item) },
    { icon: Trash2, label: "Delete", onClick: (item) => handleDeleteBooking(item.id), variant: "danger" },
  ];

  // Revenue table columns
  const revenueColumns: Column<Booking>[] = [
    { key: "memberName", label: "Member", priority: "always", render: (value: string) => <span className="text-sm font-medium">{value}</span> },
    { key: "date", label: "Date", priority: "always", render: (value: string, item) => (<div><p className="text-sm">{value}</p><p className="text-xs text-muted-foreground">{item.timeSlot}</p></div>) },
    { key: "participants", label: "Pax", priority: "lg", render: (value: number) => <span className="text-sm">{value}</span> },
    { key: "price", label: "Amount", priority: "always", render: (value: number) => <span className="text-sm font-semibold">{formatCurrency(value)}</span> },
    { key: "status", label: "Status", priority: "always", render: (value: Booking["status"]) => <StatusBadge status={statusMap[value]} label={value.charAt(0).toUpperCase() + value.slice(1)} /> },
  ];

  // ── Information Tab ──
  const InformationTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Section Information"
        action={
          !isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
              <Button size="sm" onClick={handleSaveInfo}><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Section Name", value: formData.name, key: "name" },
          { label: "Location", value: formData.location, key: "location", icon: <MapPin className="w-3.5 h-3.5" /> },
          { label: "Operating Hours", value: formData.operatingHours, key: "operatingHours", icon: <Clock className="w-3.5 h-3.5" /> },
          { label: "Max Capacity", value: formData.maxCapacity, key: "maxCapacity", icon: <Users className="w-3.5 h-3.5" />, type: "number" },
          { label: "Price Per Slot", value: formData.pricePerSlot, key: "pricePerSlot", type: "number" },
          { label: "Default Instructor", value: formData.instructor, key: "instructor" },
        ].map((field) => (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{field.icon}{field.label}</Label>
            <Input
              type={field.type || "text"}
              value={field.value}
              onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
              disabled={!isEditing}
              className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} disabled={!isEditing} className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30 min-h-[80px]" />
      </div>
      <SectionHeader title="Rules & Guidelines" />
      <Textarea value={formData.rules} onChange={(e) => setFormData((f) => ({ ...f, rules: e.target.value }))} disabled={!isEditing} className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30 min-h-[80px]" />
      <SectionHeader title="Quick Stats" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: bookings.length, label: "Total Bookings", cls: "text-foreground" },
          { val: bookings.filter((b) => b.status === "confirmed").length, label: "Confirmed", cls: "text-primary" },
          { val: bookings.filter((b) => b.status === "pending").length, label: "Pending", cls: "text-warning" },
          { val: bookings.filter((b) => b.status === "completed").length, label: "Completed", cls: "text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-4 border border-border/30 text-center">
            <p className={cn("text-2xl font-bold", s.cls)}>{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Calendar Tab ──
  const CalendarTab = (
    <div className="space-y-4">
      <SectionHeader
        title="Booking Calendar"
        action={
          <div className="flex gap-2">
            {selectedDate && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateSlot(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create Slot
              </Button>
            )}
            <Button size="sm" onClick={() => {
              if (selectedDate) setBookingForm((f) => ({ ...f, date: selectedDate }));
              setSelectedSlotForBooking(null);
              setShowQuickBooking(true);
            }}>
              <Plus className="w-4 h-4 mr-1" /> Direct Book
            </Button>
          </div>
        }
      />

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="font-semibold text-sm">{MONTH_NAMES[calMonth]} {calYear}</h3>
          <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 border-b border-border/50">
          {DAY_LABELS.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 min-h-[60px] sm:min-h-[80px] border-b border-r border-border/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const daySlots = slotsByDate[dateStr] || [];
            const dayBookings = bookingsByDate[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "p-1.5 sm:p-2 min-h-[60px] sm:min-h-[80px] border-b border-r border-border/20 cursor-pointer transition-colors",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                  !isSelected && "hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground",
                  isSelected && !isToday && "bg-primary/20 text-primary"
                )}>
                  {day}
                </div>
                {/* Desktop: show slot/booking summary */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  {daySlots.slice(0, 2).map((s) => (
                    <div key={s.id} className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded truncate",
                      s.status === "available" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {s.time} ({s.booked}/{s.capacity})
                    </div>
                  ))}
                  {daySlots.length > 2 && <span className="text-[10px] text-muted-foreground px-1">+{daySlots.length - 2} slots</span>}
                  {daySlots.length === 0 && dayBookings.length > 0 && (
                    <div className="text-[10px] px-1.5 py-0.5 rounded truncate bg-primary/10 text-primary">
                      {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                {/* Mobile: dots */}
                {(daySlots.length > 0 || dayBookings.length > 0) && (
                  <div className="flex sm:hidden gap-0.5 mt-0.5 justify-center">
                    {daySlots.slice(0, 3).map((s) => (
                      <div key={s.id} className={cn("w-1.5 h-1.5 rounded-full", s.status === "available" ? "bg-success" : "bg-destructive")} />
                    ))}
                    {daySlots.length === 0 && dayBookings.slice(0, 3).map((b) => (
                      <div key={b.id} className={cn("w-1.5 h-1.5 rounded-full", b.status === "confirmed" ? "bg-success" : b.status === "pending" ? "bg-warning" : "bg-primary")} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Agenda - Slots & Bookings */}
      {selectedDate && (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <h4 className="font-medium text-sm">{selectedDate}</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowCreateSlot(true)}>
                <Plus className="w-4 h-4 mr-1" /> Slot
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setBookingForm((f) => ({ ...f, date: selectedDate }));
                setSelectedSlotForBooking(null);
                setShowQuickBooking(true);
              }}>
                <Zap className="w-4 h-4 mr-1" /> Direct Book
              </Button>
            </div>
          </div>

          {/* Available Slots */}
          {selectedDateSlots.length > 0 && (
            <div className="p-3 border-b border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Time Slots</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDateSlots.sort((a, b) => a.time.localeCompare(b.time)).map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      "rounded-lg border p-3 transition-all",
                      slot.status === "available"
                        ? "border-success/30 bg-success/5 hover:bg-success/10 cursor-pointer"
                        : "border-destructive/30 bg-destructive/5 opacity-70"
                    )}
                    onClick={() => slot.status === "available" && handleBookSlot(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{slot.time}</p>
                        <p className="text-xs text-muted-foreground">{slot.duration} • {slot.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(slot.price)}</p>
                        <p className={cn("text-xs", slot.status === "available" ? "text-success" : "text-destructive")}>
                          {slot.booked}/{slot.capacity} booked
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {slot.status === "available" ? (
                        <Badge variant="outline" className="text-[10px] border-success/50 text-success">Click to Book</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">Full</Badge>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Bookings (without slot) for this date */}
          {selectedDateBookings.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Bookings ({selectedDateBookings.length})</p>
              <div className="divide-y divide-border/50">
                {selectedDateBookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)).map((b) => (
                  <div key={b.id} className="flex items-center gap-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer rounded px-2" onClick={() => setViewBooking(b)}>
                    <div className="text-center shrink-0 w-14">
                      <p className="text-sm font-bold text-foreground">{b.timeSlot}</p>
                      <p className="text-[10px] text-muted-foreground">{b.duration}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.memberName}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.instructor} • {b.participants} pax</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">{formatCurrency(b.price)}</span>
                      <StatusBadge status={statusMap[b.status]} label={b.status.charAt(0).toUpperCase() + b.status.slice(1)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDateSlots.length === 0 && selectedDateBookings.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No slots or bookings for this date</p>
              <p className="text-xs text-muted-foreground mt-1">Create a slot or make a direct booking</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── All Bookings Tab ──
  const AllBookingsTab = (
    <div className="space-y-4">
      <SectionHeader
        title="All Bookings"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCSV(filteredBookings, "bookings")}>
              <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => { setSelectedSlotForBooking(null); setShowQuickBooking(true); }}>
              <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">New Booking</span>
            </Button>
          </div>
        }
      />
      <DateRangeFields
        startDate={bookingsStartDate}
        endDate={bookingsEndDate}
        onStartDateChange={(d) => { setBookingsStartDate(d); setBookingsPage(1); }}
        onEndDateChange={(d) => { setBookingsEndDate(d); setBookingsPage(1); }}
      />
      <FilterBar
        searchValue={bookingSearch} onSearchChange={(v) => { setBookingSearch(v); setBookingsPage(1); }} searchPlaceholder="Search bookings..."
        filters={[{ key: "status", label: "Status", value: filterStatus, onChange: (v) => { setFilterStatus(v); setBookingsPage(1); }, options: [{ value: "all", label: "All Statuses" }, { value: "confirmed", label: "Confirmed" }, { value: "pending", label: "Pending" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] }]}
      />
      <ResponsiveTable
        data={paginatedBookings}
        columns={bookingColumns}
        keyExtractor={(item) => item.id}
        rowActions={bookingRowActions}
        onRowClick={(item) => setViewBooking(item)}
        pagination={{
          currentPage: bookingsPage,
          totalPages: bookingsTotalPages,
          totalItems: filteredBookings.length,
          itemsPerPage: bookingsPerPage,
          onPageChange: setBookingsPage,
        }}
      />
    </div>
  );

  // ── Revenue Tab ──
  const RevenueTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Revenue Overview"
        action={
          <Button size="sm" variant="outline" onClick={() => exportCSV(revenueFilteredBookings, "revenue")}>
            <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />
      <DateRangeFields
        startDate={revenueStartDate}
        endDate={revenueEndDate}
        onStartDateChange={(d) => { setRevenueStartDate(d); setRevenuePage(1); }}
        onEndDateChange={(d) => { setRevenueEndDate(d); setRevenuePage(1); }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: formatCurrency(revenueStats.totalRevenue), label: "Total Revenue", cls: "text-success", icon: <DollarSign className="w-4 h-4 text-success" /> },
          { val: formatCurrency(revenueStats.pendingRevenue), label: "Pending", cls: "text-warning", icon: <Clock className="w-4 h-4 text-warning" /> },
          { val: formatCurrency(revenueStats.cancelledRevenue), label: "Cancelled", cls: "text-destructive", icon: <X className="w-4 h-4 text-destructive" /> },
          { val: revenueStats.confirmedCount.toString(), label: "Paid Bookings", cls: "text-primary", icon: <TrendingUp className="w-4 h-4 text-primary" /> },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Transaction History" />
      <ResponsiveTable
        data={paginatedRevenue}
        columns={revenueColumns}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setViewBooking(item)}
        pagination={{
          currentPage: revenuePage,
          totalPages: revenueTotalPages,
          totalItems: revenueFilteredBookings.length,
          itemsPerPage: bookingsPerPage,
          onPageChange: setRevenuePage,
        }}
      />
    </div>
  );

  // ── Tabs ──
  const tabs: DetailTab[] = [
    { id: "info", label: "Information", icon: <Info className="w-4 h-4" />, content: InformationTab },
    { id: "calendar", label: "Calendar", icon: <CalendarCheck className="w-4 h-4" />, content: CalendarTab },
    { id: "bookings", label: "Bookings", icon: <ListChecks className="w-4 h-4" />, content: AllBookingsTab },
    { id: "revenue", label: "Revenue", icon: <DollarSign className="w-4 h-4" />, content: RevenueTab },
  ];

  return (
    <>
      <DetailPageTemplate
        title={section.name}
        subtitle={`${section.location} • Capacity: ${section.maxCapacity}`}
        avatar={
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${section.color}15` }}>
            <Layers className="w-7 h-7" style={{ color: section.color }} />
          </div>
        }
        badge={<StatusBadge status={section.status === "active" ? "success" : "warning"} label={section.status} />}
        tabs={tabs}
        defaultTab="calendar"
        backPath="/bookings"
        headerActions={[
          { label: "Quick Book", icon: <Zap className="w-4 h-4" />, onClick: () => { setSelectedSlotForBooking(null); setShowQuickBooking(true); } },
        ]}
      />

      {/* Create Slot Sheet */}
      <QuickAddSheet open={showCreateSlot} onOpenChange={setShowCreateSlot} title={`Create Slot — ${selectedDate || ""}`} onSubmit={handleCreateSlot} submitLabel="Create Slot">
        <div className="space-y-4">
          <div>
            <Label>Time *</Label>
            <Select value={slotForm.time} onValueChange={(v) => setSlotForm((f) => ({ ...f, time: v }))}>
              <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
              <SelectContent>
                {allTimeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration</Label>
              <Select value={slotForm.duration} onValueChange={(v) => setSlotForm((f) => ({ ...f, duration: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {durationOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Capacity</Label>
              <Input type="number" value={slotForm.capacity} onChange={(e) => setSlotForm((f) => ({ ...f, capacity: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Instructor</Label>
            <Input value={slotForm.instructor} onChange={(e) => setSlotForm((f) => ({ ...f, instructor: e.target.value }))} />
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" value={slotForm.price} onChange={(e) => setSlotForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
        </div>
      </QuickAddSheet>

      {/* Quick Booking Sheet */}
      <QuickAddSheet open={showQuickBooking} onOpenChange={(open) => { setShowQuickBooking(open); if (!open) setSelectedSlotForBooking(null); }} title={selectedSlotForBooking ? `Book Slot — ${selectedSlotForBooking.time}` : "Quick Booking"} onSubmit={handleSaveBooking} submitLabel="Create Booking">
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${section.color}15` }}>
              <Layers className="w-5 h-5" style={{ color: section.color }} />
            </div>
            <div>
              <p className="text-sm font-medium">{section.name}</p>
              <p className="text-xs text-muted-foreground">{selectedSlotForBooking ? `Slot: ${selectedSlotForBooking.time} • ${selectedSlotForBooking.duration} • ${selectedSlotForBooking.booked}/${selectedSlotForBooking.capacity} booked` : section.location}</p>
            </div>
          </div>
          <div>
            <Label>Member Name *</Label>
            <Input value={bookingForm.memberName} onChange={(e) => setBookingForm((f) => ({ ...f, memberName: e.target.value }))} placeholder="e.g. John Smith" />
          </div>
          <div>
            <Label>Instructor</Label>
            <Input value={bookingForm.instructor} onChange={(e) => setBookingForm((f) => ({ ...f, instructor: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))} disabled={!!selectedSlotForBooking} />
            </div>
            <div>
              <Label>Time Slot *</Label>
              <Select value={bookingForm.timeSlot} onValueChange={(v) => setBookingForm((f) => ({ ...f, timeSlot: v }))} disabled={!!selectedSlotForBooking}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {allTimeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration</Label>
              <Select value={bookingForm.duration} onValueChange={(v) => setBookingForm((f) => ({ ...f, duration: v }))} disabled={!!selectedSlotForBooking}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {durationOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Participants</Label>
              <Input type="number" value={bookingForm.participants} onChange={(e) => setBookingForm((f) => ({ ...f, participants: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Price</Label>
            <Input type="number" value={bookingForm.price} onChange={(e) => setBookingForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes..." />
          </div>
        </div>
      </QuickAddSheet>

      {/* View Booking Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={(open) => !open && setViewBooking(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {viewBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-primary" /> Booking Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={statusMap[viewBooking.status]} label={viewBooking.status.charAt(0).toUpperCase() + viewBooking.status.slice(1)} />
                  <Badge variant="outline">{section.name}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Users className="w-3.5 h-3.5" />, label: "Member", value: viewBooking.memberName },
                    { icon: <Users className="w-3.5 h-3.5" />, label: "Instructor", value: viewBooking.instructor },
                    { icon: <CalendarCheck className="w-3.5 h-3.5" />, label: "Date", value: viewBooking.date },
                    { icon: <Clock className="w-3.5 h-3.5" />, label: "Time", value: `${viewBooking.timeSlot} • ${viewBooking.duration}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">{item.icon} {item.label}</div>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-foreground">{viewBooking.participants}</p><p className="text-[10px] text-muted-foreground">Participants</p></div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-foreground">{section.maxCapacity}</p><p className="text-[10px] text-muted-foreground">Capacity</p></div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-primary">{formatCurrency(viewBooking.price)}</p><p className="text-[10px] text-muted-foreground">Price</p></div>
                </div>
                {viewBooking.notes && (
                  <div><Label className="text-xs text-muted-foreground">Notes</Label><p className="text-sm mt-1">{viewBooking.notes}</p></div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
