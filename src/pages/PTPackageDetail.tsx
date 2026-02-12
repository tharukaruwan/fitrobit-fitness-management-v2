import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DetailPageTemplate, 
  DetailTab, 
  SectionHeader,
} from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "@/components/ui/image-preview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { InformationTab } from "@/components/detail-tabs/InformationTab";
import { RulesTab } from "@/components/detail-tabs/RulesTab";
import { ScheduleTab } from "@/components/detail-tabs/ScheduleTab";
import { 
  Target, 
  Clock, 
  Users, 
  Calendar,
  DollarSign,
  User,
  Eye,
  Save,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Info,
  ShieldCheck,
} from "lucide-react";

// Form validation schema
const ptFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  packageType: z.enum(["session", "monthly"]),
  totalSessions: z.number().min(1, "At least 1 session required"),
  validityDays: z.number().min(1, "Validity must be at least 1 day"),
  price: z.number().min(0, "Price must be positive"),
  trainerName: z.string().min(1, "Trainer is required"),
  description: z.string().max(500),
});

type PTFormValues = z.infer<typeof ptFormSchema>;

// Sample PT package data
const packageData = {
  id: "p1",
  name: "Starter Pack",
  packageType: "session" as const,
  totalSessions: 10,
  sessionsPerMonth: undefined,
  validityDays: 60,
  price: 250,
  trainerId: "t1",
  trainerName: "John Smith",
  trainerImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
  status: "active" as const,
  createdAt: "Jan 15, 2024",
  description: "Perfect for beginners looking to build a foundation with personal training.",
  activeAssignments: 12,
  totalRevenue: 3000,
};

// Sample assigned members
interface AssignedMember {
  id: string;
  memberId: string;
  memberName: string;
  memberImage: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
}

