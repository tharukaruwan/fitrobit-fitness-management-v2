import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { Ticket, DollarSign, Users, TrendingUp } from "lucide-react";

interface DayPass {
  id: number;
  passId: string;
  visitorName: string;
  visitorImage: string;
  phone: string;
  email: string;
  passType: string;
  price: string;
  validDate: string;
  checkIn: string;
  checkOut: string | null;
  status: "active" | "used" | "expired";
  branch: string;
}

const sampleData: DayPass[] = [
  { id: 1, passId: "DAY-001", visitorName: "Alex Turner", visitorImage: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150", phone: "+1 555 123 4567", email: "alex.t@email.com", passType: "Full Day", price: "$25.00", validDate: "Dec 31, 2024", checkIn: "09:15 AM", checkOut: null, status: "active", branch: "Downtown" },
  { id: 2, passId: "DAY-002", visitorName: "Maria Garcia", visitorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", phone: "+1 555 234 5678", email: "maria.g@email.com", passType: "Full Day", price: "$25.00", validDate: "Dec 31, 2024", checkIn: "10:00 AM", checkOut: "01:30 PM", status: "used", branch: "Downtown" },
  { id: 3, passId: "DAY-003", visitorName: "Tom Wilson", visitorImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", phone: "+1 555 345 6789", email: "tom.w@email.com", passType: "Half Day", price: "$15.00", validDate: "Dec 31, 2024", checkIn: "—", checkOut: null, status: "expired", branch: "Westside" },
  { id: 4, passId: "DAY-004", visitorName: "Sophie Lee", visitorImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", phone: "+1 555 456 7890", email: "sophie.l@email.com", passType: "Full Day + Class", price: "$35.00", validDate: "Dec 31, 2024", checkIn: "08:00 AM", checkOut: null, status: "active", branch: "Downtown" },
  { id: 5, passId: "DAY-005", visitorName: "Ryan Murphy", visitorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", phone: "+1 555 567 8901", email: "ryan.m@email.com", passType: "Trial Pass", price: "$10.00", validDate: "Dec 31, 2024", checkIn: "11:30 AM", checkOut: null, status: "active", branch: "Eastside" },
  { id: 6, passId: "DAY-006", visitorName: "Emma Brown", visitorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", phone: "+1 555 678 9012", email: "emma.b@email.com", passType: "Full Day", price: "$25.00", validDate: "Dec 31, 2024", checkIn: "07:30 AM", checkOut: "10:00 AM", status: "used", branch: "Downtown" },
  { id: 7, passId: "DAY-007", visitorName: "Jake Martin", visitorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", phone: "+1 555 789 0123", email: "jake.m@email.com", passType: "Half Day", price: "$15.00", validDate: "Dec 30, 2024", checkIn: "02:00 PM", checkOut: "05:00 PM", status: "expired", branch: "Westside" },
  { id: 8, passId: "DAY-008", visitorName: "Lisa Anderson", visitorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", phone: "+1 555 890 1234", email: "lisa.a@email.com", passType: "Trial Pass", price: "$10.00", validDate: "Dec 31, 2024", checkIn: "09:00 AM", checkOut: null, status: "active", branch: "Downtown" },
];

const columns: Column<DayPass>[] = [
  { key: "visitorImage", label: "", priority: "always", className: "w-12", render: (value: string, item: DayPass) => <ImagePreview src={value} alt={item.visitorName} size="sm" /> },
  {
    key: "visitorName",
    label: "Visitor",
    priority: "always",
    render: (value: string, item: DayPass) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground md:hidden">{item.passType}</p>
      </div>
    ),
  },
  { key: "passId", label: "Pass ID", priority: "lg" },
  { key: "passType", label: "Type", priority: "md" },
  { key: "price", label: "Price", priority: "md", render: (value: string) => <span className="font-semibold text-primary">{value}</span> },
  { key: "checkIn", label: "Check In", priority: "lg" },
  { key: "checkOut", label: "Check Out", priority: "xl", render: (value: string | null) => value || "—" },
  { key: "branch", label: "Branch", priority: "xl" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "active" | "used" | "expired") => {
      const statusMap = { active: { status: "success" as const, label: "Active" }, used: { status: "info" as const, label: "Used" }, expired: { status: "error" as const, label: "Expired" } };
      return <StatusBadge {...statusMap[value]} />;
    },
  },
];

export default function DayPasses() {
  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["visitorName", "passId", "email"],
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">12</p>
              <p className="text-xs text-muted-foreground">Today's Passes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">$285</p>
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">5</p>
              <p className="text-xs text-muted-foreground">Currently In</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">23%</p>
              <p className="text-xs text-muted-foreground">Convert to Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search visitors..."
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
              { value: "used", label: "Used" },
              { value: "expired", label: "Expired" },
            ],
          },
          {
            key: "passType",
            label: "Type",
            value: filters.passType || "all",
            onChange: (v) => handleFilter("passType", v),
            options: [
              { value: "Full Day", label: "Full Day" },
              { value: "Half Day", label: "Half Day" },
              { value: "Full Day + Class", label: "Full Day + Class" },
              { value: "Trial Pass", label: "Trial Pass" },
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

      {/* Table */}
      <ResponsiveTable data={paginatedData} columns={columns} keyExtractor={(item) => item.id} pagination={paginationProps} />
    </div>
  );
}
