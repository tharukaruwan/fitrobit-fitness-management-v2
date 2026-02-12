import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import {
  DetailPageTemplate,
  DetailTab,
  SectionHeader,
  InfoGrid,
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
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import {
  User,
  Info,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  BookOpen,
  FileText,
  Shield,
  Plus,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Save,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Briefcase,
  Award,
  Download,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: "present" | "absent" | "late" | "half-day";
  notes: string;
}

interface ClassAllocation {
  id: string;
  className: string;
  day: string;
  time: string;
  duration: string;
  type: "class" | "pt-session";
}

interface SalaryRecord {
  id: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "paid" | "pending" | "processing";
  paidDate: string;
}

interface LeaveRecord {
  id: string;
  type: "annual" | "sick" | "personal" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  status: "approved" | "pending" | "rejected";
  reason: string;
}

interface Qualification {
  id: string;
  title: string;
  institution: string;
  date: string;
  expiryDate?: string;
  type: "certification" | "degree" | "training" | "license";
  status: "valid" | "expiring" | "expired";
}

interface EmployeeDocument {
  id: string;
  name: string;
  type: "contract" | "id" | "medical" | "certification" | "other";
  uploadDate: string;
  status: "valid" | "expiring" | "expired";
}

// ── Sample Data ──

const employeesData: Record<string, {
  name: string; email: string; phone: string; role: string; department: string;
  joinDate: string; shift: string; status: "active" | "on-leave" | "inactive";
  branch: string; image: string; employeeId: string; address: string;
  emergencyContact: string; emergencyPhone: string; dateOfBirth: string;
  baseSalary: number; bankAccount: string;
}> = {
  "1": { name: "Amanda Roberts", email: "amanda.r@fitgym.com", phone: "+1 555 111 2222", role: "General Manager", department: "Management", joinDate: "2022-01-15", shift: "9 AM - 6 PM", status: "active", branch: "Downtown", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", employeeId: "EMP-001", address: "123 Main St, Downtown", emergencyContact: "Robert Roberts", emergencyPhone: "+1 555 999 0000", dateOfBirth: "1988-03-15", baseSalary: 5500, bankAccount: "****4521" },
  "2": { name: "Marcus Johnson", email: "marcus.j@fitgym.com", phone: "+1 555 222 3333", role: "Head Trainer", department: "Training", joinDate: "2022-03-20", shift: "6 AM - 2 PM", status: "active", branch: "Downtown", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", employeeId: "EMP-002", address: "456 Oak Ave, Westside", emergencyContact: "Jane Johnson", emergencyPhone: "+1 555 888 0000", dateOfBirth: "1990-07-22", baseSalary: 4200, bankAccount: "****7832" },
  "3": { name: "Jessica Lee", email: "jessica.l@fitgym.com", phone: "+1 555 333 4444", role: "Yoga Instructor", department: "Training", joinDate: "2023-06-10", shift: "7 AM - 3 PM", status: "active", branch: "Westside", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", employeeId: "EMP-003", address: "789 Pine Rd", emergencyContact: "Tom Lee", emergencyPhone: "+1 555 777 0000", dateOfBirth: "1992-11-08", baseSalary: 3800, bankAccount: "****2145" },
  "4": { name: "Daniel Kim", email: "daniel.k@fitgym.com", phone: "+1 555 444 5555", role: "Front Desk", department: "Reception", joinDate: "2023-08-05", shift: "2 PM - 10 PM", status: "on-leave", branch: "Downtown", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", employeeId: "EMP-004", address: "321 Elm St", emergencyContact: "Sarah Kim", emergencyPhone: "+1 555 666 0000", dateOfBirth: "1995-01-30", baseSalary: 2800, bankAccount: "****9087" },
};

const initialAttendance: AttendanceRecord[] = [
  { id: "a1", date: "2026-02-11", checkIn: "08:55", checkOut: "18:05", totalHours: "9h 10m", status: "present", notes: "" },
  { id: "a2", date: "2026-02-10", checkIn: "09:15", checkOut: "18:00", totalHours: "8h 45m", status: "late", notes: "Traffic delay" },
  { id: "a3", date: "2026-02-09", checkIn: "08:50", checkOut: "18:10", totalHours: "9h 20m", status: "present", notes: "" },
  { id: "a4", date: "2026-02-08", checkIn: "—", checkOut: "—", totalHours: "—", status: "absent", notes: "Sick leave" },
  { id: "a5", date: "2026-02-07", checkIn: "09:00", checkOut: "13:00", totalHours: "4h", status: "half-day", notes: "Doctor appointment" },
  { id: "a6", date: "2026-02-06", checkIn: "08:45", checkOut: "18:00", totalHours: "9h 15m", status: "present", notes: "" },
  { id: "a7", date: "2026-02-05", checkIn: "08:50", checkOut: "18:05", totalHours: "9h 15m", status: "present", notes: "" },
  { id: "a8", date: "2026-02-04", checkIn: "09:00", checkOut: "18:00", totalHours: "9h", status: "present", notes: "" },
];

const classAllocations: ClassAllocation[] = [
  { id: "ca1", className: "Morning HIIT", day: "Monday", time: "06:00", duration: "1 hour", type: "class" },
  { id: "ca2", className: "Yoga Basics", day: "Monday", time: "08:00", duration: "1.5 hours", type: "class" },
  { id: "ca3", className: "PT - John Smith", day: "Tuesday", time: "07:00", duration: "1 hour", type: "pt-session" },
  { id: "ca4", className: "CrossFit WOD", day: "Wednesday", time: "06:00", duration: "1 hour", type: "class" },
  { id: "ca5", className: "PT - Sarah Lee", day: "Wednesday", time: "09:00", duration: "1 hour", type: "pt-session" },
  { id: "ca6", className: "Evening Spin", day: "Thursday", time: "17:00", duration: "45 min", type: "class" },
  { id: "ca7", className: "Advanced Yoga", day: "Friday", time: "08:00", duration: "1.5 hours", type: "class" },
];

const initialSalary: SalaryRecord[] = [
  { id: "s1", month: "2026-02", baseSalary: 5500, bonus: 500, deductions: 350, netPay: 5650, status: "pending", paidDate: "—" },
  { id: "s2", month: "2026-01", baseSalary: 5500, bonus: 0, deductions: 350, netPay: 5150, status: "paid", paidDate: "2026-01-28" },
  { id: "s3", month: "2025-12", baseSalary: 5500, bonus: 1000, deductions: 350, netPay: 6150, status: "paid", paidDate: "2025-12-28" },
  { id: "s4", month: "2025-11", baseSalary: 5500, bonus: 0, deductions: 350, netPay: 5150, status: "paid", paidDate: "2025-11-28" },
  { id: "s5", month: "2025-10", baseSalary: 5500, bonus: 200, deductions: 350, netPay: 5350, status: "paid", paidDate: "2025-10-28" },
  { id: "s6", month: "2025-09", baseSalary: 5200, bonus: 0, deductions: 330, netPay: 4870, status: "paid", paidDate: "2025-09-28" },
];

const initialLeaves: LeaveRecord[] = [
  { id: "l1", type: "annual", startDate: "2026-03-10", endDate: "2026-03-14", days: 5, status: "pending", reason: "Family vacation" },
  { id: "l2", type: "sick", startDate: "2026-02-08", endDate: "2026-02-08", days: 1, status: "approved", reason: "Flu" },
  { id: "l3", type: "personal", startDate: "2026-01-20", endDate: "2026-01-20", days: 1, status: "approved", reason: "Personal errand" },
  { id: "l4", type: "annual", startDate: "2025-12-23", endDate: "2025-12-27", days: 5, status: "approved", reason: "Holiday break" },
  { id: "l5", type: "sick", startDate: "2025-11-15", endDate: "2025-11-16", days: 2, status: "approved", reason: "Back pain" },
];

const initialQualifications: Qualification[] = [
  { id: "q1", title: "Certified Personal Trainer (CPT)", institution: "NASM", date: "2021-06-15", expiryDate: "2026-06-15", type: "certification", status: "valid" },
  { id: "q2", title: "First Aid & CPR", institution: "Red Cross", date: "2024-01-10", expiryDate: "2026-01-10", type: "certification", status: "expired" },
  { id: "q3", title: "BSc Sports Science", institution: "State University", date: "2020-05-20", type: "degree", status: "valid" },
  { id: "q4", title: "Nutrition Coach Level 2", institution: "Precision Nutrition", date: "2023-03-01", expiryDate: "2027-03-01", type: "training", status: "valid" },
  { id: "q5", title: "Group Fitness License", institution: "ACE", date: "2022-09-01", expiryDate: "2026-04-01", type: "license", status: "expiring" },
];

const initialDocuments: EmployeeDocument[] = [
  { id: "d1", name: "Employment Contract", type: "contract", uploadDate: "2022-01-15", status: "valid" },
  { id: "d2", name: "Government ID", type: "id", uploadDate: "2022-01-15", status: "valid" },
  { id: "d3", name: "Medical Clearance", type: "medical", uploadDate: "2025-06-01", status: "expiring" },
  { id: "d4", name: "CPT Certificate", type: "certification", uploadDate: "2021-06-15", status: "valid" },
  { id: "d5", name: "Background Check", type: "other", uploadDate: "2022-01-10", status: "valid" },
];

const attendanceStatusMap: Record<AttendanceRecord["status"], "success" | "error" | "warning" | "info"> = {
  present: "success", absent: "error", late: "warning", "half-day": "info",
};

const leaveStatusMap: Record<LeaveRecord["status"], "success" | "warning" | "error"> = {
  approved: "success", pending: "warning", rejected: "error",
};

const salaryStatusMap: Record<SalaryRecord["status"], "success" | "warning" | "info"> = {
  paid: "success", pending: "warning", processing: "info",
};

const qualStatusMap: Record<Qualification["status"], "success" | "warning" | "error"> = {
  valid: "success", expiring: "warning", expired: "error",
};

const docStatusMap: Record<EmployeeDocument["status"], "success" | "warning" | "error"> = {
  valid: "success", expiring: "warning", expired: "error",
};

// Calendar helpers
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type CalendarFilter = "all" | "classes" | "pt" | "attendance";

// ── Component ──

export default function EmployeeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const emp = employeesData[id || ""] || employeesData["1"];

  // ── Personal Info State ──
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: emp.name, email: emp.email, phone: emp.phone, role: emp.role,
    department: emp.department, shift: emp.shift, branch: emp.branch,
    address: emp.address, emergencyContact: emp.emergencyContact,
    emergencyPhone: emp.emergencyPhone, dateOfBirth: emp.dateOfBirth,
  });

  // ── Attendance & Calendar State ──
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilter>("all");
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [attForm, setAttForm] = useState({ date: "", checkIn: "", checkOut: "", status: "present" as AttendanceRecord["status"], notes: "" });

  // Attendance tab state
  const [attStartDate, setAttStartDate] = useState<Date>(subDays(new Date(), 30));
  const [attEndDate, setAttEndDate] = useState<Date>(new Date());
  const [attPage, setAttPage] = useState(1);

  // ── Salary State ──
  const [salaryRecords] = useState<SalaryRecord[]>(initialSalary);
  const [salaryStartDate, setSalaryStartDate] = useState<Date>(subDays(new Date(), 365));
  const [salaryEndDate, setSalaryEndDate] = useState<Date>(new Date());
  const [salaryPage, setSalaryPage] = useState(1);

  // ── Leave State ──
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves);
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [leavePage, setLeavePage] = useState(1);
  const [leaveForm, setLeaveForm] = useState({ type: "annual" as LeaveRecord["type"], startDate: "", endDate: "", days: "1", reason: "" });

  // ── Qualifications State ──
  const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications);
  const [showAddQual, setShowAddQual] = useState(false);
  const [qualForm, setQualForm] = useState({ title: "", institution: "", date: "", expiryDate: "", type: "certification" as Qualification["type"] });

  // ── Documents State ──
  const [documents, setDocuments] = useState<EmployeeDocument[]>(initialDocuments);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docForm, setDocForm] = useState({ name: "", type: "contract" as EmployeeDocument["type"] });

  const perPage = 5;

  // ── Calendar Logic ──
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);

  const attendanceByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    attendance.forEach((a) => { map[a.date] = a; });
    return map;
  }, [attendance]);

  const allocationsByDay = useMemo(() => {
    const map: Record<string, ClassAllocation[]> = {};
    classAllocations.forEach((ca) => {
      if (!map[ca.day]) map[ca.day] = [];
      map[ca.day].push(ca);
    });
    return map;
  }, []);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  // ── Filtered Data ──
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: startOfDay(attStartDate), end: endOfDay(attEndDate) });
    });
  }, [attendance, attStartDate, attEndDate]);

  const paginatedAttendance = useMemo(() => {
    const start = (attPage - 1) * perPage;
    return filteredAttendance.slice(start, start + perPage);
  }, [filteredAttendance, attPage]);

  const filteredSalary = useMemo(() => {
    return salaryRecords.filter((s) => {
      const d = parseISO(s.month + "-01");
      return isWithinInterval(d, { start: startOfDay(salaryStartDate), end: endOfDay(salaryEndDate) });
    });
  }, [salaryRecords, salaryStartDate, salaryEndDate]);

  const paginatedSalary = useMemo(() => {
    const start = (salaryPage - 1) * perPage;
    return filteredSalary.slice(start, start + perPage);
  }, [filteredSalary, salaryPage]);

  const paginatedLeaves = useMemo(() => {
    const start = (leavePage - 1) * perPage;
    return leaves.slice(start, start + perPage);
  }, [leaves, leavePage]);

  // ── Stats ──
  const attendanceStats = useMemo(() => {
    const present = filteredAttendance.filter((a) => a.status === "present").length;
    const late = filteredAttendance.filter((a) => a.status === "late").length;
    const absent = filteredAttendance.filter((a) => a.status === "absent").length;
    return { present, late, absent, total: filteredAttendance.length };
  }, [filteredAttendance]);

  const salaryStats = useMemo(() => {
    const totalPaid = filteredSalary.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netPay, 0);
    const totalPending = filteredSalary.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.netPay, 0);
    return { totalPaid, totalPending };
  }, [filteredSalary]);

  const leaveBalance = useMemo(() => {
    const annual = 20 - leaves.filter((l) => l.type === "annual" && l.status === "approved").reduce((sum, l) => sum + l.days, 0);
    const sick = 10 - leaves.filter((l) => l.type === "sick" && l.status === "approved").reduce((sum, l) => sum + l.days, 0);
    return { annual: Math.max(0, annual), sick: Math.max(0, sick) };
  }, [leaves]);

  // ── Handlers ──
  const handleSaveInfo = () => {
    toast({ title: "Profile Updated" });
    setIsEditing(false);
  };

  const handleAddAttendance = () => {
    if (!attForm.date || !attForm.checkIn) {
      toast({ title: "Date and check-in time required", variant: "destructive" });
      return;
    }
    const checkIn = attForm.checkIn;
    const checkOut = attForm.checkOut || "—";
    let totalHours = "—";
    if (attForm.checkIn && attForm.checkOut) {
      const [inH, inM] = attForm.checkIn.split(":").map(Number);
      const [outH, outM] = attForm.checkOut.split(":").map(Number);
      const diffMin = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMin > 0) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        totalHours = m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
    }
    const newAtt: AttendanceRecord = {
      id: `a-${Date.now()}`,
      date: attForm.date,
      checkIn,
      checkOut,
      totalHours,
      status: attForm.status,
      notes: attForm.notes,
    };
    setAttendance((prev) => [newAtt, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setShowAddAttendance(false);
    setAttForm({ date: "", checkIn: "", checkOut: "", status: "present", notes: "" });
    toast({ title: "Attendance recorded" });
  };

  const handleAddLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast({ title: "Missing dates", variant: "destructive" });
      return;
    }
    const newLeave: LeaveRecord = {
      id: `l-${Date.now()}`, type: leaveForm.type, startDate: leaveForm.startDate,
      endDate: leaveForm.endDate, days: Number(leaveForm.days) || 1,
      status: "pending", reason: leaveForm.reason,
    };
    setLeaves((prev) => [newLeave, ...prev]);
    setShowAddLeave(false);
    setLeaveForm({ type: "annual", startDate: "", endDate: "", days: "1", reason: "" });
    toast({ title: "Leave request submitted" });
  };

  const handleAddQual = () => {
    if (!qualForm.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    const newQ: Qualification = {
      id: `q-${Date.now()}`, title: qualForm.title, institution: qualForm.institution,
      date: qualForm.date || format(new Date(), "yyyy-MM-dd"),
      expiryDate: qualForm.expiryDate || undefined,
      type: qualForm.type, status: "valid",
    };
    setQualifications((prev) => [newQ, ...prev]);
    setShowAddQual(false);
    setQualForm({ title: "", institution: "", date: "", expiryDate: "", type: "certification" });
    toast({ title: "Qualification added" });
  };

  const handleAddDoc = () => {
    if (!docForm.name) { toast({ title: "Name required", variant: "destructive" }); return; }
    const newD: EmployeeDocument = {
      id: `d-${Date.now()}`, name: docForm.name, type: docForm.type,
      uploadDate: format(new Date(), "yyyy-MM-dd"), status: "valid",
    };
    setDocuments((prev) => [newD, ...prev]);
    setShowAddDoc(false);
    setDocForm({ name: "", type: "contract" });
    toast({ title: "Document uploaded" });
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((r) => headers.map((h) => String(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported" });
  };

  // ═══════════════ TABS ═══════════════

  // ── 1. Personal Info Tab ──
  const PersonalTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Personal Information"
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
          { label: "Full Name", value: formData.name, key: "name" },
          { label: "Email", value: formData.email, key: "email", icon: <Mail className="w-3.5 h-3.5" /> },
          { label: "Phone", value: formData.phone, key: "phone", icon: <Phone className="w-3.5 h-3.5" /> },
          { label: "Job Role", value: formData.role, key: "role", icon: <Briefcase className="w-3.5 h-3.5" /> },
          { label: "Department", value: formData.department, key: "department" },
          { label: "Shift", value: formData.shift, key: "shift", icon: <Clock className="w-3.5 h-3.5" /> },
          { label: "Branch", value: formData.branch, key: "branch", icon: <MapPin className="w-3.5 h-3.5" /> },
          { label: "Date of Birth", value: formData.dateOfBirth, key: "dateOfBirth" },
        ].map((field) => (
          <div key={field.key} className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">{field.icon}{field.label}</Label>
            <Input
              value={field.value}
              onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
              disabled={!isEditing}
              className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address</Label>
        <Input value={formData.address} onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))} disabled={!isEditing} className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30" />
      </div>

      <SectionHeader title="Emergency Contact" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Contact Name</Label>
          <Input value={formData.emergencyContact} onChange={(e) => setFormData((f) => ({ ...f, emergencyContact: e.target.value }))} disabled={!isEditing} className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Contact Phone</Label>
          <Input value={formData.emergencyPhone} onChange={(e) => setFormData((f) => ({ ...f, emergencyPhone: e.target.value }))} disabled={!isEditing} className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30" />
        </div>
      </div>

      <SectionHeader title="Employment Details" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Employee ID", value: emp.employeeId },
          { label: "Join Date", value: emp.joinDate },
          { label: "Base Salary", value: formatCurrency(emp.baseSalary) },
          { label: "Bank Account", value: emp.bankAccount },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-sm font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── 2. Calendar Tab (with filter & manual attendance) ──
  const CalendarTab = (
    <div className="space-y-4">
      <SectionHeader
        title="Calendar"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => {
              const dateStr = selectedDate || format(today, "yyyy-MM-dd");
              setAttForm((f) => ({ ...f, date: dateStr }));
              setShowAddAttendance(true);
            }}>
              <Plus className="w-4 h-4 mr-1" /> Add Attendance
            </Button>
          </div>
        }
      />

      {/* Calendar Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            { value: "all", label: "All", color: "bg-foreground" },
            { value: "classes", label: "Classes", color: "bg-primary" },
            { value: "pt", label: "PT Sessions", color: "bg-accent-foreground" },
            { value: "attendance", label: "Attendance", color: "bg-success" },
          ] as { value: CalendarFilter; label: string; color: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCalendarFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              calendarFilter === opt.value
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border/50 text-muted-foreground hover:bg-muted/30"
            )}
          >
            <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", opt.color)} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Weekly Class Allocations */}
      {(calendarFilter === "all" || calendarFilter === "classes" || calendarFilter === "pt") && (
        <div className="bg-muted/20 rounded-xl border border-border/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Weekly Allocations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {classAllocations
              .filter((ca) => {
                if (calendarFilter === "classes") return ca.type === "class";
                if (calendarFilter === "pt") return ca.type === "pt-session";
                return true;
              })
              .map((ca) => (
                <div key={ca.id} className={cn(
                  "rounded-lg border p-3 flex items-center gap-3",
                  ca.type === "class" ? "border-primary/30 bg-primary/5" : "border-accent/30 bg-accent/5"
                )}>
                  <div className="text-center shrink-0 w-12">
                    <p className="text-xs font-bold text-foreground">{ca.time}</p>
                    <p className="text-[10px] text-muted-foreground">{ca.duration}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ca.className}</p>
                    <p className="text-xs text-muted-foreground">{ca.day}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {ca.type === "class" ? "Class" : "PT"}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="font-semibold text-sm">{MONTH_NAMES[calMonth]} {calYear}</h3>
          <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 border-b border-border/50">
          {DAY_LABELS.map((d) => <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 min-h-[60px] sm:min-h-[80px] border-b border-r border-border/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const att = attendanceByDate[dateStr];
            const dayOfWeek = new Date(calYear, calMonth, day).getDay();
            const dayName = DAY_NAMES[dayOfWeek];
            const dayClasses = (allocationsByDay[dayName] || []).filter((ca) => {
              if (calendarFilter === "classes") return ca.type === "class";
              if (calendarFilter === "pt") return ca.type === "pt-session";
              if (calendarFilter === "attendance") return false;
              return true;
            });
            const showAtt = calendarFilter === "all" || calendarFilter === "attendance";
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === format(today, "yyyy-MM-dd");

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "p-1.5 sm:p-2 min-h-[60px] sm:min-h-[80px] border-b border-r border-border/20 cursor-pointer transition-colors",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                  !isSelected && "hover:bg-muted/30",
                  dayOfWeek === 0 && "bg-muted/10"
                )}
              >
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    isSelected && !isToday && "bg-primary/20 text-primary"
                  )}>
                    {day}
                  </div>
                  {showAtt && att && (
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      att.status === "present" ? "bg-success" :
                      att.status === "late" ? "bg-warning" :
                      att.status === "absent" ? "bg-destructive" : "bg-primary"
                    )} />
                  )}
                </div>
                <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                  {dayClasses.slice(0, 2).map((c) => (
                    <div key={c.id} className={cn(
                      "text-[10px] px-1 py-0.5 rounded truncate",
                      c.type === "class" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                    )}>
                      {c.time} {c.className.split(" ")[0]}
                    </div>
                  ))}
                  {dayClasses.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayClasses.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Agenda */}
      {selectedDate && (() => {
        const att = attendanceByDate[selectedDate];
        const dayOfWeek = new Date(selectedDate).getDay();
        const dayName = DAY_NAMES[dayOfWeek];
        const dayClasses = (allocationsByDay[dayName] || []).filter((ca) => {
          if (calendarFilter === "classes") return ca.type === "class";
          if (calendarFilter === "pt") return ca.type === "pt-session";
          if (calendarFilter === "attendance") return false;
          return true;
        });
        const showAtt = calendarFilter === "all" || calendarFilter === "attendance";

        return (
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 bg-muted/30 flex items-center justify-between">
              <h4 className="font-medium text-sm">{selectedDate} — {dayName}</h4>
              <div className="flex items-center gap-2">
                {showAtt && att && <StatusBadge status={attendanceStatusMap[att.status]} label={att.status.charAt(0).toUpperCase() + att.status.slice(1)} />}
                <Button size="sm" variant="outline" onClick={() => {
                  setAttForm((f) => ({ ...f, date: selectedDate }));
                  setShowAddAttendance(true);
                }}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Attendance
                </Button>
              </div>
            </div>
            {showAtt && att && (
              <div className="p-4 border-b border-border/50">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Check In</p>
                    <p className="text-sm font-bold">{att.checkIn}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                    <p className="text-sm font-bold">{att.checkOut}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Hours</p>
                    <p className="text-sm font-bold">{att.totalHours}</p>
                  </div>
                </div>
                {att.notes && <p className="text-xs text-muted-foreground mt-2">Note: {att.notes}</p>}
              </div>
            )}
            {dayClasses.length > 0 && (
              <div className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Scheduled Classes</p>
                <div className="divide-y divide-border/50">
                  {dayClasses.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 py-2">
                      <div className="text-center shrink-0 w-14">
                        <p className="text-sm font-bold">{c.time}</p>
                        <p className="text-[10px] text-muted-foreground">{c.duration}</p>
                      </div>
                      <div className="flex-1"><p className="text-sm font-medium">{c.className}</p></div>
                      <Badge variant="outline" className="text-[10px]">{c.type === "class" ? "Class" : "PT"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(!showAtt || !att) && dayClasses.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No records for this date</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );

  // ── 3. Attendance Tab (separate list) ──
  const AttendanceTab = (
    <div className="space-y-4">
      <SectionHeader
        title="Attendance History"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCSV(filteredAttendance as unknown as Record<string, unknown>[], `${emp.name}_attendance`)}>
              <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => setShowAddAttendance(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        }
      />
      <DateRangeFields startDate={attStartDate} endDate={attEndDate} onStartDateChange={(d) => { setAttStartDate(d); setAttPage(1); }} onEndDateChange={(d) => { setAttEndDate(d); setAttPage(1); }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: attendanceStats.total, label: "Total Days", cls: "text-foreground" },
          { val: attendanceStats.present, label: "Present", cls: "text-success" },
          { val: attendanceStats.late, label: "Late", cls: "text-warning" },
          { val: attendanceStats.absent, label: "Absent", cls: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-3 border border-border/30 text-center">
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <ResponsiveTable
        data={paginatedAttendance}
        columns={[
          { key: "date", label: "Date", priority: "always" as const, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
          { key: "checkIn", label: "In", priority: "always" as const, render: (v: string) => <span className="text-sm">{v}</span> },
          { key: "checkOut", label: "Out", priority: "md" as const, render: (v: string) => <span className="text-sm">{v}</span> },
          { key: "totalHours", label: "Hours", priority: "md" as const, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
          { key: "status", label: "Status", priority: "always" as const, render: (v: AttendanceRecord["status"]) => <StatusBadge status={attendanceStatusMap[v]} label={v.charAt(0).toUpperCase() + v.slice(1)} /> },
          { key: "notes", label: "Notes", priority: "lg" as const, render: (v: string) => <span className="text-xs text-muted-foreground">{v || "—"}</span> },
        ]}
        keyExtractor={(item) => item.id}
        pagination={{ currentPage: attPage, totalPages: Math.max(1, Math.ceil(filteredAttendance.length / perPage)), totalItems: filteredAttendance.length, itemsPerPage: perPage, onPageChange: setAttPage }}
      />
    </div>
  );

  // ── 4. Salary & Payroll Tab ──
  const SalaryTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Salary & Payroll"
        action={
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredSalary as unknown as Record<string, unknown>[], `${emp.name}_salary`)}>
            <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />
      <DateRangeFields startDate={salaryStartDate} endDate={salaryEndDate} onStartDateChange={(d) => { setSalaryStartDate(d); setSalaryPage(1); }} onEndDateChange={(d) => { setSalaryEndDate(d); setSalaryPage(1); }} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: formatCurrency(emp.baseSalary), label: "Base Salary", cls: "text-foreground", icon: <DollarSign className="w-4 h-4" /> },
          { val: formatCurrency(salaryStats.totalPaid), label: "Total Paid", cls: "text-success", icon: <CheckCircle className="w-4 h-4 text-success" /> },
          { val: formatCurrency(salaryStats.totalPending), label: "Pending", cls: "text-warning", icon: <Clock className="w-4 h-4 text-warning" /> },
          { val: filteredSalary.length.toString(), label: "Pay Records", cls: "text-primary", icon: <FileText className="w-4 h-4 text-primary" /> },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Payment History" />
      <ResponsiveTable
        data={paginatedSalary}
        columns={[
          { key: "month", label: "Month", priority: "always" as const, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
          { key: "baseSalary", label: "Base", priority: "md" as const, render: (v: number) => <span className="text-sm">{formatCurrency(v)}</span> },
          { key: "bonus", label: "Bonus", priority: "md" as const, render: (v: number) => <span className={cn("text-sm", v > 0 && "text-success font-medium")}>{v > 0 ? `+${formatCurrency(v)}` : "—"}</span> },
          { key: "deductions", label: "Deductions", priority: "lg" as const, render: (v: number) => <span className="text-sm text-destructive">-{formatCurrency(v)}</span> },
          { key: "netPay", label: "Net Pay", priority: "always" as const, render: (v: number) => <span className="text-sm font-semibold">{formatCurrency(v)}</span> },
          { key: "status", label: "Status", priority: "always" as const, render: (v: SalaryRecord["status"]) => <StatusBadge status={salaryStatusMap[v]} label={v.charAt(0).toUpperCase() + v.slice(1)} /> },
          { key: "paidDate", label: "Paid On", priority: "lg" as const, render: (v: string) => <span className="text-xs text-muted-foreground">{v}</span> },
        ]}
        keyExtractor={(item) => item.id}
        pagination={{ currentPage: salaryPage, totalPages: Math.max(1, Math.ceil(filteredSalary.length / perPage)), totalItems: filteredSalary.length, itemsPerPage: perPage, onPageChange: setSalaryPage }}
      />
    </div>
  );

  // ── 5. Leave & HR Tab ──
  const LeaveTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Leave Management"
        action={<Button size="sm" onClick={() => setShowAddLeave(true)}><Plus className="w-4 h-4 mr-1" /> Request Leave</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: leaveBalance.annual.toString(), label: "Annual Left", cls: "text-primary" },
          { val: leaveBalance.sick.toString(), label: "Sick Left", cls: "text-warning" },
          { val: leaves.filter((l) => l.status === "approved").reduce((s, l) => s + l.days, 0).toString(), label: "Days Used", cls: "text-foreground" },
          { val: leaves.filter((l) => l.status === "pending").length.toString(), label: "Pending", cls: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-3 border border-border/30 text-center">
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Leave History" />
      <ResponsiveTable
        data={paginatedLeaves}
        columns={[
          { key: "type", label: "Type", priority: "always" as const, render: (v: string) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "startDate", label: "From", priority: "always" as const, render: (v: string) => <span className="text-sm">{v}</span> },
          { key: "endDate", label: "To", priority: "md" as const, render: (v: string) => <span className="text-sm">{v}</span> },
          { key: "days", label: "Days", priority: "md" as const, render: (v: number) => <span className="text-sm font-medium">{v}</span> },
          { key: "reason", label: "Reason", priority: "lg" as const, render: (v: string) => <span className="text-xs text-muted-foreground truncate max-w-[150px] block">{v}</span> },
          { key: "status", label: "Status", priority: "always" as const, render: (v: LeaveRecord["status"]) => <StatusBadge status={leaveStatusMap[v]} label={v.charAt(0).toUpperCase() + v.slice(1)} /> },
        ]}
        keyExtractor={(item) => item.id}
        pagination={{ currentPage: leavePage, totalPages: Math.max(1, Math.ceil(leaves.length / perPage)), totalItems: leaves.length, itemsPerPage: perPage, onPageChange: setLeavePage }}
      />
    </div>
  );

  // ── 6. Qualifications Tab ──
  const QualificationsTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Qualifications & Certifications"
        action={<Button size="sm" onClick={() => setShowAddQual(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {qualifications.map((q) => (
          <div key={q.id} className="rounded-xl border border-border/50 p-4 bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold truncate">{q.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{q.institution}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Issued: {q.date}</span>
                  {q.expiryDate && <span>• Expires: {q.expiryDate}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={qualStatusMap[q.status]} label={q.status.charAt(0).toUpperCase() + q.status.slice(1)} />
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => {
                  setQualifications((prev) => prev.filter((x) => x.id !== q.id));
                  toast({ title: "Removed" });
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <Badge variant="outline" className="mt-2 text-[10px] capitalize">{q.type}</Badge>
          </div>
        ))}
      </div>
    </div>
  );

  // ── 7. Documents Tab ──
  const DocumentsTab = (
    <div className="space-y-6">
      <SectionHeader
        title="Employee Documents"
        action={<Button size="sm" onClick={() => setShowAddDoc(true)}><Plus className="w-4 h-4 mr-1" /> Upload</Button>}
      />
      <ResponsiveTable
        data={documents}
        columns={[
          { key: "name", label: "Document", priority: "always" as const, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
          { key: "type", label: "Type", priority: "md" as const, render: (v: string) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "uploadDate", label: "Uploaded", priority: "md" as const, render: (v: string) => <span className="text-sm text-muted-foreground">{v}</span> },
          { key: "status", label: "Status", priority: "always" as const, render: (v: EmployeeDocument["status"]) => <StatusBadge status={docStatusMap[v]} label={v.charAt(0).toUpperCase() + v.slice(1)} /> },
        ]}
        keyExtractor={(item) => item.id}
        rowActions={[
          { icon: Trash2, label: "Delete", onClick: (item) => { setDocuments((prev) => prev.filter((d) => d.id !== item.id)); toast({ title: "Document removed" }); }, variant: "danger" as const },
        ]}
      />
    </div>
  );

  // ── Tab Config ──
  const tabs: DetailTab[] = [
    { id: "personal", label: "Personal", icon: <User className="w-4 h-4" />, content: PersonalTab },
    { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" />, content: CalendarTab },
    { id: "attendance", label: "Attendance", icon: <ClipboardList className="w-4 h-4" />, content: AttendanceTab },
    { id: "salary", label: "Salary", icon: <DollarSign className="w-4 h-4" />, content: SalaryTab },
    { id: "leave", label: "Leave & HR", icon: <Shield className="w-4 h-4" />, content: LeaveTab },
    { id: "qualifications", label: "Qualifications", icon: <Award className="w-4 h-4" />, content: QualificationsTab },
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, content: DocumentsTab },
  ];

  return (
    <>
      <DetailPageTemplate
        title={emp.name}
        subtitle={`${emp.role} • ${emp.department} • ${emp.branch}`}
        avatar={
          <img src={emp.image} alt={emp.name} className="w-14 h-14 rounded-2xl object-cover" />
        }
        badge={<StatusBadge status={emp.status === "active" ? "success" : emp.status === "on-leave" ? "warning" : "error"} label={emp.status} />}
        tabs={tabs}
        defaultTab="personal"
        backPath="/employees"
      />

      {/* Add Attendance Sheet */}
      <QuickAddSheet open={showAddAttendance} onOpenChange={setShowAddAttendance} title="Add Attendance" onSubmit={handleAddAttendance} submitLabel="Record">
        <div className="space-y-4">
          <div>
            <Label>Date *</Label>
            <Input type="date" value={attForm.date} onChange={(e) => setAttForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Check In *</Label>
              <Input type="time" value={attForm.checkIn} onChange={(e) => setAttForm((f) => ({ ...f, checkIn: e.target.value }))} />
            </div>
            <div>
              <Label>Check Out</Label>
              <Input type="time" value={attForm.checkOut} onChange={(e) => setAttForm((f) => ({ ...f, checkOut: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={attForm.status} onValueChange={(v) => setAttForm((f) => ({ ...f, status: v as AttendanceRecord["status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={attForm.notes} onChange={(e) => setAttForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notes..." />
          </div>
        </div>
      </QuickAddSheet>

      {/* Add Leave Sheet */}
      <QuickAddSheet open={showAddLeave} onOpenChange={setShowAddLeave} title="Request Leave" onSubmit={handleAddLeave} submitLabel="Submit Request">
        <div className="space-y-4">
          <div>
            <Label>Leave Type</Label>
            <Select value={leaveForm.type} onValueChange={(v) => setLeaveForm((f) => ({ ...f, type: v as LeaveRecord["type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start Date</Label><Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
            <div><Label>End Date</Label><Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          <div><Label>Days</Label><Input type="number" value={leaveForm.days} onChange={(e) => setLeaveForm((f) => ({ ...f, days: e.target.value }))} /></div>
          <div><Label>Reason</Label><Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} rows={2} /></div>
        </div>
      </QuickAddSheet>

      {/* Add Qualification Sheet */}
      <QuickAddSheet open={showAddQual} onOpenChange={setShowAddQual} title="Add Qualification" onSubmit={handleAddQual} submitLabel="Add">
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={qualForm.title} onChange={(e) => setQualForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Certified Personal Trainer" /></div>
          <div><Label>Institution</Label><Input value={qualForm.institution} onChange={(e) => setQualForm((f) => ({ ...f, institution: e.target.value }))} placeholder="e.g. NASM" /></div>
          <div>
            <Label>Type</Label>
            <Select value={qualForm.type} onValueChange={(v) => setQualForm((f) => ({ ...f, type: v as Qualification["type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="license">License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Issue Date</Label><Input type="date" value={qualForm.date} onChange={(e) => setQualForm((f) => ({ ...f, date: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={qualForm.expiryDate} onChange={(e) => setQualForm((f) => ({ ...f, expiryDate: e.target.value }))} /></div>
          </div>
        </div>
      </QuickAddSheet>

      {/* Add Document Sheet */}
      <QuickAddSheet open={showAddDoc} onOpenChange={setShowAddDoc} title="Upload Document" onSubmit={handleAddDoc} submitLabel="Upload">
        <div className="space-y-4">
          <div><Label>Document Name *</Label><Input value={docForm.name} onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Employment Contract" /></div>
          <div>
            <Label>Type</Label>
            <Select value={docForm.type} onValueChange={(v) => setDocForm((f) => ({ ...f, type: v as EmployeeDocument["type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </QuickAddSheet>
    </>
  );
}
