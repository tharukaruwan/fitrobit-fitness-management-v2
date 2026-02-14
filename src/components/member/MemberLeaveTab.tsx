import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/ui/detail-page-template";
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface LeaveRecord {
  id: string;
  type: "annual" | "sick" | "personal" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  status: "approved" | "pending" | "rejected";
  reason: string;
}

const initialLeaves: LeaveRecord[] = [
  { id: "l1", type: "annual", startDate: "2026-03-10", endDate: "2026-03-14", days: 5, status: "pending", reason: "Family vacation" },
  { id: "l2", type: "sick", startDate: "2026-02-08", endDate: "2026-02-08", days: 1, status: "approved", reason: "Flu" },
  { id: "l3", type: "personal", startDate: "2026-01-20", endDate: "2026-01-20", days: 1, status: "approved", reason: "Personal errand" },
  { id: "l4", type: "annual", startDate: "2025-12-23", endDate: "2025-12-27", days: 5, status: "approved", reason: "Holiday break" },
  { id: "l5", type: "sick", startDate: "2025-11-15", endDate: "2025-11-16", days: 2, status: "approved", reason: "Back pain" },
];

const leaveStatusMap: Record<LeaveRecord["status"], "success" | "warning" | "error"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export function MemberLeaveTab() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves);
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [leavePage, setLeavePage] = useState(1);
  const [leaveForm, setLeaveForm] = useState({
    type: "annual" as LeaveRecord["type"],
    startDate: "",
    endDate: "",
    days: "1",
    reason: "",
  });
  const perPage = 5;

  const paginatedLeaves = useMemo(() => {
    const start = (leavePage - 1) * perPage;
    return leaves.slice(start, start + perPage);
  }, [leaves, leavePage]);

  const leaveBalance = useMemo(() => {
    const annual = 20 - leaves.filter((l) => l.type === "annual" && l.status === "approved").reduce((sum, l) => sum + l.days, 0);
    const sick = 10 - leaves.filter((l) => l.type === "sick" && l.status === "approved").reduce((sum, l) => sum + l.days, 0);
    return { annual: Math.max(0, annual), sick: Math.max(0, sick) };
  }, [leaves]);

  const handleAddLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast({ title: "Missing dates", variant: "destructive" });
      return;
    }
    const newLeave: LeaveRecord = {
      id: `l-${Date.now()}`,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: Number(leaveForm.days) || 1,
      status: "pending",
      reason: leaveForm.reason,
    };
    setLeaves((prev) => [newLeave, ...prev]);
    setShowAddLeave(false);
    setLeaveForm({ type: "annual", startDate: "", endDate: "", days: "1", reason: "" });
    toast({ title: "Leave request submitted" });
  };

  return (
    <>
      <div className="space-y-6">
        <SectionHeader
          title="Leave Management"
          action={
            <Button size="sm" onClick={() => setShowAddLeave(true)}>
              <Plus className="w-4 h-4 mr-1" /> Request Leave
            </Button>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: leaveBalance.annual.toString(), label: "Annual Left", cls: "text-primary" },
            { val: leaveBalance.sick.toString(), label: "Sick Left", cls: "text-warning" },
            {
              val: leaves.filter((l) => l.status === "approved").reduce((s, l) => s + l.days, 0).toString(),
              label: "Days Used",
              cls: "text-foreground",
            },
            {
              val: leaves.filter((l) => l.status === "pending").length.toString(),
              label: "Pending",
              cls: "text-warning",
            },
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
            {
              key: "type",
              label: "Type",
              priority: "always" as const,
              render: (v: string) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge>,
            },
            {
              key: "startDate",
              label: "From",
              priority: "always" as const,
              render: (v: string) => <span className="text-sm">{v}</span>,
            },
            {
              key: "endDate",
              label: "To",
              priority: "md" as const,
              render: (v: string) => <span className="text-sm">{v}</span>,
            },
            {
              key: "days",
              label: "Days",
              priority: "md" as const,
              render: (v: number) => <span className="text-sm font-medium">{v}</span>,
            },
            {
              key: "reason",
              label: "Reason",
              priority: "lg" as const,
              render: (v: string) => (
                <span className="text-xs text-muted-foreground truncate max-w-[150px] block">{v}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              priority: "always" as const,
              render: (v: LeaveRecord["status"]) => (
                <StatusBadge
                  status={leaveStatusMap[v]}
                  label={v.charAt(0).toUpperCase() + v.slice(1)}
                />
              ),
            },
          ]}
          keyExtractor={(item) => item.id}
          pagination={{
            currentPage: leavePage,
            totalPages: Math.max(1, Math.ceil(leaves.length / perPage)),
            totalItems: leaves.length,
            itemsPerPage: perPage,
            onPageChange: setLeavePage,
          }}
        />
      </div>

      {/* Add Leave Sheet */}
      <QuickAddSheet
        open={showAddLeave}
        onOpenChange={setShowAddLeave}
        title="Request Leave"
        onSubmit={handleAddLeave}
        submitLabel="Submit Request"
      >
        <div className="space-y-4">
          <div>
            <Label>Leave Type</Label>
            <Select
              value={leaveForm.type}
              onValueChange={(v) => setLeaveForm((f) => ({ ...f, type: v as LeaveRecord["type"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Days</Label>
            <Input
              type="number"
              value={leaveForm.days}
              onChange={(e) => setLeaveForm((f) => ({ ...f, days: e.target.value }))}
            />
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
      </QuickAddSheet>
    </>
  );
}