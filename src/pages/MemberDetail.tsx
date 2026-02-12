import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  DetailPageTemplate, 
  DetailTab, 
  SectionHeader 
} from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateReceipt, ReceiptSize } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { 
  User, 
  CreditCard, 
  TrendingUp, 
  Pencil, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Dumbbell,
  Plus,
  Eye,
  Printer,
  Download,
  Save,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  Apple,
  Activity,
  GraduationCap,
  Target,
  AlertCircle,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { MemberWorkoutTab } from "@/components/member/MemberWorkoutTab";
import { MemberDietTab } from "@/components/member/MemberDietTab";
import { MemberProgressTab } from "@/components/member/MemberProgressTab";
import { MemberActivityTab } from "@/components/member/MemberActivityTab";
import { MemberMembershipTab } from "@/components/member/MemberMembershipTab";
import { MemberClassesTab } from "@/components/member/MemberClassesTab";
import { MemberPTTab } from "@/components/member/MemberPTTab";
import { MemberEmergencyTab } from "@/components/member/MemberEmergencyTab";
import { MemberDocumentsTab } from "@/components/member/MemberDocumentsTab";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isAfter,
} from "date-fns";

// Zod validation schema
const memberFormSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().min(1, { message: "Phone is required" }).max(20),
  address: z.string().trim().max(500, { message: "Address too long" }),
  emergencyContact: z.string().trim().max(20),
  memberId: z.string(),
  membership: z.string().min(1, { message: "Membership is required" }),
  branch: z.string().min(1, { message: "Branch is required" }),
  joinDate: z.date({ required_error: "Join date is required" }),
  expiryDate: z.date({ required_error: "Expiry date is required" }),
  trainer: z.string().max(100),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  weight: z.string().max(20),
  height: z.string().max(20),
  goal: z.string().max(500),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

// Sample member data - in real app, fetch by ID
const memberData = {
  id: 1,
  memberId: "MEM-001",
  name: "John Smith",
  image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150",
  email: "john.smith@email.com",
  phone: "+1 234 567 890",
  membership: "Premium",
  joinDate: new Date(2024, 0, 15), // Jan 15, 2024
  expiryDate: new Date(2025, 0, 15), // Jan 15, 2025
  status: "active" as const,
  branch: "Downtown",
  birthday: "12-31",
  address: "123 Main Street, New York, NY 10001",
  emergencyContact: "+1 234 567 999",
  gender: "Male",
  dateOfBirth: new Date(1992, 5, 15), // June 15, 1992
  weight: "75 kg",
  height: "178 cm",
  goal: "Build Muscle",
  trainer: "Mike Johnson",
};

// Sample payment data
interface Payment {
  id: number;
  receiptNo: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status: "paid" | "pending" | "failed";
}

const paymentData: Payment[] = [
  { id: 1, receiptNo: "REC-2024-001", date: "Jan 15, 2024", description: "Premium Membership - Annual", amount: "$599.00", method: "Credit Card", status: "paid" },
  { id: 2, receiptNo: "REC-2023-045", date: "Dec 15, 2023", description: "Personal Training (5 sessions)", amount: "$150.00", method: "Cash", status: "paid" },
  { id: 3, receiptNo: "REC-2023-044", date: "Nov 20, 2023", description: "Locker Rental - Monthly", amount: "$25.00", method: "Credit Card", status: "paid" },
  { id: 4, receiptNo: "REC-2023-043", date: "Nov 15, 2023", description: "Premium Membership - Monthly", amount: "$59.00", method: "Credit Card", status: "paid" },
  { id: 5, receiptNo: "REC-2023-042", date: "Oct 15, 2023", description: "Premium Membership - Monthly", amount: "$59.00", method: "Bank Transfer", status: "paid" },
];

