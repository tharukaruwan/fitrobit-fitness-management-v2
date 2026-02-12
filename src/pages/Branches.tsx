import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";

interface Branch {
  id: number;
  branchId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  members: number;
  employees: number;
  openHours: string;
  status: "open" | "closed" | "renovation";
}

const sampleData: Branch[] = [
  { id: 1, branchId: "BR-001", name: "Downtown Fitness", address: "123 Main Street", city: "New York, NY", phone: "+1 555 100 1000", manager: "Amanda Roberts", members: 856, employees: 18, openHours: "5 AM - 11 PM", status: "open" },
  { id: 2, branchId: "BR-002", name: "Westside Gym", address: "456 West Avenue", city: "New York, NY", phone: "+1 555 200 2000", manager: "Michael Chen", members: 542, employees: 12, openHours: "6 AM - 10 PM", status: "open" },
  { id: 3, branchId: "BR-003", name: "Eastside Fitness Center", address: "789 East Boulevard", city: "New York, NY", phone: "+1 555 300 3000", manager: "Sarah Williams", members: 423, employees: 10, openHours: "5 AM - 10 PM", status: "renovation" },
  { id: 4, branchId: "BR-004", name: "Uptown Athletic Club", address: "321 North Road", city: "New York, NY", phone: "+1 555 400 4000", manager: "James Taylor", members: 678, employees: 15, openHours: "24/7", status: "open" },
  { id: 5, branchId: "BR-005", name: "Harbor View Gym", address: "555 Harbor Drive", city: "Brooklyn, NY", phone: "+1 555 500 5000", manager: "Lisa Brown", members: 312, employees: 8, openHours: "6 AM - 9 PM", status: "closed" },
  { id: 6, branchId: "BR-006", name: "Midtown Express", address: "888 Central Ave", city: "New York, NY", phone: "+1 555 600 6000", manager: "David Lee", members: 465, employees: 11, openHours: "5 AM - 11 PM", status: "open" },
  { id: 7, branchId: "BR-007", name: "Queens Fitness Hub", address: "777 Queens Blvd", city: "Queens, NY", phone: "+1 555 700 7000", manager: "Emily Chen", members: 389, employees: 9, openHours: "6 AM - 10 PM", status: "open" },
];

const columns: Column<Branch>[] = [
  {
    key: "name",
    label: "Branch",
    priority: "always",
    render: (value: string, item: Branch) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground md:hidden">{item.city}</p>
      </div>
    ),
  },
  { key: "branchId", label: "ID", priority: "xl" },
  { key: "address", label: "Address", priority: "lg" },
  { key: "city", label: "City", priority: "md" },
  { key: "manager", label: "Manager", priority: "lg" },
  { key: "members", label: "Members", priority: "always", render: (value: number) => <span className="font-semibold text-primary">{value}</span> },
  { key: "employees", label: "Staff", priority: "md" },
  { key: "openHours", label: "Hours", priority: "lg" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "open" | "closed" | "renovation") => {
      const statusMap = { open: { status: "success" as const, label: "Open" }, closed: { status: "error" as const, label: "Closed" }, renovation: { status: "warning" as const, label: "Renovation" } };
      return <StatusBadge {...statusMap[value]} />;
    },
  },
];

export default function Branches() {
  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["name", "branchId", "city", "manager"],
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">7</p>
              <p className="text-xs text-muted-foreground">Total Branches</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">3,665</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">856</p>
              <p className="text-xs text-muted-foreground">Largest Branch</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">83</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search branches..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
              { value: "renovation", label: "Renovation" },
            ],
          },
          {
            key: "city",
            label: "City",
            value: filters.city || "all",
            onChange: (v) => handleFilter("city", v),
            options: [
              { value: "New York, NY", label: "New York" },
              { value: "Brooklyn, NY", label: "Brooklyn" },
              { value: "Queens, NY", label: "Queens" },
            ],
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable data={paginatedData} columns={columns} keyExtractor={(item) => item.id} pagination={paginationProps} />
    </div>
  );
}