const assignedMembers: AssignedMember[] = [
  { id: "mp1", memberId: "MEM-001", memberName: "Alice Brown", memberImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", totalSessions: 10, usedSessions: 6, remainingSessions: 4, startDate: "Jan 20, 2024", expiryDate: "Mar 20, 2024", status: "active" },
  { id: "mp2", memberId: "MEM-005", memberName: "Bob Wilson", memberImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", totalSessions: 10, usedSessions: 10, remainingSessions: 0, startDate: "Jan 10, 2024", expiryDate: "Mar 10, 2024", status: "completed" },
  { id: "mp3", memberId: "MEM-012", memberName: "Carol Davis", memberImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", totalSessions: 10, usedSessions: 3, remainingSessions: 7, startDate: "Feb 01, 2024", expiryDate: "Apr 01, 2024", status: "active" },
  { id: "mp4", memberId: "MEM-018", memberName: "David Lee", memberImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", totalSessions: 10, usedSessions: 10, remainingSessions: 0, startDate: "Dec 15, 2023", expiryDate: "Feb 15, 2024", status: "expired" },
];

// Sample session history
interface SessionRecord {
  id: number;
  date: string;
  memberName: string;
  sessionNumber: string;
  duration: string;
  notes: string;
}

const sessionHistory: SessionRecord[] = [
  { id: 1, date: "Jan 29, 2024", memberName: "Alice Brown", sessionNumber: "6/10", duration: "60 min", notes: "Upper body focus" },
  { id: 2, date: "Jan 28, 2024", memberName: "Carol Davis", sessionNumber: "3/10", duration: "60 min", notes: "Cardio and core" },
  { id: 3, date: "Jan 27, 2024", memberName: "Alice Brown", sessionNumber: "5/10", duration: "60 min", notes: "Lower body workout" },
  { id: 4, date: "Jan 26, 2024", memberName: "Carol Davis", sessionNumber: "2/10", duration: "60 min", notes: "Full body intro" },
  { id: 5, date: "Jan 25, 2024", memberName: "Alice Brown", sessionNumber: "4/10", duration: "60 min", notes: "Flexibility training" },
];

const memberColumns: Column<AssignedMember>[] = [
  { 
    key: "memberImage", 
    label: "", 
    priority: "always", 
    className: "w-10",
    render: (value: string, item: AssignedMember) => <ImagePreview src={value} alt={item.memberName} size="sm" />
  },
  { 
    key: "memberName", 
    label: "Member", 
    priority: "always",
    render: (value: string, item: AssignedMember) => (
      <div>
        <p className="font-medium text-sm">{value}</p>
        <p className="text-xs text-muted-foreground">{item.memberId}</p>
      </div>
    )
  },
  { 
    key: "remainingSessions", 
    label: "Progress", 
    priority: "always",
    render: (_, item: AssignedMember) => {
      const progress = (item.usedSessions / item.totalSessions) * 100;
      return (
        <div className="space-y-1 min-w-[80px]">
          <div className="flex justify-between text-xs">
            <span>{item.usedSessions} used</span>
            <span>{item.remainingSessions} left</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      );
    },
  },
  { key: "expiryDate", label: "Expires", priority: "md" },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "active" | "expired" | "completed") => (
      <StatusBadge 
        status={value === "active" ? "success" : value === "completed" ? "info" : "neutral"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

const sessionColumns: Column<SessionRecord>[] = [
  { key: "date", label: "Date", priority: "always" },
  { key: "memberName", label: "Member", priority: "always" },
  { key: "sessionNumber", label: "Session", priority: "md" },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "notes", label: "Notes", priority: "lg", render: (value: string) => <span className="text-muted-foreground text-xs truncate max-w-[120px] block">{value}</span> },
];

export default function PTPackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const pkg = packageData;

  const form = useForm<PTFormValues>({
    resolver: zodResolver(ptFormSchema),
    defaultValues: {
      name: pkg.name,
      packageType: pkg.packageType,
      totalSessions: pkg.totalSessions,
      validityDays: pkg.validityDays,
      price: pkg.price,
      trainerName: pkg.trainerName,
      description: pkg.description,
    },
  });

  const onSubmit = (data: PTFormValues) => {
    console.log("Saving PT package:", data);
    toast({ title: "Saved", description: "PT package updated successfully." });
  };

  const handleViewMember = (member: AssignedMember) => {
    navigate(`/members/${member.id}`);
  };

  const memberActions: RowAction<AssignedMember>[] = [
    { icon: Eye, label: "View Member", onClick: handleViewMember, variant: "primary" },
    { icon: CheckCircle2, label: "Record Session", onClick: () => toast({ title: "Session recorded" }) },
  ];

  // Overview Tab - Always Editable Form
  const OverviewTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader 
          title="Package Details" 
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
                <FormLabel className="text-xs text-muted-foreground">Package Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="packageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Package Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="session">Session-based</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Total Sessions</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Validity (days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Trainer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trainer Info */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Assigned Trainer</h4>
          <div className="flex items-center gap-3">
            <ImagePreview src={pkg.trainerImage} alt={pkg.trainerName} size="sm" />
            <div>
              <p className="font-medium text-sm">{pkg.trainerName}</p>
              <p className="text-xs text-muted-foreground">Personal Trainer</p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  // Assigned Members Tab
  const MembersTab = (
    <div className="space-y-4">
      <SectionHeader 
        title={`Assigned Members (${assignedMembers.length})`}
      />
      <ResponsiveTable 
        data={assignedMembers} 
        columns={memberColumns} 
        keyExtractor={(item) => item.id}
        rowActions={memberActions}
        onRowClick={handleViewMember}
      />
    </div>
  );

  // Sessions Tab
  const SessionsTab = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">{pkg.activeAssignments}</p>
              <p className="text-xs text-muted-foreground truncate">Active Clients</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(pkg.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground truncate">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">48</p>
              <p className="text-xs text-muted-foreground truncate">Sessions Done</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">+8%</p>
              <p className="text-xs text-muted-foreground truncate">This Month</p>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Recent Sessions" />
      <ResponsiveTable 
        data={sessionHistory} 
        columns={sessionColumns} 
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  const tabs: DetailTab[] = [
    { id: "overview", label: "Overview", icon: <Target />, content: OverviewTab },
    { id: "members", label: "Members", icon: <Users />, content: MembersTab },
    { id: "sessions", label: "Sessions", icon: <BarChart3 />, content: SessionsTab },
    { id: "information", label: "Info", icon: <Info />, content: <InformationTab entityType="PT package" /> },
    { id: "rules", label: "Rules", icon: <ShieldCheck />, content: <RulesTab entityType="PT package" /> },
    { id: "schedule", label: "Schedule", icon: <Calendar />, content: <ScheduleTab entityType="PT package" mode="recurring" /> },
  ];

  return (
    <DetailPageTemplate
      title={pkg.name}
      subtitle={`${pkg.packageType === "session" ? "Session-based" : "Monthly"} • ${pkg.totalSessions} sessions • ${formatCurrency(pkg.price)}`}
      avatar={
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-7 h-7 text-primary" />
        </div>
      }
      badge={
        <StatusBadge 
          status={pkg.status === "active" ? "success" : "neutral"} 
          label={pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)} 
        />
      }
      tabs={tabs}
      defaultTab="overview"
      backPath="/training/personal"
    />
  );
}