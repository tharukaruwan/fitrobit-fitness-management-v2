import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  CreditCard,
  DollarSign,
  CalendarCheck,
  CalendarX,
  Dumbbell,
  User,
  MapPin,
  TicketCheck,
  Plus,
} from "lucide-react";

// Types
interface ClassEnrollment {
  id: string;
  className: string;
  instructor: string;
  schedule: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "paused" | "completed";
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  remainingSessions: number;
}

interface ClassAttendance {
  id: string;
  className: string;
  date: Date;
  time: string;
  instructor: string;
  status: "attended" | "missed" | "cancelled" | "upcoming";
  location: string;
}

interface ClassPayment {
  id: string;
  className: string;
  packageName: string;
  date: Date;
  amount: string;
  method: string;
  status: "paid" | "pending" | "refunded";
  sessions: number;
  receiptNo: string;
}

// Sample data
const sampleEnrollments: ClassEnrollment[] = [
  {
    id: "ce-1",
    className: "HIIT Training",
    instructor: "Sarah Wilson",
    schedule: "Mon, Wed, Fri • 7:00 AM",
    location: "Studio A",
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2025, 2, 1),
    status: "active",
    totalSessions: 36,
    attendedSessions: 18,
    missedSessions: 2,
    remainingSessions: 16,
  },
  {
    id: "ce-2",
    className: "Yoga Flow",
    instructor: "Emma Davis",
    schedule: "Tue, Thu • 8:00 AM",
    location: "Studio B",
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2025, 1, 28),
    status: "active",
    totalSessions: 24,
    attendedSessions: 10,
    missedSessions: 1,
    remainingSessions: 13,
  },
  {
    id: "ce-3",
    className: "Spin Class",
    instructor: "Mike Chen",
    schedule: "Sat • 9:00 AM",
    location: "Spin Room",
    startDate: new Date(2024, 9, 1),
    endDate: new Date(2024, 11, 31),
    status: "completed",
    totalSessions: 12,
    attendedSessions: 11,
    missedSessions: 1,
    remainingSessions: 0,
  },
];

const sampleAttendance: ClassAttendance[] = [
  { id: "ca-1", className: "HIIT Training", date: new Date(2025, 0, 31), time: "7:00 AM", instructor: "Sarah Wilson", status: "upcoming", location: "Studio A" },
  { id: "ca-2", className: "Yoga Flow", date: new Date(2025, 0, 30), time: "8:00 AM", instructor: "Emma Davis", status: "upcoming", location: "Studio B" },
  { id: "ca-3", className: "HIIT Training", date: new Date(2025, 0, 29), time: "7:00 AM", instructor: "Sarah Wilson", status: "attended", location: "Studio A" },
  { id: "ca-4", className: "Yoga Flow", date: new Date(2025, 0, 28), time: "8:00 AM", instructor: "Emma Davis", status: "attended", location: "Studio B" },
  { id: "ca-5", className: "HIIT Training", date: new Date(2025, 0, 27), time: "7:00 AM", instructor: "Sarah Wilson", status: "attended", location: "Studio A" },
  { id: "ca-6", className: "Yoga Flow", date: new Date(2025, 0, 26), time: "8:00 AM", instructor: "Emma Davis", status: "missed", location: "Studio B" },
  { id: "ca-7", className: "HIIT Training", date: new Date(2025, 0, 25), time: "7:00 AM", instructor: "Sarah Wilson", status: "attended", location: "Studio A" },
  { id: "ca-8", className: "Spin Class", date: new Date(2024, 11, 28), time: "9:00 AM", instructor: "Mike Chen", status: "attended", location: "Spin Room" },
];

const samplePayments: ClassPayment[] = [
  { id: "cp-1", className: "HIIT Training", packageName: "3-Month Package", date: new Date(2024, 11, 1), amount: "$299.00", method: "Credit Card", status: "paid", sessions: 36, receiptNo: "CLS-2024-001" },
  { id: "cp-2", className: "Yoga Flow", packageName: "2-Month Package", date: new Date(2024, 11, 1), amount: "$199.00", method: "Credit Card", status: "paid", sessions: 24, receiptNo: "CLS-2024-002" },
  { id: "cp-3", className: "Spin Class", packageName: "Monthly Pass", date: new Date(2024, 9, 1), amount: "$89.00", method: "Cash", status: "paid", sessions: 12, receiptNo: "CLS-2024-003" },
  { id: "cp-4", className: "Boxing Basics", packageName: "Drop-in Class", date: new Date(2024, 8, 15), amount: "$25.00", method: "Credit Card", status: "refunded", sessions: 1, receiptNo: "CLS-2024-004" },
];

