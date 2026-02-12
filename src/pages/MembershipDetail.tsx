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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { DurationInput, DurationValue } from "@/components/forms/DurationInput";
import { InformationTab } from "@/components/detail-tabs/InformationTab";
import { RulesTab } from "@/components/detail-tabs/RulesTab";
import { ScheduleTab } from "@/components/detail-tabs/ScheduleTab";
import { 
  Package, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Eye,
  Save,
  BarChart3,
  CheckCircle2,
  Info,
  ShieldCheck,
  Calendar,
} from "lucide-react";

// Form validation schema
const membershipFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  price: z.number().min(0, "Price must be positive"),
  setupFee: z.number().min(0, "Setup fee must be positive"),
  description: z.string().max(500),
  autoRenew: z.boolean(),
  gracePeriod: z.number().min(0).max(30),
  features: z.string(),
});

type MembershipFormValues = z.infer<typeof membershipFormSchema>;

// Sample membership plan data
const membershipData = {
  id: 1,
  planId: "PLAN-001",
  name: "Premium Monthly",
  duration: { years: 0, months: 1, weeks: 0, days: 0 } as DurationValue,
  durationDays: 30,
  price: 79.99,
  setupFee: 25,
  features: ["Full gym access", "Locker", "Pool access", "Sauna", "2 PT sessions"],
  activeMembers: 234,
  totalRevenue: 18717.66,
  status: "active" as const,
  createdAt: "Jan 1, 2024",
  description: "Our most popular membership plan with full access to all amenities.",
  autoRenew: true,
  gracePeriod: 7,
};

// Sample members on this plan
interface PlanMember {
  id: number;
  memberId: string;
  name: string;
  joinDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
  amountPaid: string;
}

const planMembers: PlanMember[] = [
  { id: 1, memberId: "MEM-001", name: "John Smith", joinDate: "Jan 15, 2024", expiryDate: "Feb 15, 2024", status: "active", amountPaid: "$79.99" },
  { id: 2, memberId: "MEM-005", name: "Sarah Wilson", joinDate: "Jan 20, 2024", expiryDate: "Feb 20, 2024", status: "active", amountPaid: "$79.99" },
  { id: 3, memberId: "MEM-012", name: "Mike Johnson", joinDate: "Dec 10, 2023", expiryDate: "Jan 10, 2024", status: "expired", amountPaid: "$79.99" },
  { id: 4, memberId: "MEM-018", name: "Emily Davis", joinDate: "Jan 25, 2024", expiryDate: "Feb 25, 2024", status: "active", amountPaid: "$79.99" },
  { id: 5, memberId: "MEM-023", name: "Robert Brown", joinDate: "Jan 28, 2024", expiryDate: "Feb 28, 2024", status: "pending", amountPaid: "$79.99" },
];

// Sample revenue history
interface RevenueRecord {
  id: number;
  month: string;
  newSignups: number;
  renewals: number;
  revenue: string;
  growth: string;
}

const revenueHistory: RevenueRecord[] = [
  { id: 1, month: "January 2024", newSignups: 45, renewals: 189, revenue: "$18,717.66", growth: "+12%" },
  { id: 2, month: "December 2023", newSignups: 38, renewals: 176, revenue: "$17,118.66", growth: "+8%" },
  { id: 3, month: "November 2023", newSignups: 42, renewals: 168, revenue: "$16,798.00", growth: "+5%" },
  { id: 4, month: "October 2023", newSignups: 35, renewals: 162, revenue: "$15,760.00", growth: "+3%" },
];

