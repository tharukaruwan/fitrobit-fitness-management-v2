import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { Building2, Phone, Palette, Pencil, Trash2, Plus, XCircle, CheckCircle2, Smartphone, Wifi, WifiOff, Activity, FingerprintIcon, LucideTimer } from "lucide-react";
import { toast } from "sonner";
import Request from "@/lib/api/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS_PER_PAGE = 8;

const colorOptions = [
  "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#14b8a6"
];

interface ApiDevice {
  _id: string;
  name: string;
  type: "Fingerprint" | "QR" | "Face" | "RFID";
  deviceId?: string;
  firmware?: string;
  networkAddress?: string;
  color?: string;
  status?: string;
  lastUpdated?: Date;
  branch?: string;
  branchName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiListResponse {
  analytics: {
    totalDevicees: number;
    activeDevicees: number;
    inactiveDevicees: number;
  };
  data: ApiDevice[];
  dataCount: number;
  currentPaginationIndex: number;
  dataPerPage: number;
  message: string;
}

interface Device {
  id: string;
  name: string;
  type: string; // "Fingerprint" , "QR" , "Face", "RFID"
  deviceId?: string;
  firmware?: string;
  networkAddress?: string;
  color?: string;
  status?: string;
  lastUpdated?: string;
  branch?: string;
  branchName: string;
  createdAt?: string;
  updatedAt?: string;
}

const mapApiDevice = (device: ApiDevice): Device => ({
  id: device._id,
  name: device.name,
  status: device.status || "Inactive",
  deviceId: device.deviceId,
  lastUpdated: device.lastUpdated ? new Date(device.lastUpdated).toLocaleString() : "No data found",
  createdAt: device.createdAt ? new Date(device.createdAt).toLocaleString() : "No data found",
  color: device.color,
  type: device.type,
  branchName: device.branchName
});

const fetchDevice = async (page: number, search: string, status: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;

  const res = await Request.get<ApiListResponse>("/devices/list", params);
  return res;
};

interface DeviceFormProps {
  formData: {
    [x: string]: string;
    type: string;
    deviceId: string;
    name: string;
    color: string;
    status: "Active" | "Inactive";
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    color: string;
    status: "Active" | "Inactive";
  }>>;
}

const DeviceForm = ({ formData, setFormData }: DeviceFormProps) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="deviceId">Device Id <span className="text-red-500">*</span></Label>
      <Input
        id="deviceId"
        value={formData.deviceId}
        onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
        placeholder="DeviceId of this device"
        className="mt-1.5"
      />
    </div>
    <div>
      <Label htmlFor="name">Device Name <span className="text-red-500">*</span></Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Premium Plans"
        className="mt-1.5"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="membership">Device Type <span className="text-destructive">*</span></Label>
      <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
        <SelectTrigger id="membership">
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Fingerprint">Fingerprint</SelectItem>
          <SelectItem value="QR">QR</SelectItem>
          <SelectItem value="Face">Face</SelectItem>
          <SelectItem value="RFID">RFID</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      {/* TODO Integrate async select form branchers */}
      <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
      <Select value={formData.branch} onValueChange={(v) => setFormData(prev => ({ ...prev, branch: v }))}>
        <SelectTrigger id="branch">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Downtown">Downtown</SelectItem>
          <SelectItem value="Westside">Westside</SelectItem>
          <SelectItem value="Eastside">Eastside</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Color
      </Label>
      <div className="flex gap-2 mt-2 flex-wrap">
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
            style={{ backgroundColor: color }}
            onClick={() => setFormData(prev => ({ ...prev, color }))}
          />
        ))}
      </div>
    </div>
    <div>
      <Label>Status <span className="text-red-500">*</span></Label>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant={formData.status === "Active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, status: "Active" }))}
        >
          Active
        </Button>
        <Button
          type="button"
          variant={formData.status === "Inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, status: "Inactive" }))}
        >
          Inactive
        </Button>
      </div>
    </div>
  </div>
);

export default function Devicees() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    deviceId: "",
    type: "",
    color: "#22c55e",
    status: "Active" as "Active" | "Inactive",
  });

  const columns: Column<Device>[] = [
    {
      key: "name",
      label: "Device",
      priority: "always",
      render: (_, item) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}20` }}>
              <FingerprintIcon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                Last Seen : {item.lastUpdated || "No data found "}
              </p>
            </div>
          </div>
        )
      },
    },
    { key: "deviceId", label: "Device Id", priority: "md" },
    { key: "type", label: "Type", priority: "md" },
    { key: "firmware", label: "Firmware", priority: "md" },
    { key: "networkAddress", label: "Network", priority: "md" },
    { key: "branch", label: "Branch", priority: "md" },
    {
      key: "status",
      label: "Status",
      priority: "md",
      render: (value) => (
        <Badge variant={value === "Active" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
  ];

  const rowActions: RowAction<Device>[] = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (device) => openEditForm(device),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (device) => {
        setSelectedDevice(device);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["devices-list", currentPage, searchQuery, statusFilter],
    queryFn: () => fetchDevice(currentPage, searchQuery, statusFilter),
  });

  const deviceers = apiResponse?.data?.map(mapApiDevice) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));
  const analytics = apiResponse?.analytics ? {
    totalDevicees: apiResponse?.analytics?.totalDevicees || 0,
    activeDevicees: apiResponse?.analytics?.activeDevicees || 0,
    inactiveDevicees: apiResponse?.analytics?.inactiveDevicees || 0,
  } : { totalDevices: 0, activeDevices: 0, inactiveDevices: 0 };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleAddDevice = async () => {
    if (!formData.name.trim()) {
      toast.error("Device name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await Request.post("/devices/create", formData);
      toast.success("Device added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to add device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDevice = async () => {
    if (!selectedDevice || !formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await Request.put(`/devices/${selectedDevice.id}`, formData);
      toast.success("Device updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to update device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = () => {
    if (!selectedDevice) return;
    const totalItems = 1;
    if (totalItems > 0) {
      toast.error("Delete device integration coming soon");
      setIsDeleteOpen(false);
      return;
    }
    toast.info("Delete device integration coming soon");
    setIsDeleteOpen(false);
    setSelectedDevice(null);
  };

  const resetForm = () => {
    setFormData({ name: "", deviceId: "", color: "#22c55e", status: "Active", type: "" });
    setSelectedDevice(null);
  };

  const openEditForm = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      color: device.color,
      deviceId: device.deviceId,
      status: device.status === "Active" ? "Active" : "Inactive",
      type: device.type
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devicees</h1>
          <p className="text-muted-foreground">Manage and organize deviceers efficiently</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Devicees */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.totalDevicees}
              </p>
              <p className="text-xs text-muted-foreground">Total Devicees</p>
            </div>
          </div>
        </div>

        {/* Online Devicees */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.activeDevicees}
              </p>
              <p className="text-xs text-muted-foreground">Online Devicees</p>
            </div>
          </div>
        </div>

        {/* Offline Devicees */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.inactiveDevicees}
              </p>
              <p className="text-xs text-muted-foreground">Offline Devicees</p>
            </div>
          </div>
        </div>

        {/* Active Devicees */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.activeDevicees}
              </p>
              <p className="text-xs text-muted-foreground">Active Devicees</p>
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
            type: "sync",
            options: [
              { label: "All Status", value: "all" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ],
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable<Device>
        columns={columns}
        data={deviceers}
        keyExtractor={(device) => device.id}
        rowActions={rowActions}
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          onPageChange: setCurrentPage,
        }}
      />

      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Device"
        onSubmit={handleAddDevice}
        submitLabel={isSubmitting ? "Adding..." : "Add Device"}
      >
        <DeviceForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Device"
        onSubmit={handleEditDevice}
        submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
      >
        <DeviceForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      {/* Delete Device */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDevice?.name}"?
              {(" This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDevice}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