interface MemberClassesTabProps {
  memberId: string;
  memberName: string;
}

export function MemberClassesTab({ memberId, memberName }: MemberClassesTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("enrollments");
  const [enrollments] = useState<ClassEnrollment[]>(sampleEnrollments);
  const [attendance] = useState<ClassAttendance[]>(sampleAttendance);
  const [payments] = useState<ClassPayment[]>(samplePayments);
  
  const [showEnrollmentSheet, setShowEnrollmentSheet] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<ClassEnrollment | null>(null);
  const [showAttendanceSheet, setShowAttendanceSheet] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<ClassAttendance | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ClassPayment | null>(null);

  // Paginated data
  const { paginatedData: paginatedAttendance, paginationProps: attendancePagination } = useTableData({
    data: attendance,
    itemsPerPage: 5,
  });

  const { paginatedData: paginatedPayments, paginationProps: paymentsPagination } = useTableData({
    data: payments,
    itemsPerPage: 5,
  });

  const activeEnrollments = enrollments.filter(e => e.status === "active");
  const pastEnrollments = enrollments.filter(e => e.status !== "active");

  const handleViewEnrollment = (enrollment: ClassEnrollment) => {
    setSelectedEnrollment(enrollment);
    setShowEnrollmentSheet(true);
  };

  const handleViewAttendance = (record: ClassAttendance) => {
    setSelectedAttendance(record);
    setShowAttendanceSheet(true);
  };

  const handleViewPayment = (payment: ClassPayment) => {
    setSelectedPayment(payment);
    setShowPaymentSheet(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "attended": case "paid": return "success";
      case "paused": case "upcoming": case "pending": return "warning";
      case "completed": return "info";
      case "missed": case "cancelled": case "refunded": return "error";
      default: return "neutral";
    }
  };

  const attendanceColumns: Column<ClassAttendance>[] = [
    { key: "date", label: "Date", priority: "always", render: (val: Date) => format(val, "MMM d, yyyy") },
    { key: "className", label: "Class", priority: "always", render: (val: string) => <span className="font-medium">{val}</span> },
    { key: "time", label: "Time", priority: "md" },
    { key: "instructor", label: "Instructor", priority: "lg" },
    { key: "location", label: "Location", priority: "xl" },
    { 
      key: "status", 
      label: "Status", 
      priority: "always",
      render: (val: string) => (
        <StatusBadge 
          status={getStatusColor(val) as "success" | "warning" | "error" | "info" | "neutral"} 
          label={val.charAt(0).toUpperCase() + val.slice(1)} 
        />
      )
    },
  ];

  const paymentColumns: Column<ClassPayment>[] = [
    { key: "date", label: "Date", priority: "always", render: (val: Date) => format(val, "MMM d, yyyy") },
    { key: "className", label: "Class", priority: "always", render: (val: string) => <span className="font-medium">{val}</span> },
    { key: "packageName", label: "Package", priority: "md" },
    { key: "sessions", label: "Sessions", priority: "lg", render: (val: number) => `${val} classes` },
    { key: "amount", label: "Amount", priority: "always", render: (val: string) => <span className="font-semibold">{val}</span> },
    { key: "method", label: "Method", priority: "lg" },
    { 
      key: "status", 
      label: "Status", 
      priority: "always",
      render: (val: string) => (
        <StatusBadge 
          status={getStatusColor(val) as "success" | "warning" | "error"} 
          label={val.charAt(0).toUpperCase() + val.slice(1)} 
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enrollments" className="flex items-center gap-1.5">
            <TicketCheck className="w-4 h-4 hidden sm:block" />
            <span>Enrollments</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 hidden sm:block" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 hidden sm:block" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6 mt-4">
          <SectionHeader 
            title="Active Classes" 
            action={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Enroll
              </Button>
            }
          />
          
          {activeEnrollments.length === 0 ? (
            <Card className="p-8 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No active class enrollments</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleViewEnrollment(enrollment)}>
                  <div className={cn("h-1.5", enrollment.status === "active" ? "bg-success" : "bg-warning")} />
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">{enrollment.className}</h3>
                          <StatusBadge status="success" label="Active" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{enrollment.instructor}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{enrollment.schedule}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{enrollment.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{enrollment.remainingSessions}</p>
                          <p className="text-xs text-muted-foreground">sessions left</p>
                        </div>
                        <div className="w-32 hidden sm:block">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round((enrollment.attendedSessions / enrollment.totalSessions) * 100)}%</span>
                          </div>
                          <Progress value={(enrollment.attendedSessions / enrollment.totalSessions) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pastEnrollments.length > 0 && (
            <>
              <SectionHeader title="Past Enrollments" />
              <div className="grid gap-3">
                {pastEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleViewEnrollment(enrollment)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{enrollment.className}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(enrollment.startDate, "MMM d")} - {format(enrollment.endDate, "MMM d, yyyy")} • {enrollment.attendedSessions}/{enrollment.totalSessions} attended
                        </p>
                      </div>
                      <StatusBadge status="info" label="Completed" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <SectionHeader title="Class Attendance History" />
          <ResponsiveTable
            data={paginatedAttendance}
            columns={attendanceColumns}
            keyExtractor={(item) => item.id}
            onRowClick={handleViewAttendance}
            pagination={attendancePagination}
            rowActions={[
              { icon: Eye, label: "View Details", onClick: handleViewAttendance },
            ]}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <SectionHeader 
            title="Class Payments" 
            action={
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Payment
              </Button>
            }
          />
          <ResponsiveTable
            data={paginatedPayments}
            columns={paymentColumns}
            keyExtractor={(item) => item.id}
            onRowClick={handleViewPayment}
            pagination={paymentsPagination}
            rowActions={[
              { icon: Eye, label: "View Details", onClick: handleViewPayment },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Enrollment Details Sheet */}
      <QuickAddSheet
        open={showEnrollmentSheet}
        onOpenChange={setShowEnrollmentSheet}
        title={selectedEnrollment?.className || "Class Details"}
        description={selectedEnrollment ? `${format(selectedEnrollment.startDate, "MMM d")} - ${format(selectedEnrollment.endDate, "MMM d, yyyy")}` : ""}
      >
        {selectedEnrollment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedEnrollment.status) as "success" | "info"} label={selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4" />Instructor</span>
              <span className="font-medium">{selectedEnrollment.instructor}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" />Schedule</span>
              <span className="font-medium text-sm">{selectedEnrollment.schedule}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" />Location</span>
              <span className="font-medium">{selectedEnrollment.location}</span>
            </div>
            
            <Label className="text-sm font-medium">Session Progress</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{selectedEnrollment.attendedSessions}</p>
                <p className="text-xs text-muted-foreground">Attended</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-destructive">{selectedEnrollment.missedSessions}</p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{selectedEnrollment.remainingSessions}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round((selectedEnrollment.attendedSessions / selectedEnrollment.totalSessions) * 100)}%</span>
              </div>
              <Progress value={(selectedEnrollment.attendedSessions / selectedEnrollment.totalSessions) * 100} className="h-2" />
            </div>
          </div>
        )}
      </QuickAddSheet>

      {/* Attendance Details Sheet */}
      <QuickAddSheet
        open={showAttendanceSheet}
        onOpenChange={setShowAttendanceSheet}
        title={selectedAttendance?.className || "Attendance Details"}
        description={selectedAttendance ? format(selectedAttendance.date, "EEEE, MMMM d, yyyy") : ""}
      >
        {selectedAttendance && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedAttendance.status) as "success" | "warning" | "error"} label={selectedAttendance.status.charAt(0).toUpperCase() + selectedAttendance.status.slice(1)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" />Time</span>
              <span className="font-medium">{selectedAttendance.time}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4" />Instructor</span>
              <span className="font-medium">{selectedAttendance.instructor}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" />Location</span>
              <span className="font-medium">{selectedAttendance.location}</span>
            </div>
          </div>
        )}
      </QuickAddSheet>

      {/* Payment Details Sheet */}
      <QuickAddSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        title={selectedPayment?.className || "Payment Details"}
        description={selectedPayment ? `Receipt: ${selectedPayment.receiptNo}` : ""}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedPayment.status) as "success" | "warning" | "error"} label={selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Package</span>
              <span className="font-medium">{selectedPayment.packageName}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Sessions</span>
              <span className="font-medium">{selectedPayment.sessions} classes</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4" />Amount</span>
              <span className="font-bold text-lg">{selectedPayment.amount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-4 h-4" />Method</span>
              <span className="font-medium">{selectedPayment.method}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" />Date</span>
              <span className="font-medium">{format(selectedPayment.date, "MMM d, yyyy")}</span>
            </div>
            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        )}
      </QuickAddSheet>
    </div>
  );
}