const paymentColumns: Column<Payment>[] = [
  { key: "receiptNo", label: "Receipt #", priority: "md" },
  { key: "date", label: "Date", priority: "always" },
  { key: "description", label: "Description", priority: "md" },
  { key: "amount", label: "Amount", priority: "always", render: (value: string) => <span className="font-semibold text-card-foreground">{value}</span> },
  { key: "method", label: "Method", priority: "lg" },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "paid" | "pending" | "failed") => (
      <StatusBadge 
        status={value === "paid" ? "success" : value === "pending" ? "warning" : "error"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

// Sample progress data
interface ProgressMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
}

const progressMetrics: ProgressMetric[] = [
  { label: "Workouts This Month", current: 18, target: 20, unit: "sessions" },
  { label: "Classes Attended", current: 8, target: 12, unit: "classes" },
  { label: "Calories Burned", current: 15200, target: 20000, unit: "kcal" },
  { label: "Active Days", current: 22, target: 25, unit: "days" },
];

interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  activity: string;
}

const attendanceData: AttendanceRecord[] = [
  { id: 1, date: "Dec 30, 2024", checkIn: "06:30 AM", checkOut: "08:15 AM", duration: "1h 45m", activity: "Strength Training" },
  { id: 2, date: "Dec 28, 2024", checkIn: "07:00 AM", checkOut: "08:30 AM", duration: "1h 30m", activity: "Cardio" },
  { id: 3, date: "Dec 27, 2024", checkIn: "06:45 AM", checkOut: "08:00 AM", duration: "1h 15m", activity: "HIIT Class" },
  { id: 4, date: "Dec 25, 2024", checkIn: "08:00 AM", checkOut: "09:30 AM", duration: "1h 30m", activity: "Swimming" },
  { id: 5, date: "Dec 24, 2024", checkIn: "06:30 AM", checkOut: "08:00 AM", duration: "1h 30m", activity: "Strength Training" },
];

const attendanceColumns: Column<AttendanceRecord>[] = [
  { key: "date", label: "Date", priority: "always" },
  { key: "checkIn", label: "Check In", priority: "always" },
  { key: "checkOut", label: "Check Out", priority: "md" },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "activity", label: "Activity", priority: "md" },
];

// Target type definitions
const TARGET_CATEGORIES = [
  { value: "sleep", label: "Sleep", unit: "hours" },
  { value: "steps", label: "Step Count", unit: "steps" },
  { value: "water", label: "Water Intake", unit: "liters" },
  { value: "calories_burn", label: "Calories Burn", unit: "kcal" },
  { value: "workout", label: "Workout Duration", unit: "minutes" },
] as const;

type TargetCategory = typeof TARGET_CATEGORIES[number]["value"];

// Member calendar event types
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
  // Target-specific fields
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

const getEventColorClass = (type: string) => {
  return memberEventTypes.find((t) => t.value === type)?.color || "bg-muted-foreground";
};

