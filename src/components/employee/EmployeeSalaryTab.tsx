import { useState, useMemo } from "react";
import { subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { Download, DollarSign, CheckCircle, Clock, FileText } from "lucide-react";

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

const initialSalary: SalaryRecord[] = [
  { id: "s1", month: "2026-02", baseSalary: 5500, bonus: 500, deductions: 350, netPay: 5650, status: "pending", paidDate: "—" },
  { id: "s2", month: "2026-01", baseSalary: 5500, bonus: 0, deductions: 350, netPay: 5150, status: "paid", paidDate: "2026-01-28" },
  { id: "s3", month: "2025-12", baseSalary: 5500, bonus: 1000, deductions: 350, netPay: 6150, status: "paid", paidDate: "2025-12-28" },
  { id: "s4", month: "2025-11", baseSalary: 5500, bonus: 0, deductions: 350, netPay: 5150, status: "paid", paidDate: "2025-11-28" },
  { id: "s5", month: "2025-10", baseSalary: 5500, bonus: 200, deductions: 350, netPay: 5350, status: "paid", paidDate: "2025-10-28" },
  { id: "s6", month: "2025-09", baseSalary: 5200, bonus: 0, deductions: 330, netPay: 4870, status: "paid", paidDate: "2025-09-28" },
];

const salaryStatusMap: Record<SalaryRecord["status"], "success" | "warning" | "info"> = {
  paid: "success",
  pending: "warning",
  processing: "info",
};

export function EmployeeSalaryTab() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [salaryRecords] = useState<SalaryRecord[]>(initialSalary);
  const [salaryStartDate, setSalaryStartDate] = useState<Date>(subDays(new Date(), 365));
  const [salaryEndDate, setSalaryEndDate] = useState<Date>(new Date());
  const [salaryPage, setSalaryPage] = useState(1);
  const perPage = 5;
  const baseSalary = 5500; // This would normally come from employee data

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

  const salaryStats = useMemo(() => {
    const totalPaid = filteredSalary.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netPay, 0);
    const totalPending = filteredSalary.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.netPay, 0);
    return { totalPaid, totalPending };
  }, [filteredSalary]);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((r) => headers.map((h) => String(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported" });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Salary & Payroll"
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportCSV(filteredSalary as unknown as Record<string, unknown>[], "employee_salary")
            }
          >
            <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />
      <DateRangeFields
        startDate={salaryStartDate}
        endDate={salaryEndDate}
        onStartDateChange={(d) => {
          setSalaryStartDate(d);
          setSalaryPage(1);
        }}
        onEndDateChange={(d) => {
          setSalaryEndDate(d);
          setSalaryPage(1);
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            val: formatCurrency(baseSalary),
            label: "Base Salary",
            cls: "text-foreground",
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            val: formatCurrency(salaryStats.totalPaid),
            label: "Total Paid",
            cls: "text-success",
            icon: <CheckCircle className="w-4 h-4 text-success" />,
          },
          {
            val: formatCurrency(salaryStats.totalPending),
            label: "Pending",
            cls: "text-warning",
            icon: <Clock className="w-4 h-4 text-warning" />,
          },
          {
            val: filteredSalary.length.toString(),
            label: "Pay Records",
            cls: "text-primary",
            icon: <FileText className="w-4 h-4 text-primary" />,
          },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              {s.icon}
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Payment History" />
      <ResponsiveTable
        data={paginatedSalary}
        columns={[
          {
            key: "month",
            label: "Month",
            priority: "always" as const,
            render: (v: string) => <span className="text-sm font-medium">{v}</span>,
          },
          {
            key: "baseSalary",
            label: "Base",
            priority: "md" as const,
            render: (v: number) => <span className="text-sm">{formatCurrency(v)}</span>,
          },
          {
            key: "bonus",
            label: "Bonus",
            priority: "md" as const,
            render: (v: number) => (
              <span className={cn("text-sm", v > 0 && "text-success font-medium")}>
                {v > 0 ? `+${formatCurrency(v)}` : "—"}
              </span>
            ),
          },
          {
            key: "deductions",
            label: "Deductions",
            priority: "lg" as const,
            render: (v: number) => <span className="text-sm text-destructive">-{formatCurrency(v)}</span>,
          },
          {
            key: "netPay",
            label: "Net Pay",
            priority: "always" as const,
            render: (v: number) => <span className="text-sm font-semibold">{formatCurrency(v)}</span>,
          },
          {
            key: "status",
            label: "Status",
            priority: "always" as const,
            render: (v: SalaryRecord["status"]) => (
              <StatusBadge
                status={salaryStatusMap[v]}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
              />
            ),
          },
          {
            key: "paidDate",
            label: "Paid On",
            priority: "lg" as const,
            render: (v: string) => <span className="text-xs text-muted-foreground">{v}</span>,
          },
        ]}
        keyExtractor={(item) => item.id}
        pagination={{
          currentPage: salaryPage,
          totalPages: Math.max(1, Math.ceil(filteredSalary.length / perPage)),
          totalItems: filteredSalary.length,
          itemsPerPage: perPage,
          onPageChange: setSalaryPage,
        }}
      />
    </div>
  );
}