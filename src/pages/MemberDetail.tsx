import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  IdCardIcon,
  Notebook,
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
import Request from "@/lib/api/client";
import { MemberStatusTab } from "@/components/member/MemberStatusTab";
import { MemberCalendarTab } from "@/components/member/MemberCalendarTab";

// Zod validation schema
const memberFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phoneNumber: z.string().trim().max(20),
  nic: z.string().trim().max(20),
  address: z.string().trim().max(500, { message: "Address too long" }),
  remark: z.string().trim().max(20),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  weight: z.string().max(20),
  height: z.string().max(20),
  goal: z.string().max(500),
  branch: z.string().min(1, { message: "Branch is required" }),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

// Sample member data - in real app, fetch by ID
const memberData = {
  id: 1,
  memberId: "MEM-001",
  name: "John Smith",
  image: "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  email: "john.smith@email.com",
  phoneNumber: "+1 234 567 890",
  membership: "Premium",
  createdAt: new Date(2024, 0, 15), // Jan 15, 2024
  expiryDate: new Date(2025, 0, 15), // Jan 15, 2025
  status: "active" as const,
  branch: "Downtown",
  birthday: "12-31",
  address: "123 Main Street, New York, NY 10001",
  emergencyContact: "+1 234 567 999",
  nic: "123456789",
  remark: "Good member",
  gender: "Male",
  dateOfBirth: new Date(1992, 5, 15), // June 15, 1992
  weight: "75 kg",
  height: "178 cm",
  goal: "Build Muscle",
  trainer: "Mike Johnson",
};

// Sample payment data
interface Payment {
  phoneNumber?: string;
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

interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  activity: string;
}

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

const ITEMS_PER_PAGE = 8;

// Common Types
export interface Duration {
  days: number;
  weeks: number;
  months: number;
  years: number;
}

export interface Notification {
  note: string;
}

