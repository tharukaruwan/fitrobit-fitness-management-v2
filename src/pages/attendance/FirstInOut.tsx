import { useState } from "react";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { subDays } from "date-fns";

interface FirstInOutRecord {
  id: number;
  memberId: string;
  memberName: string;
  memberImage: string;
  firstIn: string;
  lastOut: string;
  totalDuration: string;
  visits: number;
  membershipType: string;
}

const sampleData: FirstInOutRecord[] = [
  { id: 1, memberId: "MEM-001", memberName: "John Smith", memberImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150", firstIn: "05:45 AM", lastOut: "07:30 AM", totalDuration: "1h 45m", visits: 1, membershipType: "Premium" },
  { id: 2, memberId: "MEM-002", memberName: "Sarah Johnson", memberImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", firstIn: "06:00 AM", lastOut: "—", totalDuration: "3h 15m+", visits: 1, membershipType: "VIP" },
  { id: 3, memberId: "MEM-008", memberName: "Alex Turner", memberImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", firstIn: "06:15 AM", lastOut: "08:00 AM", totalDuration: "1h 45m", visits: 1, membershipType: "Standard" },
  { id: 4, memberId: "MEM-003", memberName: "Mike Davis", memberImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", firstIn: "06:30 AM", lastOut: "09:00 AM", totalDuration: "2h 30m", visits: 2, membershipType: "Premium" },
  { id: 5, memberId: "MEM-009", memberName: "Rachel Green", memberImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", firstIn: "07:00 AM", lastOut: "—", totalDuration: "2h 15m+", visits: 1, membershipType: "VIP" },
  { id: 6, memberId: "MEM-004", memberName: "Emily Chen", memberImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", firstIn: "07:15 AM", lastOut: "09:30 AM", totalDuration: "2h 15m", visits: 1, membershipType: "Premium" },
  { id: 7, memberId: "MEM-010", memberName: "David Wilson", memberImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", firstIn: "07:30 AM", lastOut: "—", totalDuration: "1h 45m+", visits: 1, membershipType: "Standard" },
  { id: 8, memberId: "MEM-005", memberName: "Lisa Brown", memberImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", firstIn: "08:00 AM", lastOut: "10:00 AM", totalDuration: "2h", visits: 1, membershipType: "VIP" },
  { id: 9, memberId: "MEM-011", memberName: "James Taylor", memberImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", firstIn: "08:30 AM", lastOut: "—", totalDuration: "45m+", visits: 1, membershipType: "Standard" },
  { id: 10, memberId: "MEM-012", memberName: "Anna Martinez", memberImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", firstIn: "09:00 AM", lastOut: "—", totalDuration: "15m+", visits: 1, membershipType: "Premium" },
];

const columns: Column<FirstInOutRecord>[] = [
  {
    key: "memberImage",
    label: "",
    priority: "always",
    className: "w-12",
    render: (value: string, item: FirstInOutRecord) => <ImagePreview src={value} alt={item.memberName} size="sm" />,
  },
  {
    key: "memberName",
    label: "Member",
    priority: "always",
    render: (value: string, item: FirstInOutRecord) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground md:hidden">{item.firstIn}</p>
      </div>
    ),
  },
  { key: "memberId", label: "ID", priority: "xl" },
  {
    key: "firstIn",
    label: "First In",
    priority: "md",
    render: (value: string) => (
      <div className="flex items-center gap-1.5">
        <TrendingDown className="w-3.5 h-3.5 text-success" />
        <span>{value}</span>
      </div>
    ),
  },
  {
    key: "lastOut",
    label: "Last Out",
    priority: "md",
    render: (value: string) => (
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-warning" />
        <span>{value}</span>
      </div>
    ),
  },
  { key: "totalDuration", label: "Total Time", priority: "always", render: (value: string) => <span className="font-medium text-primary">{value}</span> },
  { key: "visits", label: "Visits", priority: "lg" },
  {
    key: "membershipType",
    label: "Membership",
    priority: "lg",
    render: (value: string) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === "VIP" ? "bg-warning/10 text-warning" : value === "Premium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {value}
      </span>
    ),
  },
];

export default function FirstInOut() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["memberName", "memberId"],
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">05:45</p>
              <p className="text-xs text-muted-foreground">First Check-in</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">10:00</p>
              <p className="text-xs text-muted-foreground">Last Check-out</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">2h 10m</p>
              <p className="text-xs text-muted-foreground">Avg Session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range & Filters */}
      <div className="flex flex-col gap-3">
        <DateRangeFields
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <FilterBar
          searchPlaceholder="Search members..."
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          filters={[
            {
              key: "membershipType",
              label: "Membership",
              value: filters.membershipType || "all",
              onChange: (v) => handleFilter("membershipType", v),
              options: [
                { value: "VIP", label: "VIP" },
                { value: "Premium", label: "Premium" },
                { value: "Standard", label: "Standard" },
              ],
            },
          ]}
        />
      </div>

      {/* Table */}
      <ResponsiveTable data={paginatedData} columns={columns} keyExtractor={(item) => item.id} pagination={paginationProps} />
    </div>
  );
}
