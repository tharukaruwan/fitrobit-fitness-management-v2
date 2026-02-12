import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { useToast } from "@/hooks/use-toast";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import {
  Users,
  User,
  CreditCard,
  Calendar,
  Clock,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Crown,
  UserPlus,
  Building2,
  Tag,
  DollarSign,
  Dumbbell,
} from "lucide-react";

// Types for membership data
interface LinkedMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  relationship: string;
  status: "active" | "inactive" | "expired";
}

interface CurrentMembership {
  id: string;
  name: string;
  type: "individual" | "couple" | "family";
  price: string;
  billingCycle: "monthly" | "quarterly" | "annual";
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expiring" | "expired";
  branch: string;
  features: string[];
  linkedMembers: LinkedMember[];
  autoRenew: boolean;
  paymentMethod: string;
}

interface HistoryMembership {
  id: string;
  name: string;
  type: "individual" | "couple" | "family";
  price: string;
  billingCycle: "monthly" | "quarterly" | "annual";
  startDate: Date;
  endDate: Date;
  status: "completed" | "cancelled" | "upgraded";
  branch: string;
  features: string[];
  linkedMembers: LinkedMember[];
  endReason?: string;
}

// Sample current membership
const sampleCurrentMembership: CurrentMembership = {
  id: "mem-current-1",
  name: "Premium Family Plan",
  type: "family",
  price: "$149.00",
  billingCycle: "monthly",
  startDate: new Date(2024, 0, 15),
  expiryDate: new Date(2025, 0, 15),
  status: "active",
  branch: "Downtown",
  features: [
    "Unlimited gym access",
    "All group classes",
    "Pool & sauna access",
    "Personal training discount (20%)",
    "Guest passes (2/month)",
  ],
  linkedMembers: [
    {
      id: "lm-1",
      name: "Sarah Smith",
      email: "sarah.smith@email.com",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      relationship: "Spouse",
      status: "active",
    },
    {
      id: "lm-2",
      name: "Tom Smith",
      email: "tom.smith@email.com",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      relationship: "Child",
      status: "active",
    },
  ],
  autoRenew: true,
  paymentMethod: "Credit Card •••• 4242",
};

// Sample history memberships
const sampleHistoryMemberships: HistoryMembership[] = [
  {
    id: "mem-hist-1",
    name: "Premium Couple Plan",
    type: "couple",
    price: "$99.00",
    billingCycle: "monthly",
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2024, 0, 14),
    status: "upgraded",
    branch: "Downtown",
    features: ["Unlimited gym access", "All group classes", "Pool access"],
    linkedMembers: [
      {
        id: "lm-1",
        name: "Sarah Smith",
        email: "sarah.smith@email.com",
        relationship: "Spouse",
        status: "active",
      },
    ],
    endReason: "Upgraded to Family Plan",
  },
  {
    id: "mem-hist-2",
    name: "Standard Individual",
    type: "individual",
    price: "$49.00",
    billingCycle: "monthly",
    startDate: new Date(2022, 10, 1),
    endDate: new Date(2023, 4, 31),
    status: "completed",
    branch: "Uptown",
    features: ["Gym access (6am-10pm)", "Basic equipment"],
    linkedMembers: [],
    endReason: "Plan ended - upgraded",
  },
  {
    id: "mem-hist-3",
    name: "Basic Trial",
    type: "individual",
    price: "$0.00",
    billingCycle: "monthly",
    startDate: new Date(2022, 9, 15),
    endDate: new Date(2022, 10, 14),
    status: "completed",
    branch: "Downtown",
    features: ["Limited gym access", "1 group class"],
    linkedMembers: [],
    endReason: "Trial period ended",
  },
  {
    id: "mem-hist-4",
    name: "Premium Individual",
    type: "individual",
    price: "$79.00",
    billingCycle: "monthly",
    startDate: new Date(2021, 3, 1),
    endDate: new Date(2022, 8, 30),
    status: "cancelled",
    branch: "Downtown",
    features: ["Unlimited access", "All classes"],
    linkedMembers: [],
    endReason: "Member requested cancellation",
  },
];

interface MemberMembershipTabProps {
  memberId: string;
  memberName: string;
}

