import { useState, useMemo } from "react";
import { subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Download, Plus } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: "present" | "absent" | "late" | "half-day";
  notes: string;
}

const initialAttendance: AttendanceRecord[] = [
  { id: "a1", date: "2026-02-11", checkIn: "08:55", checkOut: "18:05", totalHours: "9h 10m", status: "present", notes: "" },
  { id: "a2", date: "2026-02-10", checkIn: "09:15", checkOut: "18:00", totalHours: "8h 45m", status: "late", notes: "Traffic delay" },
  { id: "a3", date: "2026-02-09", checkIn: "08:50", checkOut: "18:10", totalHours: "9h 20m", status: "present", notes: "" },
  { id: "a4", date: "2026-02-08", checkIn: "—", checkOut: "—", totalHours: "—", status: "absent", notes: "Sick leave" },
  { id: "a5", date: "2026-02-07", checkIn: "09:00", checkOut: "13:00", totalHours: "4h", status: "half-day", notes: "Doctor appointment" },
  { id: "a6", date: "2026-02-06", checkIn: "08:45", checkOut: "18:00", totalHours: "9h 15m", status: "present", notes: "" },
  { id: "a7", date: "2026-02-05", checkIn: "08:50", checkOut: "18:05", totalHours: "9h 15m", status: "present", notes: "" },
  { id: "a8", date: "2026-02-04", checkIn: "09:00", checkOut: "18:00", totalHours: "9h", status: "present", notes: "" },
];

const attendanceStatusMap: Record<AttendanceRecord["status"], "success" | "error" | "warning" | "info"> = {
  present: "success",
  absent: "error",
  late: "warning",
  "half-day": "info",
};

export function EmployeeAttendanceTab() {
  const { toast } = useToast();
  const [attendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [attStartDate, setAttStartDate] = useState<Date>(subDays(new Date(), 30));
  const [attEndDate, setAttEndDate] = useState<Date>(new Date());
  const [attPage, setAttPage] = useState(1);
  const perPage = 5;

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: startOfDay(attStartDate), end: endOfDay(attEndDate) });
    });
  }, [attendance, attStartDate, attEndDate]);

  const paginatedAttendance = useMemo(() => {
    const start = (attPage - 1) * perPage;
    return filteredAttendance.slice(start, start + perPage);
  }, [filteredAttendance, attPage]);

  const attendanceStats = useMemo(() => {
    const present = filteredAttendance.filter((a) => a.status === "present").length;
    const late = filteredAttendance.filter((a) => a.status === "late").length;
    const absent = filteredAttendance.filter((a) => a.status === "absent").length;
    return { present, late, absent, total: filteredAttendance.length };
  }, [filteredAttendance]);

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
    <div className="space-y-4">
      <SectionHeader
        title="Attendance History"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCSV(
                  filteredAttendance as unknown as Record<string, unknown>[],
                  "employee_attendance"
                )
              }
            >
              <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => toast({ title: "Add attendance dialog would open" })}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        }
      />
      <DateRangeFields
        startDate={attStartDate}
        endDate={attEndDate}
        onStartDateChange={(d) => {
          setAttStartDate(d);
          setAttPage(1);
        }}
        onEndDateChange={(d) => {
          setAttEndDate(d);
          setAttPage(1);
        }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: attendanceStats.total, label: "Total Days", cls: "text-foreground" },
          { val: attendanceStats.present, label: "Present", cls: "text-success" },
          { val: attendanceStats.late, label: "Late", cls: "text-warning" },
          { val: attendanceStats.absent, label: "Absent", cls: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-3 border border-border/30 text-center">
            <p className={cn("text-xl font-bold", s.cls)}>{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <ResponsiveTable
        data={paginatedAttendance}
        columns={[
          {
            key: "date",
            label: "Date",
            priority: "always" as const,
            render: (v: string) => <span className="text-sm font-medium">{v}</span>,
          },
          {
            key: "checkIn",
            label: "In",
            priority: "always" as const,
            render: (v: string) => <span className="text-sm">{v}</span>,
          },
          {
            key: "checkOut",
            label: "Out",
            priority: "md" as const,
            render: (v: string) => <span className="text-sm">{v}</span>,
          },
          {
            key: "totalHours",
            label: "Hours",
            priority: "md" as const,
            render: (v: string) => <span className="text-sm font-medium">{v}</span>,
          },
          {
            key: "status",
            label: "Status",
            priority: "always" as const,
            render: (v: AttendanceRecord["status"]) => (
              <StatusBadge
                status={attendanceStatusMap[v]}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
              />
            ),
          },
          {
            key: "notes",
            label: "Notes",
            priority: "lg" as const,
            render: (v: string) => <span className="text-xs text-muted-foreground">{v || "—"}</span>,
          },
        ]}
        keyExtractor={(item) => item.id}
        pagination={{
          currentPage: attPage,
          totalPages: Math.max(1, Math.ceil(filteredAttendance.length / perPage)),
          totalItems: filteredAttendance.length,
          itemsPerPage: perPage,
          onPageChange: setAttPage,
        }}
      />
    </div>
  );
}