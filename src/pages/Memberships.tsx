import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { DurationInput } from "@/components/forms/DurationInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingUp, Package, Star, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface Membership {
  id: number;
  planId: string;
  name: string;
  duration: string;
  price: string;
  features: string;
  activeMembers: number;
  status: "active" | "inactive";
  createdAt: string;
}

const sampleData: Membership[] = [
  { id: 1, planId: "PLAN-001", name: "Standard Monthly", duration: "1 Month", price: "$49.99", features: "Gym access, Locker", activeMembers: 342, status: "active", createdAt: "Jan 1, 2024" },
  { id: 2, planId: "PLAN-002", name: "Standard Quarterly", duration: "3 Months", price: "$129.99", features: "Gym access, Locker, 2 PT sessions", activeMembers: 186, status: "active", createdAt: "Jan 1, 2024" },
  { id: 3, planId: "PLAN-003", name: "Premium Monthly", duration: "1 Month", price: "$79.99", features: "Full access, Locker, Pool, Sauna", activeMembers: 234, status: "active", createdAt: "Jan 1, 2024" },
  { id: 4, planId: "PLAN-004", name: "Premium Annual", duration: "12 Months", price: "$799.99", features: "Full access, All amenities, 12 PT sessions", activeMembers: 156, status: "active", createdAt: "Jan 1, 2024" },
  { id: 5, planId: "PLAN-005", name: "VIP Monthly", duration: "1 Month", price: "$149.99", features: "24/7 access, Personal trainer, All amenities", activeMembers: 89, status: "active", createdAt: "Feb 15, 2024" },
  { id: 6, planId: "PLAN-006", name: "Student Monthly", duration: "1 Month", price: "$29.99", features: "Gym access (off-peak)", activeMembers: 127, status: "active", createdAt: "Mar 1, 2024" },
  { id: 7, planId: "PLAN-007", name: "Corporate Package", duration: "12 Months", price: "$3,999.99", features: "10 member passes, Meeting room", activeMembers: 8, status: "inactive", createdAt: "Jan 1, 2024" },
  { id: 8, planId: "PLAN-008", name: "Senior Discount", duration: "1 Month", price: "$34.99", features: "Gym access, Pool (off-peak)", activeMembers: 67, status: "active", createdAt: "Apr 1, 2024" },
  { id: 9, planId: "PLAN-009", name: "Couples Plan", duration: "1 Month", price: "$89.99", features: "2 members, Full gym access", activeMembers: 45, status: "active", createdAt: "May 1, 2024" },
  { id: 10, planId: "PLAN-010", name: "Trial Week", duration: "1 Week", price: "$19.99", features: "Full access trial", activeMembers: 23, status: "inactive", createdAt: "Jun 1, 2024" },
];

const columns: Column<Membership>[] = [
  {
    key: "name",
    label: "Plan",
    priority: "always",
    render: (value: string, item: Membership) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground md:hidden">{item.price}</p>
      </div>
    ),
  },
  { key: "planId", label: "ID", priority: "xl" },
  { key: "duration", label: "Duration", priority: "md" },
  { key: "price", label: "Price", priority: "md", render: (value: string) => <span className="font-semibold text-primary">{value}</span> },
  { key: "features", label: "Features", priority: "lg", render: (value: string) => <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{value}</span> },
  { key: "activeMembers", label: "Members", priority: "always", render: (value: number) => <span className="font-medium">{value}</span> },
  { key: "createdAt", label: "Created", priority: "xl" },
  { key: "status", label: "Status", priority: "lg", render: (value: "active" | "inactive") => <StatusBadge status={value === "active" ? "success" : "neutral"} label={value.charAt(0).toUpperCase() + value.slice(1)} /> },
];

export default function Memberships() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    setupFee: "",
    features: "",
    description: "",
    status: "active",
    autoRenew: true,
    gracePeriod: "7",
  });

  const [duration, setDuration] = useState({
    years: 0,
    months: 1,
    weeks: 0,
    days: 0,
  });

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["name", "planId"],
  });

  const handleView = (item: Membership) => {
    navigate(`/memberships/${item.id}`);
  };

  const handleEdit = (item: Membership) => {
    toast.info(`Editing ${item.name}`);
  };

  const handleDelete = (item: Membership) => {
    toast.error(`Delete ${item.name}?`, {
      action: {
        label: "Confirm",
        onClick: () => toast.success(`${item.name} deleted`),
      },
    });
  };

  const rowActions: RowAction<Membership>[] = [
    { icon: Eye, label: "View", onClick: handleView, variant: "primary" },
    { icon: Pencil, label: "Edit", onClick: handleEdit },
    { icon: Trash2, label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  const handleSubmit = () => {
    // Validate duration
    const totalDays = (duration.years * 365) + (duration.months * 30) + (duration.weeks * 7) + duration.days;
    if (totalDays === 0) {
      toast.error("Please set a valid duration");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    if (!formData.price.trim()) {
      toast.error("Please enter a price");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Membership plan created successfully");
      setIsAddOpen(false);
      setIsSubmitting(false);
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      setupFee: "",
      features: "",
      description: "",
      status: "active",
      autoRenew: true,
      gracePeriod: "7",
    });
    setDuration({ years: 0, months: 1, weeks: 0, days: 0 });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">10</p>
              <p className="text-xs text-muted-foreground">Total Plans</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">$48.5K</p>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">342</p>
              <p className="text-xs text-muted-foreground">Most Popular</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">+12%</p>
              <p className="text-xs text-muted-foreground">Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search plans..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            key: "duration",
            label: "Duration",
            value: filters.duration || "all",
            onChange: (v) => handleFilter("duration", v),
            options: [
              { value: "1 Week", label: "1 Week" },
              { value: "1 Month", label: "1 Month" },
              { value: "3 Months", label: "3 Months" },
              { value: "12 Months", label: "12 Months" },
            ],
          },
        ]}
        actions={
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Plan
          </Button>
        }
      />

      {/* Table */}
      <ResponsiveTable 
        data={paginatedData} 
        columns={columns} 
        keyExtractor={(item) => item.id} 
        pagination={paginationProps}
        rowActions={rowActions}
        onRowClick={handleView}
      />

      {/* Quick Add Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Membership Plan"
        description="Create a new membership plan with custom duration"
        onSubmit={handleSubmit}
        submitLabel="Create Plan"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Premium Monthly"
              className="mt-1.5"
            />
          </div>

          <DurationInput 
            value={duration}
            onChange={setDuration}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="setupFee">Setup Fee</Label>
              <Input
                id="setupFee"
                type="number"
                value={formData.setupFee}
                onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                placeholder="0.00"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="List features separated by commas..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the plan..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gracePeriod">Grace Period (days)</Label>
              <Input
                id="gracePeriod"
                type="number"
                value={formData.gracePeriod}
                onChange={(e) => setFormData({ ...formData, gracePeriod: e.target.value })}
                placeholder="7"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
            <div>
              <Label htmlFor="autoRenew" className="font-medium">Auto Renew</Label>
              <p className="text-xs text-muted-foreground">Automatically renew membership on expiry</p>
            </div>
            <Switch
              id="autoRenew"
              checked={formData.autoRenew}
              onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
            />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
