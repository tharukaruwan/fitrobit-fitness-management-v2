import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { Building2, Users, MapPin, TrendingUp, FolderOpen, Layers, Phone, Palette, Pencil, Trash2, Plus } from "lucide-react";
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

const ITEMS_PER_PAGE = 8;

const colorOptions = [
  "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#14b8a6"
];

interface ApiBranch {
  _id: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  color: string;
  status: "Active" | "Inactive";
}

interface ApiListResponse {
  data: ApiBranch[];
  dataCount: number;
  currentPaginationIndex: number;
  dataPerPage: number;
  message: string;
}

interface Branch {
  id: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  color: string;
  createdAt: string;
  status: "Active" | "Inactive";
}

const mapApiBranch = (branch: ApiBranch): Branch => ({
  id: branch._id,
  name: branch.name,
  status: branch.status || "Inactive",
  address: branch.address,
  phoneNumber: branch.phoneNumber,
  email: branch.email,
  createdAt: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
  color: branch.color
});

const fetchBranch = async (page: number, search: string, status: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;

  const res = await Request.get<ApiListResponse>("/branchers/list", params);
  return res;
};

interface BranchFormProps {
  formData: {
    phoneNumber: string;
    email: string;
    name: string;
    address: string;
    color: string;
    status: "Active" | "Inactive";
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    address: string;
    color: string;
    status: "Active" | "Inactive";
  }>>;
}

const BranchForm = ({ formData, setFormData }: BranchFormProps) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Branch Name <span className="text-red-500">*</span></Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Premium Plans"
        className="mt-1.5"
      />
    </div>
    <div>
      <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
      <Input
        id="address"
        value={formData.address}
        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        placeholder="Address of this branch"
        className="mt-1.5"
      />
    </div>
    <div>
      <Label htmlFor="phoneNumber">Phone No <span className="text-red-500">*</span></Label>
      <Input
        id="phoneNumber"
        value={formData.phoneNumber}
        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
        placeholder="Phone number of this branch"
        className="mt-1.5"
      />
    </div>
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email of this branch"
        className="mt-1.5"
      />
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

export default function Branches() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    color: "#22c55e",
    status: "Active" as "Active" | "Inactive",
  });

  const columns: Column<Branch>[] = [
    {
      key: "name",
      label: "Branch",
      priority: "always",
      render: (_, item) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}20` }}>
              <Layers className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" /> {item.phoneNumber || "No phone number"}
              </p>
            </div>
          </div>
        )
      },
    },
    { key: "email", label: "Email", priority: "md" },
    { key: "address", label: "Address", priority: "md" },
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

  const rowActions: RowAction<Branch>[] = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (branch) => openEditForm(branch),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (branch) => {
        setSelectedBranch(branch);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["branches-list", currentPage, searchQuery, statusFilter],
    queryFn: () => fetchBranch(currentPage, searchQuery, statusFilter),
  });

  const branchers = apiResponse?.data?.map(mapApiBranch) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleAddBranch = async () => {
    if (!formData.name.trim()) {
      toast.error("Branch name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await Request.post("/branchers/create", formData);
      toast.success("Branch added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to add branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBranch = async () => {
    if (!selectedBranch || !formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await Request.put(`/branchers/${selectedBranch.id}`, formData);
      toast.success("Branch updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to update branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = () => {
    if (!selectedBranch) return;
    const totalItems = 1;
    if (totalItems > 0) {
      toast.error("Delete branch integration coming soon");
      setIsDeleteOpen(false);
      return;
    }
    toast.info("Delete branch integration coming soon");
    setIsDeleteOpen(false);
    setSelectedBranch(null);
  };

  const resetForm = () => {
    setFormData({ name: "", address: "", phoneNumber: "", email: "", color: "#22c55e", status: "Active" });
    setSelectedBranch(null);
  };

  const openEditForm = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      color: branch.color,
      phoneNumber: branch.phoneNumber,
      email: branch.email,
      status: branch.status === "Active" ? "Active" : "Inactive",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branches</h1>
          <p className="text-muted-foreground">Manage and organize branchers efficiently</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Branches</p>
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
      <ResponsiveTable<Branch>
        columns={columns}
        data={branchers}
        keyExtractor={(branch) => branch.id}
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
        title="Add Branch"
        onSubmit={handleAddBranch}
        submitLabel={isSubmitting ? "Adding..." : "Add Branch"}
      >
        <BranchForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Branch"
        onSubmit={handleEditBranch}
        submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
      >
        <BranchForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      {/* Delete Branch */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBranch?.name}"?
              {(" This action cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBranch}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