export interface Membership {
  _id: string;
  name: string;
  description: string;
  price: number;
  user: string;
  class: string | null;
  expiration: "Time_Base" | string;
  duration: Duration;
  maxAttendanceLimit: number | null;
  status: "Active" | "Inactive" | string;
  memberLimit: number;
  benefits: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MemberLite {
  _id: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber: string;
  nic: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldMemberShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  memberShip: Membership;
  memberShipGroup: string;
}

export interface MemberShipGroup {
  _id: string;
  memberShip: Membership;
  members: MemberLite[];
  user: string;
  status: "Active" | "Inactive" | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Member {
  address: string;
  remark: string;
  dateOfBirth: Date;
  weight: string;
  height: string;
  goal: string;
  branch: string;
  id: string;
  image?: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber: string;
  nic: string;
  email: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldMemberShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  memberShip: Membership;
  memberShipGroup: MemberShipGroup;
  memberShipName?: string;
  expiryDate: Date;
}

export interface ApiMember {
  address: any;
  dateOfBirth: any;
  weight: any;
  height: any;
  goal: any;
  branch: any;
  remark: any;
  _id: string;
  image?: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber?: string;
  email: string;
  nic: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldMemberShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  memberShip: Membership;
  memberShipGroup: MemberShipGroup;
}


const fetchMembers = async (id: string) => {
  const res = await Request.get<ApiMember>(`members/${id}`);
  return res;
};

const mapApiMember = (mb: ApiMember): Member => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name ? mb.name : "No Name",
  email: mb.email ? mb.email : "",
  phoneNumber: mb.phoneNumber ? mb.phoneNumber : "",
  nic: mb.nic ? mb.nic : "",
  address: mb.address ? mb.address : "",
  remark: mb.remark ? mb.remark : "",
  gender: mb.gender ? mb.gender : "other",
  dateOfBirth: mb.dateOfBirth ? new Date(mb.dateOfBirth) : null,
  weight: mb.weight ? mb.weight : "",
  height: mb.height ? mb.height : "",
  goal: mb.goal ? mb.goal : "",
  branch: mb.branch ? mb.branch : "",
  image: mb.image ? mb.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  selfSignup: mb.selfSignup ? mb.selfSignup : false,
  user: mb.user ? mb.user : "",
  oldMemberShipGroup: [],
  notifications: [],
  status: mb.status ? mb.status : "Inactive",
  terminated: false,
  terminatedReasons: [],
  blackListed: false,
  blackListedReasons: [],
  renewalDay: "",
  deviceData: [],
  createdUser: "",
  createdBy: "",
  updatedAt: mb.updatedAt,
  memberShipName: mb.memberShip ? mb.memberShip.name : "No Membership",
  memberShip: mb.memberShip ? mb.memberShip : null,
  memberShipGroup: mb.memberShipGroup ? mb.memberShipGroup : undefined,
  createdAt: mb.createdAt,
  expiryDate: new Date(mb.updatedAt),
});

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg");
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

  const { data: apiResponse, isLoading, refetch, error } = useQuery({
    queryKey: ["members-list", id],
    queryFn: () => fetchMembers(id || ""),
  });

  const memberDetails = apiResponse ? mapApiMember(apiResponse) : null;
  useEffect(() => {
    if (memberDetails) {
      setAvatarUrl(memberDetails.image ? memberDetails.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg");
    }
  }, [memberDetails]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      nic: "",
      address: "",
      remark: "",
      gender: "male",
      dateOfBirth: undefined,
      weight: "",
      height: "",
      goal: "",
      branch: "",
    },
  });

  useEffect(() => {
    if (memberDetails) {
      form.reset({
        name: memberDetails.name || "",
        email: memberDetails.email || "",
        phoneNumber: memberDetails.phoneNumber || "",
        nic: memberDetails.nic || "",
        address: memberDetails.address || "",
        remark: memberDetails.remark || "",
        gender: memberDetails.gender || "male",
        dateOfBirth: memberDetails.dateOfBirth || undefined,
        weight: memberDetails.weight || "",
        height: memberDetails.height || "",
        goal: memberDetails.goal || "",
        branch: memberDetails.branch || "",
      });
    }
  }, [memberDetails?.id, form]);


  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form with data:", data);
    try {
      await Request.put(`/members/${id}`, data);
      toast({ title: "Member Updated", description: "Personal details saved successfully." });
      refetch();
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast({ title: "Member Updated", description: "Failed to update member details." });
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast({ title: "Photo Updated", description: "Profile photo has been changed." });
  };

  const handleWhatsApp = (phoneNo: string) => {
    window.open(`https://wa.me/${phoneNo.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (emailAdd: string) => {
    window.open(`mailto:${emailAdd}`, "_blank");
  };

  const handleAddPayment = () => {
    toast({ title: "Add Payment", description: "Opening payment form..." });
  };

  const handlePrintReceipt = (payment: Payment, size: ReceiptSize) => {
    const doc = generateReceipt({
      receiptNo: payment.receiptNo,
      date: payment.date,
      memberName: memberDetails?.name || "Unknown Member",
      memberId: memberDetails?.memberId || undefined,
      phoneNumber: memberDetails?.phoneNumber || undefined,
      email: memberDetails?.email || undefined,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.method,
      status: payment.status,
      branch: memberDetails?.branch || undefined,
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
  // TODO why this input boxes when type it wont work?
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Name
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
            name="phoneNumber"
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
            name="nic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IdCardIcon className="w-3.5 h-3.5" /> NIC
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
            name="remark"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Notebook className="w-3.5 h-3.5" /> Remark
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[60px]" />
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


  const tabs: DetailTab[] = [
    {
      id: "personal",
      label: "Personal",
      icon: <User className="w-4 h-4" />,
      content: PersonalTab // TODO: Create seperate PersonalTab component with member details form
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-4 h-4" />,
      content: PaymentTab // TODO: Create seperate PaymentTab component with payment history and add payment form
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <CalendarIcon className="w-4 h-4" />,
      content: <MemberCalendarTab initialEvents={generateMemberEvents()} />
    },
    {
      id: "status",
      label: "Status",
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: <MemberStatusTab id={id} />
    },
    {
      id: "membership",
      label: "Membership",
      icon: <Users className="w-4 h-4" />,
      content: <MemberMembershipTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member" } />
    },
    {
      id: "classes",
      label: "Classes",
      icon: <GraduationCap className="w-4 h-4" />,
      content: <MemberClassesTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "pt",
      label: "PT",
      icon: <Target className="w-4 h-4" />,
      content: <MemberPTTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "workout",
      label: "Workout",
      icon: <Dumbbell className="w-4 h-4" />,
      content: <MemberWorkoutTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "diet",
      label: "Diet",
      icon: <Apple className="w-4 h-4" />,
      content: <MemberDietTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "progress",
      label: "Progress",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <MemberProgressTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="w-4 h-4" />,
      content: <MemberActivityTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "emergency",
      label: "Emergency",
      icon: <AlertCircle className="w-4 h-4" />,
      content: <MemberEmergencyTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FolderOpen className="w-4 h-4" />,
      content: <MemberDocumentsTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
  ];


  return (
    <DetailPageTemplate
      isLoading={isLoading || isSubmitting}
      error={!!error ? "Failed to load member data." : false}
      title={memberDetails?.name || "Unknown Member"}
      subtitle={`${memberDetails?.memberShipName || "Membership Not Found"}`}
      avatar={
        <img
          src={avatarUrl}
          alt={memberDetails?.name || "Unknown Member"}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-border/50"
        />
      }
      onAvatarChange={handleAvatarChange}
      badge={
        <StatusBadge
          status={memberDetails?.status === "Active" ? "success" : memberDetails?.status === "Inactive" ? "error" : "warning"}
          label={memberDetails?.status.charAt(0).toUpperCase() + memberDetails?.status.slice(1)}
        />
      }
      tabs={tabs}
      defaultTab="personal"
      headerActions={[
        memberDetails?.phoneNumber && {
          label: "WhatsApp",
          icon: <MessageCircle className="w-4 h-4" />,
          onClick: () => handleWhatsApp(memberDetails.phoneNumber),
          variant: "outline" as const,
        },
        memberDetails?.email && {
          label: "Email",
          icon: <Mail className="w-4 h-4" />,
          onClick: () => handleEmail(memberDetails.email),
          variant: "outline" as const,
        },
      ].filter(Boolean)}
      backPath="/members"
    />
  );
}