export function MemberMembershipTab({ memberId, memberName }: MemberMembershipTabProps) {
  const { toast } = useToast();

  const [currentMembership] = useState<CurrentMembership>(sampleCurrentMembership);
  const [historyMemberships] = useState<HistoryMembership[]>(sampleHistoryMemberships);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [selectedHistoryMembership, setSelectedHistoryMembership] = useState<HistoryMembership | null>(null);

  // Paginated history
  const { paginatedData, paginationProps } = useTableData({
    data: historyMemberships,
    itemsPerPage: 5,
  });

  const handleViewHistory = (membership: HistoryMembership) => {
    setSelectedHistoryMembership(membership);
    setShowViewSheet(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "family":
        return <Users className="w-4 h-4" />;
      case "couple":
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "expiring":
        return "warning";
      case "expired":
        return "error";
      case "completed":
        return "info";
      case "upgraded":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "neutral";
    }
  };

  const getDaysRemaining = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const historyColumns: Column<HistoryMembership>[] = [
    {
      key: "name",
      label: "Plan Name",
      priority: "always",
      render: (value: string, item: HistoryMembership) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(item.type)}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      priority: "md",
      render: (value: string) => (
        <span className="capitalize text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      priority: "lg",
      render: (value: string, item: HistoryMembership) => (
        <span className="font-medium">
          {value}
          <span className="text-muted-foreground text-xs">/{item.billingCycle === "monthly" ? "mo" : item.billingCycle === "quarterly" ? "qtr" : "yr"}</span>
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Period",
      priority: "md",
      render: (value: Date, item: HistoryMembership) => (
        <span className="text-muted-foreground text-sm">
          {format(value, "MMM d, yyyy")} - {format(item.endDate, "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (value: string) => (
        <StatusBadge
          status={getStatusColor(value) as "success" | "warning" | "error" | "info" | "neutral"}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
        />
      ),
    },
  ];

  const daysRemaining = getDaysRemaining(currentMembership.expiryDate);

  return (
    <div className="space-y-6">
      {/* Current Membership */}
      <SectionHeader
        title="Current Membership"
        action={
          <Button size="sm" variant="outline">
            <CreditCard className="w-4 h-4 mr-1" />
            Change Plan
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className={cn(
          "h-2",
          currentMembership.status === "active" ? "bg-success" :
          currentMembership.status === "expiring" ? "bg-warning" : "bg-destructive"
        )} />
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Plan Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-warning" />
                    <h3 className="text-xl font-bold text-card-foreground">{currentMembership.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getTypeIcon(currentMembership.type)}
                    <span className="capitalize">{currentMembership.type} Plan</span>
                    <span>•</span>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{currentMembership.branch}</span>
                  </div>
                </div>
                <StatusBadge
                  status={getStatusColor(currentMembership.status) as "success" | "warning" | "error"}
                  label={currentMembership.status.charAt(0).toUpperCase() + currentMembership.status.slice(1)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Price
                  </div>
                  <p className="font-semibold text-card-foreground">
                    {currentMembership.price}
                    <span className="text-xs text-muted-foreground font-normal">
                      /{currentMembership.billingCycle === "monthly" ? "mo" : currentMembership.billingCycle === "quarterly" ? "qtr" : "yr"}
                    </span>
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Start Date
                  </div>
                  <p className="font-semibold text-card-foreground">{format(currentMembership.startDate, "MMM d, yyyy")}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Expires
                  </div>
                  <p className="font-semibold text-card-foreground">{format(currentMembership.expiryDate, "MMM d, yyyy")}</p>
                </div>
                <div className={cn(
                  "rounded-lg p-3",
                  daysRemaining > 30 ? "bg-success/10" : daysRemaining > 7 ? "bg-warning/10" : "bg-destructive/10"
                )}>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Days Left
                  </div>
                  <p className={cn(
                    "font-bold text-lg",
                    daysRemaining > 30 ? "text-success" : daysRemaining > 7 ? "text-warning" : "text-destructive"
                  )}>
                    {daysRemaining}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Included Features</Label>
                <div className="flex flex-wrap gap-2">
                  {currentMembership.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  {currentMembership.paymentMethod}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {currentMembership.autoRenew ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Auto-renew enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <XCircle className="w-4 h-4" />
                      Auto-renew disabled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Members (for Couple/Family) */}
            {currentMembership.type !== "individual" && currentMembership.linkedMembers.length > 0 && (
              <div className="lg:w-72 lg:border-l lg:border-border/50 lg:pl-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Linked Members ({currentMembership.linkedMembers.length})
                  </Label>
                  <Button size="sm" variant="ghost" className="h-7 px-2">
                    <UserPlus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentMembership.linkedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.relationship}</p>
                      </div>
                      <StatusBadge
                        status={member.status === "active" ? "success" : "neutral"}
                        label={member.status === "active" ? "Active" : "Inactive"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Membership History */}
      <SectionHeader title="Membership History" />
      <ResponsiveTable
        data={paginatedData}
        columns={historyColumns}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewHistory}
        pagination={paginationProps}
        rowActions={[
          {
            icon: Eye,
            label: "View Details",
            onClick: handleViewHistory,
          },
        ]}
      />

      {/* View History Sheet */}
      <QuickAddSheet
        open={showViewSheet}
        onOpenChange={setShowViewSheet}
        title={selectedHistoryMembership?.name || "Membership Details"}
        description={
          selectedHistoryMembership
            ? `${format(selectedHistoryMembership.startDate, "MMM d, yyyy")} - ${format(selectedHistoryMembership.endDate, "MMM d, yyyy")}`
            : ""
        }
      >
        {selectedHistoryMembership && (
          <div className="space-y-4">
            {/* Type & Branch */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                {getTypeIcon(selectedHistoryMembership.type)}
                Plan Type
              </span>
              <span className="font-medium capitalize">{selectedHistoryMembership.type}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Branch
              </span>
              <span className="font-medium">{selectedHistoryMembership.branch}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                Price
              </span>
              <span className="font-medium">
                {selectedHistoryMembership.price}
                <span className="text-muted-foreground text-xs">
                  /{selectedHistoryMembership.billingCycle === "monthly" ? "mo" : selectedHistoryMembership.billingCycle === "quarterly" ? "qtr" : "yr"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge
                status={getStatusColor(selectedHistoryMembership.status) as "success" | "warning" | "error" | "info" | "neutral"}
                label={selectedHistoryMembership.status.charAt(0).toUpperCase() + selectedHistoryMembership.status.slice(1)}
              />
            </div>

            {selectedHistoryMembership.endReason && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground block mb-1">End Reason</span>
                <span className="text-sm font-medium">{selectedHistoryMembership.endReason}</span>
              </div>
            )}

            {/* Features */}
            {selectedHistoryMembership.features.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4" />
                  Included Features
                </Label>
                <div className="space-y-1.5">
                  {selectedHistoryMembership.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Members */}
            {selectedHistoryMembership.linkedMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Linked Members ({selectedHistoryMembership.linkedMembers.length})
                </Label>
                <div className="space-y-2">
                  {selectedHistoryMembership.linkedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </QuickAddSheet>
    </div>
  );
}