const memberColumns: Column<PlanMember>[] = [
  { key: "memberId", label: "ID", priority: "md" },
  { 
    key: "name", 
    label: "Member", 
    priority: "always",
    render: (value: string) => <span className="font-medium">{value}</span>
  },
  { key: "joinDate", label: "Join Date", priority: "lg" },
  { key: "expiryDate", label: "Expiry", priority: "md" },
  { key: "amountPaid", label: "Amount", priority: "always", render: (value: string) => <span className="font-semibold text-primary">{value}</span> },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "active" | "expired" | "pending") => (
      <StatusBadge 
        status={value === "active" ? "success" : value === "pending" ? "warning" : "neutral"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

const revenueColumns: Column<RevenueRecord>[] = [
  { key: "month", label: "Month", priority: "always" },
  { key: "newSignups", label: "New Signups", priority: "md" },
  { key: "renewals", label: "Renewals", priority: "md" },
  { key: "revenue", label: "Revenue", priority: "always", render: (value: string) => <span className="font-semibold text-primary">{value}</span> },
  { key: "growth", label: "Growth", priority: "lg", render: (value: string) => <span className="text-success font-medium">{value}</span> },
];

export default function MembershipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  
  const [duration, setDuration] = useState<DurationValue>(membershipData.duration);

  const plan = membershipData;

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: plan.name,
      price: plan.price,
      setupFee: plan.setupFee,
      description: plan.description,
      autoRenew: plan.autoRenew,
      gracePeriod: plan.gracePeriod,
      features: plan.features.join(", "),
    },
  });

  const onSubmit = (data: MembershipFormValues) => {
    console.log("Saving membership:", data, "Duration:", duration);
    toast({ title: "Saved", description: "Membership plan updated successfully." });
  };

  const handleViewMember = (member: PlanMember) => {
    navigate(`/members/${member.id}`);
  };

  const memberActions: RowAction<PlanMember>[] = [
    { icon: Eye, label: "View Member", onClick: handleViewMember, variant: "primary" },
  ];

  // Overview Tab - Always Editable Form
  const OverviewTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader 
          title="Plan Details" 
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
                <FormLabel className="text-xs text-muted-foreground">Plan Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="text-xs text-muted-foreground">Plan ID</FormLabel>
            <Input value={plan.planId} disabled className="mt-2" />
          </div>

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
            name="setupFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Setup Fee</FormLabel>
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
        </div>

        <div>
          <FormLabel className="text-xs text-muted-foreground">Duration</FormLabel>
          <div className="mt-2">
            <DurationInput value={duration} onChange={setDuration} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gracePeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Grace Period (days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoRenew"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-6">
                <FormLabel className="text-sm">Auto Renew</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Features (comma-separated)</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[60px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Current Features</h4>
          <div className="flex flex-wrap gap-2">
            {plan.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );

  // Members Tab
  const MembersTab = (
    <div className="space-y-4">
      <SectionHeader 
        title={`Active Members (${planMembers.length})`}
      />
      <ResponsiveTable 
        data={planMembers} 
        columns={memberColumns} 
        keyExtractor={(item) => item.id}
        rowActions={memberActions}
        onRowClick={handleViewMember}
      />
    </div>
  );

  // Revenue Tab
  const RevenueTab = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">{plan.activeMembers}</p>
              <p className="text-xs text-muted-foreground truncate">Active Members</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(plan.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground truncate">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">+12%</p>
              <p className="text-xs text-muted-foreground truncate">Growth</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">92%</p>
              <p className="text-xs text-muted-foreground truncate">Renewal Rate</p>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Revenue History" />
      <ResponsiveTable 
        data={revenueHistory} 
        columns={revenueColumns} 
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  const tabs: DetailTab[] = [
    { id: "overview", label: "Overview", icon: <Package />, content: OverviewTab },
    { id: "members", label: "Members", icon: <Users />, content: MembersTab },
    { id: "revenue", label: "Revenue", icon: <TrendingUp />, content: RevenueTab },
    { id: "information", label: "Info", icon: <Info />, content: <InformationTab entityType="membership" /> },
    { id: "rules", label: "Rules", icon: <ShieldCheck />, content: <RulesTab entityType="membership" /> },
    { id: "schedule", label: "Schedule", icon: <Calendar />, content: <ScheduleTab entityType="membership" mode="single-week" /> },
  ];

  return (
    <DetailPageTemplate
      title={plan.name}
      subtitle={`${plan.planId} • ${formatCurrency(plan.price)}`}
      avatar={
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="w-7 h-7 text-primary" />
        </div>
      }
      badge={
        <StatusBadge 
          status={plan.status === "active" ? "success" : "neutral"} 
          label={plan.status.charAt(0).toUpperCase() + plan.status.slice(1)} 
        />
      }
      tabs={tabs}
      defaultTab="overview"
      backPath="/memberships"
    />
  );
}