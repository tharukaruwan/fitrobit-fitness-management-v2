import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import {
  User,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  CreditCard,
  DollarSign,
  CalendarCheck,
  Package,
  Plus,
  Star,
  Target,
  Timer,
  MapPin,
  FileText,
} from "lucide-react";

// Types
interface PTPackage {
  id: string;
  name: string;
  trainer: {
    name: string;
    image?: string;
    specialization: string;
  };
  type: "session-based" | "monthly";
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expiring" | "expired" | "completed";
  price: string;
  sessionsPerWeek?: number;
}

interface PTSession {
  id: string;
  date: Date;
  time: string;
  duration: string;
  trainer: string;
  type: string;
  status: "completed" | "scheduled" | "cancelled" | "no-show";
  notes?: string;
  location: string;
}

interface PTPayment {
  id: string;
  packageName: string;
  trainer: string;
  date: Date;
  amount: string;
  method: string;
  status: "paid" | "pending" | "refunded";
  sessions: number;
  receiptNo: string;
}

// Sample data
const samplePackages: PTPackage[] = [
  {
    id: "pt-pkg-1",
    name: "Premium PT Package",
    trainer: {
      name: "Mike Johnson",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
      specialization: "Strength & Conditioning",
    },
    type: "session-based",
    totalSessions: 20,
    usedSessions: 8,
    remainingSessions: 12,
    startDate: new Date(2024, 11, 1),
    expiryDate: new Date(2025, 2, 31),
    status: "active",
    price: "$800.00",
  },
  {
    id: "pt-pkg-2",
    name: "Monthly Unlimited",
    trainer: {
      name: "Lisa Park",
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150",
      specialization: "HIIT & Weight Loss",
    },
    type: "monthly",
    totalSessions: 12,
    usedSessions: 6,
    remainingSessions: 6,
    startDate: new Date(2025, 0, 1),
    expiryDate: new Date(2025, 0, 31),
    status: "active",
    price: "$450.00",
    sessionsPerWeek: 3,
  },
];

const sampleSessions: PTSession[] = [
  { id: "pts-1", date: new Date(2025, 0, 31), time: "10:00 AM", duration: "60 min", trainer: "Mike Johnson", type: "Strength Training", status: "scheduled", location: "Weight Room", notes: "Focus on compound lifts" },
  { id: "pts-2", date: new Date(2025, 1, 2), time: "10:00 AM", duration: "60 min", trainer: "Lisa Park", type: "HIIT Session", status: "scheduled", location: "Studio A" },
  { id: "pts-3", date: new Date(2025, 0, 29), time: "10:00 AM", duration: "60 min", trainer: "Mike Johnson", type: "Strength Training", status: "completed", location: "Weight Room" },
  { id: "pts-4", date: new Date(2025, 0, 27), time: "10:00 AM", duration: "60 min", trainer: "Lisa Park", type: "Cardio Focus", status: "completed", location: "Studio A" },
  { id: "pts-5", date: new Date(2025, 0, 25), time: "10:00 AM", duration: "60 min", trainer: "Mike Johnson", type: "Upper Body", status: "completed", location: "Weight Room" },
  { id: "pts-6", date: new Date(2025, 0, 22), time: "10:00 AM", duration: "60 min", trainer: "Mike Johnson", type: "Lower Body", status: "no-show", location: "Weight Room" },
  { id: "pts-7", date: new Date(2025, 0, 20), time: "10:00 AM", duration: "60 min", trainer: "Lisa Park", type: "Core & Flexibility", status: "completed", location: "Studio B" },
  { id: "pts-8", date: new Date(2025, 0, 18), time: "10:00 AM", duration: "60 min", trainer: "Mike Johnson", type: "Full Body", status: "cancelled", location: "Weight Room", notes: "Trainer sick" },
];

const samplePayments: PTPayment[] = [
  { id: "ptp-1", packageName: "Premium PT Package", trainer: "Mike Johnson", date: new Date(2024, 11, 1), amount: "$800.00", method: "Credit Card", status: "paid", sessions: 20, receiptNo: "PT-2024-001" },
  { id: "ptp-2", packageName: "Monthly Unlimited", trainer: "Lisa Park", date: new Date(2025, 0, 1), amount: "$450.00", method: "Bank Transfer", status: "paid", sessions: 12, receiptNo: "PT-2025-001" },
  { id: "ptp-3", packageName: "Starter Package", trainer: "Mike Johnson", date: new Date(2024, 8, 15), amount: "$350.00", method: "Cash", status: "paid", sessions: 10, receiptNo: "PT-2024-002" },
  { id: "ptp-4", packageName: "Trial Session", trainer: "Lisa Park", date: new Date(2024, 8, 1), amount: "$50.00", method: "Credit Card", status: "paid", sessions: 1, receiptNo: "PT-2024-003" },
];

