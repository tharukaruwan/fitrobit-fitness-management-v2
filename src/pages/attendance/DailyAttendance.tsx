import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Clock, Users } from "lucide-react";
import { AsyncSelectOption } from "@/components/ui/async-select";

interface AttendanceRecord {
  id: number;
  memberId: string;
  memberName: string;
  memberImage: string;
  checkIn: string;
  checkOut: string | null;
  duration: string;
  branch: string;
  status: "checked-in" | "checked-out";
}

const sampleData: AttendanceRecord[] = [
  { id: 1, memberId: "MEM-001", memberName: "John Smith", memberImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150", checkIn: "06:30 AM", checkOut: "08:15 AM", duration: "1h 45m", branch: "Downtown", status: "checked-out" },
  { id: 2, memberId: "MEM-002", memberName: "Sarah Johnson", memberImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", checkIn: "07:00 AM", checkOut: null, duration: "2h 15m", branch: "Downtown", status: "checked-in" },
  { id: 3, memberId: "MEM-003", memberName: "Mike Davis", memberImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", checkIn: "07:30 AM", checkOut: "09:00 AM", duration: "1h 30m", branch: "Westside", status: "checked-out" },
  { id: 4, memberId: "MEM-004", memberName: "Emily Chen", memberImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", checkIn: "08:00 AM", checkOut: null, duration: "1h 15m", branch: "Downtown", status: "checked-in" },
  { id: 5, memberId: "MEM-005", memberName: "David Wilson", memberImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", checkIn: "08:30 AM", checkOut: null, duration: "45m", branch: "Eastside", status: "checked-in" },
  { id: 6, memberId: "MEM-006", memberName: "Lisa Brown", memberImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", checkIn: "09:00 AM", checkOut: null, duration: "15m", branch: "Downtown", status: "checked-in" },
  { id: 7, memberId: "MEM-007", memberName: "James Taylor", memberImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", checkIn: "06:00 AM", checkOut: "07:30 AM", duration: "1h 30m", branch: "Westside", status: "checked-out" },
  { id: 8, memberId: "MEM-008", memberName: "Anna Martinez", memberImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", checkIn: "07:15 AM", checkOut: "09:30 AM", duration: "2h 15m", branch: "Downtown", status: "checked-out" },
  { id: 9, memberId: "MEM-009", memberName: "Robert Lee", memberImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", checkIn: "08:45 AM", checkOut: null, duration: "30m", branch: "Eastside", status: "checked-in" },
  { id: 10, memberId: "MEM-010", memberName: "Jessica White", memberImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", checkIn: "09:15 AM", checkOut: null, duration: "10m", branch: "Downtown", status: "checked-in" },
  { id: 11, memberId: "MEM-011", memberName: "Chris Anderson", memberImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150", checkIn: "05:30 AM", checkOut: "07:00 AM", duration: "1h 30m", branch: "Westside", status: "checked-out" },
  { id: 12, memberId: "MEM-012", memberName: "Michelle Garcia", memberImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150", checkIn: "06:45 AM", checkOut: "08:30 AM", duration: "1h 45m", branch: "Downtown", status: "checked-out" },
];

// Simulated async member search
const allMembers = sampleData.map((m) => ({
  value: m.memberName,
  label: m.memberName,
  subtitle: m.memberId,
}));

const searchMembers = async (query: string): Promise<AsyncSelectOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!query) return allMembers.slice(0, 5);
  return allMembers.filter(
    (m) => m.label.toLowerCase().includes(query.toLowerCase()) || m.subtitle?.toLowerCase().includes(query.toLowerCase())
  );
};

const columns: Column<AttendanceRecord>[] = [
  {
    key: "memberImage",
    label: "",
    priority: "always",
    className: "w-12",
    render: (value: string, item: AttendanceRecord) => (
      <ImagePreview src={value} alt={item.memberName} size="sm" />
    ),
  },
  {
    key: "memberName",
    label: "Member",
    priority: "always",
    render: (value: string, item: AttendanceRecord) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground md:hidden">{item.checkIn}</p>
      </div>
    ),
  },
  { key: "memberId", label: "ID", priority: "lg" },
  { key: "checkIn", label: "Check In", priority: "md" },
  { key: "checkOut", label: "Check Out", priority: "lg", render: (value: string | null) => value || "—" },
  { key: "duration", label: "Duration", priority: "md" },
  { key: "branch", label: "Branch", priority: "xl" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "checked-in" | "checked-out") => (
      <StatusBadge status={value === "checked-in" ? "success" : "neutral"} label={value === "checked-in" ? "In" : "Out"} />
    ),
  },
];

export default function DailyAttendance() {
  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["memberName", "memberId"],
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">42</p>
              <p className="text-xs text-muted-foreground">Total Check-ins</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">18</p>
              <p className="text-xs text-muted-foreground">Currently In</p>
            </div>
          </div>
        </div>
        {/* <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1.5h</p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </div> */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">7:15</p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search members..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          // {
          //   key: "memberName",
          //   label: "Member",
          //   type: "async",
          //   value: filters.memberName || "",
          //   onChange: (v) => handleFilter("memberName", v),
          //   onSearch: searchMembers,
          // } as FilterConfig,
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "checked-in", label: "Checked In" },
              { value: "checked-out", label: "Checked Out" },
            ],
          },
          {
            key: "branch",
            label: "Branch",
            value: filters.branch || "all",
            onChange: (v) => handleFilter("branch", v),
            options: [
              { value: "Downtown", label: "Downtown" },
              { value: "Westside", label: "Westside" },
              { value: "Eastside", label: "Eastside" },
            ],
          },
        ]}
      />

      {/* Date Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">{today}</h2>
      </div>

      {/* Table */}
      <ResponsiveTable data={paginatedData} columns={columns} keyExtractor={(item) => item.id} pagination={paginationProps} />
    </div>
  );
}