// Generate sample member events
const generateMemberEvents = (): MemberCalendarEvent[] => {
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

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [avatarUrl, setAvatarUrl] = useState(memberData.image);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const paymentsPerPage = 3;

  // Calendar state
  const [memberEvents, setMemberEvents] = useState<MemberCalendarEvent[]>(generateMemberEvents);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [dayEventsDate, setDayEventsDate] = useState<Date | null>(null);
  const [calendarFilterType, setCalendarFilterType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<MemberCalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTargetCategory, setNewTargetCategory] = useState<TargetCategory>("sleep");
  const [newTargetValue, setNewTargetValue] = useState("");
  const [newTargetDate, setNewTargetDate] = useState<Date>(new Date());
  const [newTargetRepeatUntil, setNewTargetRepeatUntil] = useState<Date | undefined>(undefined);
  const [targetCalOpen, setTargetCalOpen] = useState(false);
  const [repeatCalOpen, setRepeatCalOpen] = useState(false);
  const [editTargetActual, setEditTargetActual] = useState("");
  const [showLogProgress, setShowLogProgress] = useState(false);

  // In real app, fetch member by id
  const member = memberData;

  // Form with validation
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: memberData.email,
      phone: memberData.phone,
      address: memberData.address,
      emergencyContact: memberData.emergencyContact,
      memberId: memberData.memberId,
      membership: memberData.membership,
      branch: memberData.branch,
      joinDate: memberData.joinDate,
      expiryDate: memberData.expiryDate,
      trainer: memberData.trainer,
      gender: memberData.gender,
      dateOfBirth: memberData.dateOfBirth,
      weight: memberData.weight,
      height: memberData.height,
      goal: memberData.goal,
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    console.log("Saving member data:", data);
    toast({ title: "Member Updated", description: "Personal details saved successfully." });
  };

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast({ title: "Photo Updated", description: "Profile photo has been changed." });
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${member.phone.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = () => {
    window.open(`mailto:${member.email}`, "_blank");
  };

  const handleAddPayment = () => {
    toast({ title: "Add Payment", description: "Opening payment form..." });
  };

  const handlePrintReceipt = (payment: Payment, size: ReceiptSize) => {
    const doc = generateReceipt({
      receiptNo: payment.receiptNo,
      date: payment.date,
      memberName: member.name,
      memberId: member.memberId,
      phone: member.phone,
      email: member.email,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.method,
      status: payment.status,
      branch: member.branch,
    }, size);

    if (size === "pos") {
      // For POS, open in new window for printing
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      // For other sizes, download
      doc.save(`receipt-${payment.receiptNo}-${size}.pdf`);
    }
    
    toast({ 
      title: size === "pos" ? "Printing Receipt" : "Receipt Downloaded", 
      description: `${size.toUpperCase()} format generated for ${payment.receiptNo}` 
    });
  };

  // Receipt print dropdown component
  const ReceiptPrintCell = ({ payment }: { payment: Payment }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handlePrintReceipt(payment, "pos")}>
          <Printer className="h-4 w-4 mr-2" />
          POS (80mm)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(payment, "a4")}>
          <FileText className="h-4 w-4 mr-2" />
          A4
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(payment, "a5")}>
          <FileText className="h-4 w-4 mr-2" />
          A5
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(payment, "letter")}>
          <FileText className="h-4 w-4 mr-2" />
          US Letter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const paymentActions: RowAction<Payment>[] = [
    { icon: Eye, label: "View", onClick: () => toast({ title: "View Receipt" }), variant: "default" },
  ];

  // Personal Info Tab - Always Editable Form with Validation
  const PersonalTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader 
          title="Contact Information" 
          action={
            <Button type="submit" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          }
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[60px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Emergency Contact
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectionHeader title="Membership Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs text-muted-foreground h-5 flex items-center">Member ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membership"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs text-muted-foreground h-5 flex items-center">Plan</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs text-muted-foreground h-5 flex items-center">Branch</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Downtown">Downtown</SelectItem>
                    <SelectItem value="Westside">Westside</SelectItem>
                    <SelectItem value="Eastside">Eastside</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => {
              const currentYear = new Date().getFullYear();
              const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const fieldValue = field.value instanceof Date ? field.value : new Date();
              const selectedDate = fieldValue;
              
              return (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-muted-foreground h-5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" /> Join Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Select
                          value={selectedDate.getMonth().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedDate.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[90px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        month={selectedDate}
                        onMonthChange={(date) => {
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setMonth(date.getMonth());
                            newDate.setFullYear(date.getFullYear());
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => {
              const currentYear = new Date().getFullYear();
              const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const fieldValue = field.value instanceof Date ? field.value : new Date();
              const selectedDate = fieldValue;
              
              return (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-muted-foreground h-5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" /> Expiry Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Select
                          value={selectedDate.getMonth().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedDate.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[90px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        month={selectedDate}
                        onMonthChange={(date) => {
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setMonth(date.getMonth());
                            newDate.setFullYear(date.getFullYear());
                          }
                        }}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="trainer"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs text-muted-foreground h-5 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Trainer
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectionHeader title="Physical Details" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Gender</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => {
              const currentYear = new Date().getFullYear();
              const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const fieldValue = field.value instanceof Date ? field.value : new Date();
              const selectedDate = fieldValue;
              
              return (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Select
                          value={selectedDate.getMonth().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedDate.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[90px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        month={selectedDate}
                        onMonthChange={(date) => {
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setMonth(date.getMonth());
                            newDate.setFullYear(date.getFullYear());
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Weight</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Height</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectionHeader title="Fitness Goal" />
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="bg-primary/5 border-primary/20 text-primary font-medium"
                  placeholder="Enter fitness goal..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  // Payment Tab
  const paymentFilters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      value: paymentStatusFilter,
      onChange: (value) => {
        setPaymentStatusFilter(value);
        setPaymentPage(1);
      },
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      key: "method",
      label: "Method",
      value: paymentMethodFilter,
      onChange: (value) => {
        setPaymentMethodFilter(value);
        setPaymentPage(1);
      },
      options: [
        { value: "Credit Card", label: "Credit Card" },
        { value: "Cash", label: "Cash" },
        { value: "Bank Transfer", label: "Bank Transfer" },
      ],
    },
  ];

  const filteredPayments = paymentData.filter((payment) => {
    const matchesSearch = paymentSearch === "" || 
      payment.receiptNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      payment.description.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesStatus = paymentStatusFilter === "all" || payment.status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === "all" || payment.method === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (paymentPage - 1) * paymentsPerPage,
    paymentPage * paymentsPerPage
  );

  const PaymentTab = (
    <div className="space-y-4">
      <SectionHeader 
        title="Payment History" 
        action={
          <Button size="sm" onClick={handleAddPayment}>
            <Plus className="w-4 h-4 mr-1" />
            Add Payment
          </Button>
        }
      />
      
      {/* Payment Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
          <p className="text-lg font-bold text-card-foreground">$892.00</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-lg font-bold text-warning">$0.00</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-lg font-bold text-primary">$599.00</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Transactions</p>
          <p className="text-lg font-bold text-card-foreground">{filteredPayments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search receipts..."
        searchValue={paymentSearch}
        onSearchChange={(value) => {
          setPaymentSearch(value);
          setPaymentPage(1);
        }}
        filters={paymentFilters}
      />

      <ResponsiveTable
        data={paginatedPayments}
        columns={paymentColumns}
        keyExtractor={(item) => item.id}
        rowActions={paymentActions}
        customActions={(item) => <ReceiptPrintCell payment={item} />}
        pagination={{
          currentPage: paymentPage,
          totalPages: Math.ceil(filteredPayments.length / paymentsPerPage),
          totalItems: filteredPayments.length,
          itemsPerPage: paymentsPerPage,
          onPageChange: setPaymentPage,
        }}
      />
    </div>
  );

  // Status Tab (formerly Progress - shows current status and attendance)
  const StatusTab = (
    <div className="space-y-6">
      <SectionHeader title="Monthly Goals" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {progressMetrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-muted/30 rounded-lg p-4 border border-border/30"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-card-foreground">{metric.label}</span>
              <span className="text-xs text-muted-foreground">
                {metric.current}/{metric.target} {metric.unit}
              </span>
            </div>
            <Progress 
              value={(metric.current / metric.target) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((metric.current / metric.target) * 100)}% completed
            </p>
          </div>
        ))}
      </div>

      <SectionHeader title="Recent Attendance" />
      <ResponsiveTable
        data={attendanceData}
        columns={attendanceColumns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  // Calendar Tab - Member schedule view
  const calendarMonthStart = startOfMonth(calendarMonth);
  const calendarMonthEnd = endOfMonth(calendarMonth);
  const calendarStart = startOfWeek(calendarMonthStart);
  const calendarEnd = endOfWeek(calendarMonthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const filteredMemberEvents = memberEvents.filter((event) => {
    return calendarFilterType === "all" || event.type === calendarFilterType;
  });

  const getEventsForDay = (day: Date) => {
    return filteredMemberEvents.filter((event) => isSameDay(event.start, day));
  };

  const handlePrevMonth = () => setCalendarMonth(subMonths(calendarMonth, 1));
  const handleNextMonth = () => setCalendarMonth(addMonths(calendarMonth, 1));
  const handleToday = () => setCalendarMonth(new Date());

  const handleDateClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    setSelectedCalendarDate(day);
    
    if (dayEvents.length > 2) {
      setDayEventsDate(day);
      setShowDayEventsModal(true);
    }
  };

  const handleEventClick = (event: MemberCalendarEvent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedEvent(event);
    setShowEventModal(true);
    setShowDayEventsModal(false);
  };

  const handleAddTarget = () => {
    if (!newTargetValue) return;
    const cat = TARGET_CATEGORIES.find((c) => c.value === newTargetCategory)!;
    const targetVal = parseFloat(newTargetValue);

    const createTarget = (date: Date): MemberCalendarEvent => ({
      id: `target-${Date.now()}-${date.getTime()}`,
      title: `${cat.label}: ${targetVal.toLocaleString()} ${cat.unit}`,
      start: date,
      type: "target",
      color: "bg-emerald-500",
      targetCategory: newTargetCategory,
      targetValue: targetVal,
      targetUnit: cat.unit,
      status: "scheduled",
    });

    const newTargets: MemberCalendarEvent[] = [createTarget(newTargetDate)];

    // Repeat daily until date if set
    if (newTargetRepeatUntil && isAfter(newTargetRepeatUntil, newTargetDate)) {
      let d = addDays(newTargetDate, 1);
      while (!isAfter(d, newTargetRepeatUntil)) {
        newTargets.push(createTarget(new Date(d)));
        d = addDays(d, 1);
      }
    }

    setMemberEvents((prev) => [...prev, ...newTargets]);
    setShowAddTarget(false);
    setNewTargetValue("");
    setNewTargetRepeatUntil(undefined);
    toast({ title: "Target Added", description: `${newTargets.length} target${newTargets.length > 1 ? "s" : ""} created.` });
  };

  const handleLogTargetProgress = () => {
    if (!selectedEvent || !editTargetActual) return;
    const actual = parseFloat(editTargetActual);
    const achieved = actual >= (selectedEvent.targetValue || 0);
    setMemberEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, actualValue: actual, status: achieved ? "completed" : "scheduled" }
          : e
      )
    );
    setSelectedEvent((prev) =>
      prev ? { ...prev, actualValue: actual, status: achieved ? "completed" : "scheduled" } : prev
    );
    setShowLogProgress(false);
    setEditTargetActual("");
    toast({ title: achieved ? "Target Achieved! 🎉" : "Progress Logged" });
  };

  const handleDeleteTarget = (id: string) => {
    setMemberEvents((prev) => prev.filter((e) => e.id !== id));
    setShowEventModal(false);
    setSelectedEvent(null);
    toast({ title: "Target Deleted" });
  };

  const upcomingEvents = filteredMemberEvents
    .filter((e) => e.start >= new Date() || isSameDay(e.start, new Date()))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const CalendarTab = (
    <div className="space-y-8">
      {/* Event View Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", selectedEvent.color)} />
                <span className="text-sm capitalize">{selectedEvent.type.replace("_", " ")}</span>
                {selectedEvent.status && (
                  <StatusBadge
                    status={selectedEvent.status === "completed" ? "success" : selectedEvent.status === "scheduled" ? "info" : "error"}
                    label={selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(selectedEvent.start, "EEEE, MMMM d, yyyy")}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                {selectedEvent.instructor && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{selectedEvent.instructor}</span>
                  </div>
                )}
              </div>

              {/* Workout/Diet plan info */}
              {(selectedEvent.type === "workout" || selectedEvent.type === "diet") && selectedEvent.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {/* Target-specific: progress section */}
              {selectedEvent.type === "target" && selectedEvent.targetValue !== undefined && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">{selectedEvent.targetValue.toLocaleString()} {selectedEvent.targetUnit}</span>
                  </div>
                  {selectedEvent.actualValue !== undefined ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Actual</span>
                        <span className="font-medium">{selectedEvent.actualValue.toLocaleString()} {selectedEvent.targetUnit}</span>
                      </div>
                      <Progress value={Math.min(100, (selectedEvent.actualValue / selectedEvent.targetValue) * 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {Math.round((selectedEvent.actualValue / selectedEvent.targetValue) * 100)}% of target
                      </p>
                    </>
                  ) : !showLogProgress ? (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowLogProgress(true); setEditTargetActual(""); }}>
                      Log Progress
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Actual ${selectedEvent.targetUnit}`}
                        value={editTargetActual}
                        onChange={(e) => setEditTargetActual(e.target.value)}
                        className="h-9 flex-1"
                      />
                      <Button size="sm" className="h-9" onClick={handleLogTargetProgress} disabled={!editTargetActual}>
                        Save
                      </Button>
                    </div>
                  )}
                  <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDeleteTarget(selectedEvent.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Target
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Events Modal */}
      <Dialog open={showDayEventsModal} onOpenChange={setShowDayEventsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dayEventsDate && format(dayEventsDate, "EEEE, MMMM d")}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-4">
              {dayEventsDate && getEventsForDay(dayEventsDate).map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className={cn("w-1.5 h-10 rounded-full shrink-0", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time}
                      {event.instructor && ` • ${event.instructor}`}
                    </p>
                  </div>
                  {event.status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Filter by type */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={calendarFilterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCalendarFilterType("all")}
          >
            All
          </Button>
          {memberEventTypes.map((type) => (
            <Button
              key={type.value}
              variant={calendarFilterType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarFilterType(type.value)}
              className="shrink-0"
            >
              <div className={cn("w-2 h-2 rounded-full mr-2", type.color)} />
              {type.label}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAddTarget(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Target
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="py-2 px-4">
          <div className="flex gap-4 overflow-x-auto">
            {memberEventTypes.map((type) => (
              <div key={type.value} className="flex items-center gap-2 shrink-0">
                <div className={cn("w-2.5 h-2.5 rounded-full", type.color)} />
                <span className="text-xs text-muted-foreground">{type.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="text-base font-semibold truncate">
              {format(calendarMonth, "MMMM yyyy")}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleToday} className="hidden sm:flex">
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
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
              const isCurrentMonth = isSameMonth(day, calendarMonth);
              const isSelected = selectedCalendarDate && isSameDay(day, selectedCalendarDate);
              const hasMoreEvents = dayEvents.length > 2;

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[60px] sm:min-h-[80px] bg-card p-1 cursor-pointer transition-colors hover:bg-muted/50",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isSelected && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <div
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-0.5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mx-auto sm:mx-0",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  
                  {/* Events - Show cards on desktop */}
                  <div className="hidden sm:block space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={cn(
                          "text-[10px] p-0.5 rounded truncate text-white cursor-pointer hover:opacity-80",
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
                        className="text-[10px] text-primary font-medium hover:underline w-full text-left px-0.5"
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

      {/* Upcoming Events */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
          <div className="space-y-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className={cn("w-1.5 h-10 rounded-full shrink-0", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {format(event.start, "EEE, MMM d")}
                      {event.time && ` • ${event.time}`}
                      {event.instructor && ` • ${event.instructor}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Target Sheet */}
      <QuickAddSheet
        open={showAddTarget}
        onOpenChange={setShowAddTarget}
        title="Add Target"
        description="Set a daily target for this member. Optionally repeat until a date."
        onSubmit={handleAddTarget}
        submitLabel="Add Target"
      >
        <div>
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Popover open={targetCalOpen} onOpenChange={setTargetCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1.5">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(newTargetDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={newTargetDate} onSelect={(d) => { if (d) { setNewTargetDate(d); setTargetCalOpen(false); } }} />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Target Type</Label>
          <Select value={newTargetCategory} onValueChange={(v) => setNewTargetCategory(v as TargetCategory)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TARGET_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label} ({c.unit})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">
            Target Value ({TARGET_CATEGORIES.find((c) => c.value === newTargetCategory)?.unit})
          </Label>
          <Input
            type="number"
            value={newTargetValue}
            onChange={(e) => setNewTargetValue(e.target.value)}
            placeholder="e.g. 10000"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Repeat Until (optional)</Label>
          <Popover open={repeatCalOpen} onOpenChange={setRepeatCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1.5">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTargetRepeatUntil ? format(newTargetRepeatUntil, "MMM d, yyyy") : "No repeat"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newTargetRepeatUntil}
                onSelect={(d) => { if (d) { setNewTargetRepeatUntil(d); setRepeatCalOpen(false); } }}
                disabled={(date) => !isAfter(date, newTargetDate)}
              />
            </PopoverContent>
          </Popover>
          {newTargetRepeatUntil && (
            <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => setNewTargetRepeatUntil(undefined)}>
              <X className="w-3 h-3 mr-1" /> Clear repeat
            </Button>
          )}
        </div>
      </QuickAddSheet>
    </div>
  );

  const tabs: DetailTab[] = [
    { 
      id: "personal", 
      label: "Personal", 
      icon: <User className="w-4 h-4" />,
      content: PersonalTab 
    },
    { 
      id: "membership", 
      label: "Membership", 
      icon: <Users className="w-4 h-4" />,
      content: <MemberMembershipTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "classes", 
      label: "Classes", 
      icon: <GraduationCap className="w-4 h-4" />,
      content: <MemberClassesTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "pt", 
      label: "PT", 
      icon: <Target className="w-4 h-4" />,
      content: <MemberPTTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "payment", 
      label: "Payment", 
      icon: <CreditCard className="w-4 h-4" />,
      content: PaymentTab 
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      icon: <CalendarIcon className="w-4 h-4" />,
      content: CalendarTab 
    },
    { 
      id: "workout", 
      label: "Workout", 
      icon: <Dumbbell className="w-4 h-4" />,
      content: <MemberWorkoutTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "diet", 
      label: "Diet", 
      icon: <Apple className="w-4 h-4" />,
      content: <MemberDietTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "status", 
      label: "Status", 
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: StatusTab 
    },
    { 
      id: "progress", 
      label: "Progress", 
      icon: <TrendingUp className="w-4 h-4" />,
      content: <MemberProgressTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "activity", 
      label: "Activity", 
      icon: <Activity className="w-4 h-4" />,
      content: <MemberActivityTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "emergency", 
      label: "Emergency", 
      icon: <AlertCircle className="w-4 h-4" />,
      content: <MemberEmergencyTab memberId={member.memberId} memberName={member.name} />
    },
    { 
      id: "documents", 
      label: "Documents", 
      icon: <FolderOpen className="w-4 h-4" />,
      content: <MemberDocumentsTab memberId={member.memberId} memberName={member.name} />
    },
  ];


  return (
    <DetailPageTemplate
      title={member.name}
      subtitle={`${member.memberId} • ${member.membership} Member • ${member.branch}`}
      avatar={
        <img
          src={avatarUrl}
          alt={member.name}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-border/50"
        />
      }
      onAvatarChange={handleAvatarChange}
      badge={
        <StatusBadge
          status={member.status === "active" ? "success" : member.status === "expired" ? "error" : "warning"}
          label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        />
      }
      tabs={tabs}
      defaultTab="personal"
      headerActions={[
        { label: "WhatsApp", icon: <MessageCircle className="w-4 h-4" />, onClick: handleWhatsApp, variant: "outline" },
        { label: "Email", icon: <Mail className="w-4 h-4" />, onClick: handleEmail, variant: "outline" },
      ]}
      backPath="/members"
    />
  );
}
