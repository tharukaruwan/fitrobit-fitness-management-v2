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
  branch?: Branch;
  branchName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiListResponse {
  analytics: {
    totalDevices: number;
    activeDevices: number;
    inactiveDevices: number;
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
  type: string;
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

interface Branch {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
}

interface BranchListResponse {
  data: Branch[];
  message: string;
}

const mapApiDevice = (device: ApiDevice): Device => ({
  id: device._id,
  name: device.name,
  status: device.status || "offline",
  deviceId: device.deviceId,
  lastUpdated: device.lastUpdated ? new Date(device.lastUpdated).toLocaleString() : "No data found",
  createdAt: device.createdAt ? new Date(device.createdAt).toLocaleString() : "No data found",
  color: device.color,
  type: device.type,
  branch: device.branch ? device.branch._id : "",
  branchName: device.branch ? device.branch.name : "",
});

const fetchDevice = async (page: number, search: string, status: string, branch: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;
  if (branch && branch !== "all") params["filters[branch]"] = branch;

  const res = await Request.get<ApiListResponse>("/devices/list", params);
  return res;
};

// Fetch all active branches for the dropdown
const fetchBranches = async () => {
  const params = {
    "filters[status]": "Active",
    dataPerPage: 100, // Get all active branches
  };
  const res = await Request.get<BranchListResponse>("/branchers/list", params);
  return res.data || [];
};

interface DeviceFormProps {
  formData: {
    deviceId: string;
    name: string;
    type: string;
    branch: string;
    color: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    deviceId: string;
    name: string;
    type: string;
    branch: string;
    color: string;
  }>>;
}

const DeviceForm = ({ formData, setFormData }: DeviceFormProps) => {
  // Fetch branches for dropdown
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches-dropdown"],
    queryFn: fetchBranches,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="deviceId">Device Id <span className="text-red-500">*</span></Label>
        <Input
          id="deviceId"
          value={formData.deviceId}
          onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
          placeholder="Device ID of this device"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="name">Device Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Main Entrance Scanner"
          className="mt-1.5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Device Type <span className="text-destructive">*</span></Label>
        <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select device type" />
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
        <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
        <Select
          value={formData.branch}
          onValueChange={(v) => setFormData(prev => ({ ...prev, branch: v }))}
          disabled={branchesLoading}
        >
          <SelectTrigger id="branch">
            <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
          </SelectTrigger>
          <SelectContent>
            {branches.length === 0 && !branchesLoading ? (
              <SelectItem value="no-branches" disabled>
                No active branches available
              </SelectItem>
            ) : (
              branches.map((branch) => (
                <SelectItem key={branch._id} value={branch._id}>
                  {branch.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {branches.length === 0 && !branchesLoading && (
          <p className="text-xs text-muted-foreground">
            Please create an active branch first
          </p>
        )}
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
    </div>
  );
};

export default function Devices() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    deviceId: "",
    type: "",
    branch: "",
    color: "#22c55e",
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
                Last Seen: {item.lastUpdated || "No data found"}
              </p>
            </div>
          </div>
        )
      },
    },
    { key: "deviceId", label: "Device Id", priority: "md" },
    { key: "type", label: "Type", priority: "md" },
    { key: "branchName", label: "Branch", priority: "md" },
    { key: "firmware", label: "Firmware", priority: "md" },
    { key: "networkAddress", label: "Network", priority: "md" },
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
    queryKey: ["devices-list", currentPage, searchQuery, statusFilter, branchFilter],
    queryFn: () => fetchDevice(currentPage, searchQuery, statusFilter, branchFilter),
  });

  const devices = apiResponse?.data?.map(mapApiDevice) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));
  const analytics = apiResponse?.analytics ? {
    totalDevices: apiResponse?.analytics?.totalDevices || 0,
    activeDevices: apiResponse?.analytics?.activeDevices || 0,
    inactiveDevices: apiResponse?.analytics?.inactiveDevices || 0,
  } : { totalDevices: 0, activeDevices: 0, inactiveDevices: 0 };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleAddDevice = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Device name is required");
      return;
    }
    if (!formData.deviceId.trim()) {
      toast.error("Device ID is required");
      return;
    }
    if (!formData.type) {
      toast.error("Device type is required");
      return;
    }
    if (!formData.branch) {
      toast.error("Branch is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.post("/devices/create", formData);
      toast.success("Device added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDevice = async () => {
    if (!selectedDevice) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Device name is required");
      return;
    }
    if (!formData.deviceId.trim()) {
      toast.error("Device ID is required");
      return;
    }
    if (!formData.type) {
      toast.error("Device type is required");
      return;
    }
    if (!formData.branch) {
      toast.error("Branch is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.put(`/devices/${selectedDevice.id}`, formData);
      toast.success("Device updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;

    setIsSubmitting(true);
    try {
      await Request.delete(`/devices/${selectedDevice.id}`);
      toast.success("Device deleted successfully");
      setIsDeleteOpen(false);
      setSelectedDevice(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      deviceId: "",
      type: "",
      branch: "",
      color: "#22c55e",
    });
    setSelectedDevice(null);
  };

  const openEditForm = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      deviceId: device.deviceId || "",
      type: device.type,
      branch: device.branch || "",
      color: device.color || "#22c55e",
    });
    setIsEditOpen(true);
  };

  const allClasses = [
    "Yoga", "HIIT", "Spin", "Pilates", "CrossFit", "Boxing", "Zumba", "Strength Training", "Swimming", "Kickboxing",
  ];

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground">Manage and organize devices efficiently</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Total Devices */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.totalDevices}
              </p>
              <p className="text-xs text-muted-foreground">Total Devices</p>
            </div>
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.activeDevices}
              </p>
              <p className="text-xs text-muted-foreground">Active Devices</p>
            </div>
          </div>
        </div>

        {/* Inactive Devices */}
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {analytics.inactiveDevices}
              </p>
              <p className="text-xs text-muted-foreground">Inactive Devices</p>
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
              { label: "Offline", value: "offline" },
              { label: "Online", value: "online" },
            ],
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
          },
          {
            key: "branch",
            label: "Branch",
            value: branchFilter || "all",
            onChange: (v) => {
              setBranchFilter(v);
              setCurrentPage(1);
            },
            type: "async" as const,
            onSearch: async (query: string) => {
              await new Promise((r) => setTimeout(r, 300));
              return [
                { value: "all", label: "All Branches" },
                ...allClasses
                  .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
                  .map((c) => ({ value: c, label: c })),
              ];
            },
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable<Device>
        columns={columns}
        data={devices}
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
        submitLabel="Add Device"
        isSubmitting={isSubmitting}
      >
        <DeviceForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Device"
        onSubmit={handleEditDevice}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
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
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDevice}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}