import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Smartphone, Wifi, WifiOff, Activity } from "lucide-react";

interface Device {
  id: number;
  deviceId: string;
  name: string;
  type: string;
  location: string;
  ipAddress: string;
  lastSync: string;
  firmware: string;
  status: "online" | "offline" | "maintenance";
  branch: string;
}

const sampleData: Device[] = [
  { id: 1, deviceId: "DEV-001", name: "Main Entrance Gate", type: "Access Control", location: "Front Door", ipAddress: "192.168.1.10", lastSync: "2 min ago", firmware: "v2.4.1", status: "online", branch: "Downtown" },
  { id: 2, deviceId: "DEV-002", name: "Gym Floor Scanner", type: "Biometric", location: "Main Floor", ipAddress: "192.168.1.11", lastSync: "1 min ago", firmware: "v2.4.1", status: "online", branch: "Downtown" },
  { id: 3, deviceId: "DEV-003", name: "Pool Area Gate", type: "Access Control", location: "Pool Entrance", ipAddress: "192.168.1.12", lastSync: "5 min ago", firmware: "v2.3.8", status: "online", branch: "Downtown" },
  { id: 4, deviceId: "DEV-004", name: "Locker Room A", type: "RFID Reader", location: "Men's Locker", ipAddress: "192.168.1.13", lastSync: "30 min ago", firmware: "v2.4.0", status: "offline", branch: "Westside" },
  { id: 5, deviceId: "DEV-005", name: "Emergency Exit", type: "Access Control", location: "Back Door", ipAddress: "192.168.1.14", lastSync: "3 min ago", firmware: "v2.4.1", status: "online", branch: "Downtown" },
  { id: 6, deviceId: "DEV-006", name: "Parking Barrier", type: "Gate Control", location: "Parking Lot", ipAddress: "192.168.1.15", lastSync: "2 hours ago", firmware: "v2.2.0", status: "maintenance", branch: "Eastside" },
  { id: 7, deviceId: "DEV-007", name: "Reception Kiosk", type: "Check-in Terminal", location: "Lobby", ipAddress: "192.168.1.16", lastSync: "1 min ago", firmware: "v3.0.0", status: "online", branch: "Downtown" },
  { id: 8, deviceId: "DEV-008", name: "Staff Entrance", type: "Access Control", location: "Staff Door", ipAddress: "192.168.1.17", lastSync: "4 min ago", firmware: "v2.4.1", status: "online", branch: "Westside" },
  { id: 9, deviceId: "DEV-009", name: "VIP Lounge Gate", type: "Access Control", location: "VIP Area", ipAddress: "192.168.1.18", lastSync: "6 min ago", firmware: "v2.4.1", status: "online", branch: "Downtown" },
  { id: 10, deviceId: "DEV-010", name: "Locker Room B", type: "RFID Reader", location: "Women's Locker", ipAddress: "192.168.1.19", lastSync: "45 min ago", firmware: "v2.3.5", status: "offline", branch: "Eastside" },
];

const columns: Column<Device>[] = [
  {
    key: "name",
    label: "Device",
    priority: "always",
    render: (value: string, item: Device) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{item.type}</p>
      </div>
    ),
  },
  { key: "deviceId", label: "ID", priority: "lg", render: (value: string) => <span className="font-mono text-xs">{value}</span> },
  { key: "location", label: "Location", priority: "md" },
  { key: "ipAddress", label: "IP Address", priority: "lg", render: (value: string) => <span className="font-mono text-xs text-muted-foreground">{value}</span> },
  { key: "lastSync", label: "Last Sync", priority: "md" },
  { key: "firmware", label: "Firmware", priority: "xl" },
  { key: "branch", label: "Branch", priority: "xl" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "online" | "offline" | "maintenance") => {
      const statusMap = { online: { status: "success" as const, label: "Online" }, offline: { status: "error" as const, label: "Offline" }, maintenance: { status: "warning" as const, label: "Maint." } };
      return <StatusBadge {...statusMap[value]} />;
    },
  },
];

export default function Devices() {
  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["name", "deviceId", "location", "type"],
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">24</p>
              <p className="text-xs text-muted-foreground">Total Devices</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">21</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">2</p>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search devices..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "online", label: "Online" },
              { value: "offline", label: "Offline" },
              { value: "maintenance", label: "Maintenance" },
            ],
          },
          {
            key: "type",
            label: "Type",
            value: filters.type || "all",
            onChange: (v) => handleFilter("type", v),
            options: [
              { value: "Access Control", label: "Access Control" },
              { value: "Biometric", label: "Biometric" },
              { value: "RFID Reader", label: "RFID Reader" },
              { value: "Gate Control", label: "Gate Control" },
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
