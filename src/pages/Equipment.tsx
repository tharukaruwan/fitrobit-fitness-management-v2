import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Pencil, Trash2, Wrench, AlertTriangle, 
  Dumbbell, XCircle, Clock, Eye, X, ImagePlus
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isBefore, isAfter } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePreview } from "@/components/ui/image-preview";

type EquipmentStatus = "operational" | "maintenance" | "repair" | "out-of-service";

interface MaintenanceRecord {
  id: string;
  date: string;
  type: "routine" | "repair" | "inspection";
  description: string;
  cost: number;
  performedBy: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  status: EquipmentStatus;
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceHistory: MaintenanceRecord[];
  notes: string;
  image?: string;
}

// Mock data
const mockEquipment: EquipmentItem[] = [
  { 
    id: "1", 
    name: "Treadmill Pro 5000", 
    category: "Cardio", 
    serialNumber: "TM-5000-001", 
    purchaseDate: "2023-01-15",
    status: "operational",
    location: "Cardio Zone A",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    maintenanceHistory: [
      { id: "m1", date: "2024-01-10", type: "routine", description: "Belt lubrication and calibration", cost: 75, performedBy: "Tech Services Inc." }
    ],
    notes: "Heavy usage equipment",
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200&h=200&fit=crop"
  },
  { 
    id: "2", 
    name: "Olympic Barbell Set", 
    category: "Weights", 
    serialNumber: "OB-2020-015", 
    purchaseDate: "2022-06-20",
    status: "operational",
    location: "Free Weights Area",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    maintenanceHistory: [],
    notes: "",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop"
  },
  { 
    id: "3", 
    name: "Cable Machine", 
    category: "Machines", 
    serialNumber: "CM-3000-008", 
    purchaseDate: "2023-03-10",
    status: "repair",
    location: "Strength Zone B",
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-01-20",
    maintenanceHistory: [
      { id: "m2", date: "2024-01-08", type: "repair", description: "Cable replacement needed - ordered parts", cost: 250, performedBy: "In-house" }
    ],
    notes: "Waiting for replacement cables",
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=200&h=200&fit=crop"
  },
  { 
    id: "4", 
    name: "Spin Bike Elite", 
    category: "Cardio", 
    serialNumber: "SB-ELITE-022", 
    purchaseDate: "2023-08-01",
    status: "maintenance",
    location: "Spin Studio",
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-01-15",
    maintenanceHistory: [],
    notes: "Scheduled maintenance in progress"
  },
  { 
    id: "5", 
    name: "Rowing Machine", 
    category: "Cardio", 
    serialNumber: "RM-2000-003", 
    purchaseDate: "2022-11-15",
    status: "out-of-service",
    location: "Storage",
    lastMaintenance: "2023-12-01",
    nextMaintenance: "2024-01-01",
    maintenanceHistory: [
      { id: "m3", date: "2023-12-01", type: "inspection", description: "Monitor malfunction - needs replacement", cost: 0, performedBy: "In-house" }
    ],
    notes: "Awaiting budget approval for monitor replacement"
  },
];

const categories = ["Cardio", "Weights", "Machines", "Accessories", "Studio Equipment"];
const locations = ["Cardio Zone A", "Cardio Zone B", "Free Weights Area", "Strength Zone A", "Strength Zone B", "Spin Studio", "Yoga Studio", "Storage"];

const statusConfig: Record<EquipmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "operational": { label: "Operational", variant: "default" },
  "maintenance": { label: "Maintenance", variant: "secondary" },
  "repair": { label: "Needs Repair", variant: "outline" },
  "out-of-service": { label: "Out of Service", variant: "destructive" },
};

type SortOption = "name" | "nextMaintenance-asc" | "nextMaintenance-desc" | "lastMaintenance-desc" | "purchaseDate-desc";