const sampleHistoryPackages: PTPackage[] = [
  {
    id: "pt-hist-1",
    name: "Starter Package",
    trainer: { name: "Mike Johnson", specialization: "Strength" },
    type: "session-based",
    totalSessions: 10,
    usedSessions: 10,
    remainingSessions: 0,
    startDate: new Date(2024, 8, 15),
    expiryDate: new Date(2024, 10, 30),
    status: "completed",
    price: "$350.00",
  },
];

interface MemberPTTabProps {
  memberId: string;
  memberName: string;
}

export function MemberPTTab({ memberId, memberName }: MemberPTTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("packages");
  const [packages] = useState<PTPackage[]>(samplePackages);
  const [historyPackages] = useState<PTPackage[]>(sampleHistoryPackages);
  const [sessions] = useState<PTSession[]>(sampleSessions);
  const [payments] = useState<PTPayment[]>(samplePayments);
  
  const [showPackageSheet, setShowPackageSheet] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PTPackage | null>(null);
  const [showSessionSheet, setShowSessionSheet] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PTSession | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PTPayment | null>(null);

  // Paginated data
  const { paginatedData: paginatedSessions, paginationProps: sessionsPagination } = useTableData({
    data: sessions,
    itemsPerPage: 5,
  });

  const { paginatedData: paginatedPayments, paginationProps: paymentsPagination } = useTableData({
    data: payments,
    itemsPerPage: 5,
  });

  const activePackages = packages.filter(p => p.status === "active" || p.status === "expiring");

  const handleViewPackage = (pkg: PTPackage) => {
    setSelectedPackage(pkg);
    setShowPackageSheet(true);
  };

  const handleViewSession = (session: PTSession) => {
    setSelectedSession(session);
    setShowSessionSheet(true);
  };

  const handleViewPayment = (payment: PTPayment) => {
    setSelectedPayment(payment);
    setShowPaymentSheet(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "completed": case "paid": return "success";
      case "expiring": case "scheduled": case "pending": return "warning";
      case "expired": case "cancelled": case "no-show": case "refunded": return "error";
      default: return "neutral";
    }
  };

  const getDaysRemaining = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sessionColumns: Column<PTSession>[] = [
    { key: "date", label: "Date", priority: "always", render: (val: Date) => format(val, "MMM d, yyyy") },
    { key: "time", label: "Time", priority: "always" },
    { key: "trainer", label: "Trainer", priority: "md", render: (val: string) => <span className="font-medium">{val}</span> },
    { key: "type", label: "Type", priority: "lg" },
    { key: "duration", label: "Duration", priority: "xl" },
    { key: "location", label: "Location", priority: "xl" },
    { 
      key: "status", 
      label: "Status", 
      priority: "always",
      render: (val: string) => (
        <StatusBadge 
          status={getStatusColor(val) as "success" | "warning" | "error"} 
          label={val.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} 
        />
      )
    },
  ];

  const paymentColumns: Column<PTPayment>[] = [
    { key: "date", label: "Date", priority: "always", render: (val: Date) => format(val, "MMM d, yyyy") },
    { key: "packageName", label: "Package", priority: "always", render: (val: string) => <span className="font-medium">{val}</span> },
    { key: "trainer", label: "Trainer", priority: "md" },
    { key: "sessions", label: "Sessions", priority: "lg", render: (val: number) => `${val} sessions` },
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
          <TabsTrigger value="packages" className="flex items-center gap-1.5">
            <Package className="w-4 h-4 hidden sm:block" />
            <span>Packages</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 hidden sm:block" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 hidden sm:block" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6 mt-4">
          <SectionHeader 
            title="Active Packages" 
            action={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Package
              </Button>
            }
          />
          
          {activePackages.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No active PT packages</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activePackages.map((pkg) => {
                const daysLeft = getDaysRemaining(pkg.expiryDate);
                return (
                  <Card key={pkg.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleViewPackage(pkg)}>
                    <div className={cn("h-1.5", pkg.status === "active" ? "bg-success" : "bg-warning")} />
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Package Info */}
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 hidden sm:flex">
                            <AvatarImage src={pkg.trainer.image} alt={pkg.trainer.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {pkg.trainer.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-card-foreground">{pkg.name}</h3>
                              <StatusBadge 
                                status={pkg.status === "active" ? "success" : "warning"} 
                                label={pkg.status === "active" ? "Active" : "Expiring Soon"} 
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{pkg.trainer.name}</span>
                              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{pkg.trainer.specialization}</span>
                              <span className="flex items-center gap-1 capitalize"><Package className="w-3.5 h-3.5" />{pkg.type.replace("-", " ")}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Valid until {format(pkg.expiryDate, "MMM d, yyyy")}
                              {pkg.sessionsPerWeek && ` • ${pkg.sessionsPerWeek} sessions/week`}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-xl font-bold text-success">{pkg.usedSessions}</p>
                              <p className="text-xs text-muted-foreground">Used</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-primary">{pkg.remainingSessions}</p>
                              <p className="text-xs text-muted-foreground">Left</p>
                            </div>
                            <div>
                              <p className={cn("text-xl font-bold", daysLeft > 14 ? "text-muted-foreground" : daysLeft > 7 ? "text-warning" : "text-destructive")}>{daysLeft}</p>
                              <p className="text-xs text-muted-foreground">Days</p>
                            </div>
                          </div>
                          <div className="w-24 hidden md:block">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round((pkg.usedSessions / pkg.totalSessions) * 100)}%</span>
                            </div>
                            <Progress value={(pkg.usedSessions / pkg.totalSessions) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {historyPackages.length > 0 && (
            <>
              <SectionHeader title="Past Packages" />
              <div className="grid gap-3">
                {historyPackages.map((pkg) => (
                  <Card key={pkg.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleViewPackage(pkg)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pkg.trainer.name} • {format(pkg.startDate, "MMM d")} - {format(pkg.expiryDate, "MMM d, yyyy")} • {pkg.usedSessions}/{pkg.totalSessions} used
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

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <SectionHeader 
            title="PT Sessions" 
            action={
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Schedule Session
              </Button>
            }
          />
          <ResponsiveTable
            data={paginatedSessions}
            columns={sessionColumns}
            keyExtractor={(item) => item.id}
            onRowClick={handleViewSession}
            pagination={sessionsPagination}
            rowActions={[
              { icon: Eye, label: "View Details", onClick: handleViewSession },
            ]}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <SectionHeader 
            title="PT Payments" 
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

      {/* Package Details Sheet */}
      <QuickAddSheet
        open={showPackageSheet}
        onOpenChange={setShowPackageSheet}
        title={selectedPackage?.name || "Package Details"}
        description={selectedPackage ? `Trainer: ${selectedPackage.trainer.name}` : ""}
      >
        {selectedPackage && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedPackage.trainer.image} alt={selectedPackage.trainer.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedPackage.trainer.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedPackage.trainer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPackage.trainer.specialization}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedPackage.status) as "success" | "warning" | "error" | "info"} label={selectedPackage.status.charAt(0).toUpperCase() + selectedPackage.status.slice(1)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Package className="w-4 h-4" />Type</span>
              <span className="font-medium capitalize">{selectedPackage.type.replace("-", " ")}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4" />Price</span>
              <span className="font-bold">{selectedPackage.price}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" />Period</span>
              <span className="font-medium text-sm">{format(selectedPackage.startDate, "MMM d")} - {format(selectedPackage.expiryDate, "MMM d, yyyy")}</span>
            </div>
            
            <Label className="text-sm font-medium">Session Progress</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-muted-foreground">{selectedPackage.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{selectedPackage.usedSessions}</p>
                <p className="text-xs text-muted-foreground">Used</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{selectedPackage.remainingSessions}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round((selectedPackage.usedSessions / selectedPackage.totalSessions) * 100)}%</span>
              </div>
              <Progress value={(selectedPackage.usedSessions / selectedPackage.totalSessions) * 100} className="h-2" />
            </div>
          </div>
        )}
      </QuickAddSheet>

      {/* Session Details Sheet */}
      <QuickAddSheet
        open={showSessionSheet}
        onOpenChange={setShowSessionSheet}
        title={selectedSession?.type || "Session Details"}
        description={selectedSession ? format(selectedSession.date, "EEEE, MMMM d, yyyy") : ""}
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedSession.status) as "success" | "warning" | "error"} label={selectedSession.status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" />Time</span>
              <span className="font-medium">{selectedSession.time}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Timer className="w-4 h-4" />Duration</span>
              <span className="font-medium">{selectedSession.duration}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4" />Trainer</span>
              <span className="font-medium">{selectedSession.trainer}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" />Location</span>
              <span className="font-medium">{selectedSession.location}</span>
            </div>
            {selectedSession.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                <span className="text-sm">{selectedSession.notes}</span>
              </div>
            )}
            {selectedSession.status === "scheduled" && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            )}
          </div>
        )}
      </QuickAddSheet>

      {/* Payment Details Sheet */}
      <QuickAddSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        title={selectedPayment?.packageName || "Payment Details"}
        description={selectedPayment ? `Receipt: ${selectedPayment.receiptNo}` : ""}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={getStatusColor(selectedPayment.status) as "success" | "warning" | "error"} label={selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4" />Trainer</span>
              <span className="font-medium">{selectedPayment.trainer}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Sessions</span>
              <span className="font-medium">{selectedPayment.sessions} sessions</span>
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
              <FileText className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        )}
      </QuickAddSheet>
    </div>
  );
}
