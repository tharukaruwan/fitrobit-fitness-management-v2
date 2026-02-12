import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Eye,
  Layers,
  MapPin,
  Users,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";

// ── Section (Registry) ──────────────────────────────────────────────

interface Section {
  id: string;
  name: string;
  description: string;
  location: string;
  maxCapacity: number;
  status: "active" | "inactive";
  color: string;
  totalBookings: number;
  upcomingBookings: number;
}

const sectionColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

const initialSections: Section[] = [
  { id: "sec-1", name: "Shooting Range", description: "Indoor shooting range with 10 lanes", location: "Building A, Ground Floor", maxCapacity: 10, status: "active", color: "#3b82f6", totalBookings: 48, upcomingBookings: 5 },
  { id: "sec-2", name: "Swimming Pool", description: "Olympic-size swimming pool", location: "Building B", maxCapacity: 30, status: "active", color: "#06b6d4", totalBookings: 124, upcomingBookings: 12 },
  { id: "sec-3", name: "Tennis Court", description: "2 outdoor tennis courts", location: "Outdoor Area", maxCapacity: 4, status: "active", color: "#10b981", totalBookings: 67, upcomingBookings: 3 },
  { id: "sec-4", name: "Sauna", description: "Finnish sauna and steam room", location: "Building A, 2nd Floor", maxCapacity: 8, status: "inactive", color: "#f59e0b", totalBookings: 31, upcomingBookings: 0 },
  { id: "sec-5", name: "Boxing Ring", description: "Professional boxing ring with equipment", location: "Building C", maxCapacity: 6, status: "active", color: "#ef4444", totalBookings: 89, upcomingBookings: 7 },
];

export default function Bookings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [showAddSection, setShowAddSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sectionForm, setSectionForm] = useState({
    name: "", description: "", location: "", maxCapacity: "", color: sectionColors[0], status: "active",
  });

  const filtered = sections.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSaveSection = () => {
    if (!sectionForm.name) {
      toast({ title: "Missing fields", description: "Section name is required.", variant: "destructive" });
      return;
    }
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      name: sectionForm.name,
      description: sectionForm.description,
      location: sectionForm.location,
      maxCapacity: Number(sectionForm.maxCapacity) || 0,
      status: sectionForm.status as "active" | "inactive",
      color: sectionForm.color,
      totalBookings: 0,
      upcomingBookings: 0,
    };
    setSections((prev) => [newSection, ...prev]);
    setShowAddSection(false);
    setSectionForm({ name: "", description: "", location: "", maxCapacity: "", color: sectionColors[0], status: "active" });
    toast({ title: "Section created" });
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Section deleted" });
  };

  const columns: Column<Section>[] = [
    {
      key: "name", label: "Section", priority: "always",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
            <Layers className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" /> {item.location || "No location"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "maxCapacity", label: "Capacity", priority: "md",
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "upcomingBookings", label: "Upcoming", priority: "md",
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "totalBookings", label: "Total", priority: "lg",
      render: (value: number) => <span className="text-sm text-muted-foreground">{value} bookings</span>,
    },
    {
      key: "status", label: "Status", priority: "always",
      render: (value: string) => (
        <StatusBadge status={value === "active" ? "success" : "warning"} label={value} />
      ),
    },
  ];

  const rowActions: RowAction<Section>[] = [
    { icon: Eye, label: "View", onClick: (item) => navigate(`/bookings/${item.id}`) },
    { icon: Trash2, label: "Delete", onClick: (item) => handleDeleteSection(item.id), variant: "danger" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Bookings</h2>
          <p className="text-sm text-muted-foreground">Manage facility sections and reservations</p>
        </div>
        <Button onClick={() => setShowAddSection(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Section</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search sections..."
        filters={[
          {
            key: "status", label: "Status", value: filterStatus, onChange: setFilterStatus,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />

      <ResponsiveTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
        onRowClick={(item) => navigate(`/bookings/${item.id}`)}
      />

      {/* Add Section Sheet */}
      <QuickAddSheet open={showAddSection} onOpenChange={setShowAddSection} title="Add Section" onSubmit={handleSaveSection} submitLabel="Create Section">
        <div className="space-y-4">
          <div>
            <Label>Section Name *</Label>
            <Input value={sectionForm.name} onChange={(e) => setSectionForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Shooting Range" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={sectionForm.description} onChange={(e) => setSectionForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description..." />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={sectionForm.location} onChange={(e) => setSectionForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Building A, Ground Floor" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max Capacity</Label>
              <Input type="number" value={sectionForm.maxCapacity} onChange={(e) => setSectionForm((f) => ({ ...f, maxCapacity: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={sectionForm.status} onValueChange={(v) => setSectionForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1.5">
              {sectionColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${sectionForm.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setSectionForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