const Equipment = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<EquipmentItem[]>(mockEquipment);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("nextMaintenance-asc");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    purchaseDate: "",
    status: "operational" as EquipmentStatus,
    location: "",
    nextMaintenance: "",
    notes: "",
    image: "",
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    type: "routine" as "routine" | "repair" | "inspection",
    description: "",
    cost: "",
    performedBy: "",
    nextMaintenance: "",
  });

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: equipment,
    itemsPerPage: 8,
    searchFields: ["name", "category", "serialNumber", "location"],
  });

  // Apply filters and sorting to data
  const filteredAndSortedData = useMemo(() => {
    return paginatedData
      .filter(eq => {
        // Status filter
        const statusFilter = filters.status || "all";
        if (statusFilter === "overdue") {
          if (!isBefore(new Date(eq.nextMaintenance), new Date())) return false;
        } else if (statusFilter === "needs-attention") {
          if (eq.status !== "repair" && eq.status !== "out-of-service") return false;
        } else if (statusFilter !== "all" && eq.status !== statusFilter) {
          return false;
        }
        
        // Category filter
        const categoryFilter = filters.category || "all";
        if (categoryFilter !== "all" && eq.category !== categoryFilter) return false;
        
        // Location filter
        const locationFilter = filters.location || "all";
        if (locationFilter !== "all" && eq.location !== locationFilter) return false;
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "nextMaintenance-asc":
            return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
          case "nextMaintenance-desc":
            return new Date(b.nextMaintenance).getTime() - new Date(a.nextMaintenance).getTime();
          case "lastMaintenance-desc":
            return new Date(b.lastMaintenance).getTime() - new Date(a.lastMaintenance).getTime();
          case "purchaseDate-desc":
            return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
          default:
            return 0;
        }
      });
  }, [paginatedData, filters, sortBy]);

  // Get upcoming maintenance (within 7 days)
  const upcomingMaintenance = equipment.filter(eq => {
    const nextDate = new Date(eq.nextMaintenance);
    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return isAfter(nextDate, today) && isBefore(nextDate, weekFromNow);
  });

  // Get overdue maintenance
  const overdueMaintenance = equipment.filter(eq => {
    return isBefore(new Date(eq.nextMaintenance), new Date());
  });

  // Get equipment needing attention
  const needsAttention = equipment.filter(eq => 
    eq.status === "repair" || eq.status === "out-of-service"
  );

  const columns: Column<EquipmentItem>[] = [
    { 
      key: "image", 
      label: "", 
      priority: "always",
      className: "w-12",
      render: (_, item) => (
        item.image ? (
          <ImagePreview src={item.image} alt={item.name} size="md" />
        ) : (
          <div className="w-10 h-10 rounded-full ring-2 ring-border/50 bg-muted flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
          </div>
        )
      )
    },
    { 
      key: "name",
      label: "Equipment", 
      priority: "always",
      render: (value: string, item: EquipmentItem) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{item.serialNumber}</p>
        </div>
      )
    },
    { key: "category", label: "Category", priority: "lg" },
    { key: "location", label: "Location", priority: "md" },
    { 
      key: "status", 
      label: "Status", 
      priority: "always",
      render: (_, item) => {
        const config = statusConfig[item.status];
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      }
    },
    { 
      key: "nextMaintenance", 
      label: "Next Maintenance", 
      priority: "lg",
      render: (_, item) => {
        const isOverdue = isBefore(new Date(item.nextMaintenance), new Date());
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {format(new Date(item.nextMaintenance), "MMM d, yyyy")}
            {isOverdue && " (Overdue)"}
          </span>
        );
      }
    },
  ];

  const rowActions: RowAction<EquipmentItem>[] = [
    {
      icon: Eye,
      label: "View Details",
      onClick: (eq) => {
        setSelectedEquipment(eq);
        setIsDetailOpen(true);
      },
    },
    {
      icon: Wrench,
      label: "Log Maintenance",
      onClick: (eq) => {
        setSelectedEquipment(eq);
        setMaintenanceForm({
          type: "routine",
          description: "",
          cost: "",
          performedBy: "",
          nextMaintenance: format(addDays(new Date(), 90), "yyyy-MM-dd"),
        });
        setIsMaintenanceOpen(true);
      },
    },
    {
      icon: Pencil,
      label: "Edit",
      onClick: (eq) => {
        setSelectedEquipment(eq);
        setFormData({
          name: eq.name,
          category: eq.category,
          serialNumber: eq.serialNumber,
          purchaseDate: eq.purchaseDate,
          status: eq.status,
          location: eq.location,
          nextMaintenance: eq.nextMaintenance,
          notes: eq.notes,
          image: eq.image || "",
        });
        setIsEditOpen(true);
      },
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: (eq) => {
        setSelectedEquipment(eq);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const handleAddEquipment = () => {
    const newEquipment: EquipmentItem = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber,
      purchaseDate: formData.purchaseDate,
      status: formData.status,
      location: formData.location,
      lastMaintenance: format(new Date(), "yyyy-MM-dd"),
      nextMaintenance: formData.nextMaintenance,
      maintenanceHistory: [],
      notes: formData.notes,
      image: formData.image || undefined,
    };
    setEquipment([...equipment, newEquipment]);
    toast.success("Equipment added successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditEquipment = () => {
    if (!selectedEquipment) return;
    setEquipment(equipment.map(eq => 
      eq.id === selectedEquipment.id 
        ? {
            ...eq,
            name: formData.name,
            category: formData.category,
            serialNumber: formData.serialNumber,
            purchaseDate: formData.purchaseDate,
            status: formData.status,
            location: formData.location,
            nextMaintenance: formData.nextMaintenance,
            notes: formData.notes,
            image: formData.image || undefined,
          }
        : eq
    ));
    toast.success("Equipment updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteEquipment = () => {
    if (!selectedEquipment) return;
    setEquipment(equipment.filter(eq => eq.id !== selectedEquipment.id));
    toast.success("Equipment deleted successfully");
    setIsDeleteOpen(false);
    setSelectedEquipment(null);
  };

  const handleLogMaintenance = () => {
    if (!selectedEquipment) return;
    
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      type: maintenanceForm.type,
      description: maintenanceForm.description,
      cost: parseFloat(maintenanceForm.cost) || 0,
      performedBy: maintenanceForm.performedBy,
    };

    setEquipment(equipment.map(eq => 
      eq.id === selectedEquipment.id 
        ? {
            ...eq,
            lastMaintenance: format(new Date(), "yyyy-MM-dd"),
            nextMaintenance: maintenanceForm.nextMaintenance,
            status: maintenanceForm.type === "repair" ? "repair" : "operational",
            maintenanceHistory: [...eq.maintenanceHistory, newRecord],
          }
        : eq
    ));

    toast.success("Maintenance logged successfully");
    setIsMaintenanceOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      serialNumber: "",
      purchaseDate: "",
      status: "operational",
      location: "",
      nextMaintenance: "",
      notes: "",
      image: "",
    });
    setSelectedEquipment(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const EquipmentForm = () => (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <Label>Equipment Image</Label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
            {formData.image ? (
              <img src={formData.image} alt="Equipment" className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {formData.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, image: "" })}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Equipment Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter equipment name"
        />
      </div>
      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input
          id="serialNumber"
          value={formData.serialNumber}
          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          placeholder="Enter serial number"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData({ ...formData, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="nextMaintenance">Next Maintenance</Label>
          <Input
            id="nextMaintenance"
            type="date"
            value={formData.nextMaintenance}
            onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: EquipmentStatus) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment Inventory</h1>
          <p className="text-muted-foreground">Track gym equipment, maintenance, and repairs</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{needsAttention.length}</div>
            <p className="text-xs text-muted-foreground">Equipment requiring repair</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">Past maintenance date</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(overdueMaintenance.length > 0 || needsAttention.length > 0) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Equipment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueMaintenance.map(eq => (
              <div key={eq.id} className="flex justify-between items-center text-sm">
                <span>{eq.name}</span>
                <Badge variant="destructive">Overdue: {format(new Date(eq.nextMaintenance), "MMM d")}</Badge>
              </div>
            ))}
            {needsAttention.map(eq => (
              <div key={eq.id} className="flex justify-between items-center text-sm">
                <span>{eq.name}</span>
                <Badge variant="outline">{statusConfig[eq.status].label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters with Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1">
          <FilterBar
            searchPlaceholder="Search equipment..."
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            filters={[
              {
                key: "status",
                label: "Status",
                value: filters.status || "all",
                onChange: (v) => handleFilter("status", v),
                options: [
                  { value: "operational", label: "Operational" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "repair", label: "Needs Repair" },
                  { value: "out-of-service", label: "Out of Service" },
                  { value: "overdue", label: "Overdue Maintenance" },
                  { value: "needs-attention", label: "Needs Attention" },
                ],
              },
              {
                key: "category",
                label: "Category",
                value: filters.category || "all",
                onChange: (v) => handleFilter("category", v),
                options: categories.map(cat => ({ value: cat, label: cat })),
              },
              {
                key: "location",
                label: "Location",
                value: filters.location || "all",
                onChange: (v) => handleFilter("location", v),
                options: locations.map(loc => ({ value: loc, label: loc })),
              },
              {
                key: "sortBy",
                label: "Sort",
                value: sortBy,
                onChange: (v) => setSortBy(v as SortOption),
                options: [
                  { value: "nextMaintenance-asc", label: "Next Maintenance (Soonest)" },
                  { value: "nextMaintenance-desc", label: "Next Maintenance (Latest)" },
                  { value: "lastMaintenance-desc", label: "Last Maintained (Recent)" },
                  { value: "purchaseDate-desc", label: "Purchase Date (Newest)" },
                  { value: "name", label: "Name (A-Z)" },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <ResponsiveTable
        data={filteredAndSortedData}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
        pagination={paginationProps}
      />

      {/* Add Equipment Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Equipment"
        description="Add equipment to your inventory"
        onSubmit={handleAddEquipment}
        submitLabel="Add Equipment"
      >
        <EquipmentForm />
      </QuickAddSheet>

      {/* Edit Equipment Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Equipment"
        description="Update equipment details"
        onSubmit={handleEditEquipment}
        submitLabel="Save Changes"
      >
        <EquipmentForm />
      </QuickAddSheet>

      {/* Log Maintenance Sheet */}
      <QuickAddSheet
        open={isMaintenanceOpen}
        onOpenChange={setIsMaintenanceOpen}
        title="Log Maintenance"
        description={`Log maintenance for ${selectedEquipment?.name}`}
        onSubmit={handleLogMaintenance}
        submitLabel="Log Maintenance"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="maintenanceType">Type</Label>
            <Select
              value={maintenanceForm.type}
              onValueChange={(value: "routine" | "repair" | "inspection") => 
                setMaintenanceForm({ ...maintenanceForm, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={maintenanceForm.description}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
              placeholder="Describe the maintenance performed..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={maintenanceForm.cost}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                value={maintenanceForm.performedBy}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })}
                placeholder="Technician name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
            <Input
              id="nextMaintenanceDate"
              type="date"
              value={maintenanceForm.nextMaintenance}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, nextMaintenance: e.target.value })}
            />
          </div>
        </div>
      </QuickAddSheet>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEquipment?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEquipment}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEquipment?.name}</DialogTitle>
            <DialogDescription>Equipment details and maintenance history</DialogDescription>
          </DialogHeader>
          
          {selectedEquipment && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">Maintenance History</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Serial Number</span>
                    <p className="font-medium">{selectedEquipment.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{selectedEquipment.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-medium">{selectedEquipment.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <Badge variant={statusConfig[selectedEquipment.status].variant}>
                        {statusConfig[selectedEquipment.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Purchase Date</span>
                    <p className="font-medium">{format(new Date(selectedEquipment.purchaseDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Maintenance</span>
                    <p className="font-medium">{format(new Date(selectedEquipment.lastMaintenance), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Maintenance</span>
                    <p className="font-medium">{format(new Date(selectedEquipment.nextMaintenance), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {selectedEquipment.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notes</span>
                    <p className="text-sm mt-1">{selectedEquipment.notes}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                {selectedEquipment.maintenanceHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No maintenance history</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEquipment.maintenanceHistory.map(record => (
                      <div key={record.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{record.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(record.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm">{record.description}</p>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>By: {record.performedBy}</span>
                          <span>Cost: ${record.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipment;
