import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Pencil, Trash2, FolderOpen, Palette, CreditCard, Dumbbell, UserCog2
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Request from "@/lib/api/client";

// API response types
interface ApiMembership {
  _id: string;
  name: string;
}

interface ApiCategory {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  membershipsCount: number;
  classesCount: number;
  personalTrainings: number;
  memberships: ApiMembership[];
  classes: { _id: string; name: string }[];
}

interface ApiListResponse {
  data: ApiCategory[];
  dataCount: number;
  currentPaginationIndex: number;
  dataPerPage: number;
  message: string;
}

// Mapped UI type
interface TrainingCategory {
  id: string;
  name: string;
  status: string;
  membershipCount: number;
  classCount: number;
  ptCount: number;
  createdAt: string;
  memberships: { id: string; name: string }[];
  classes: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 8;

const colorOptions = [
  "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#14b8a6"
];

// Assign a consistent color based on category id
const getCategoryColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorOptions[Math.abs(hash) % colorOptions.length];
};

const mapApiCategory = (cat: ApiCategory): TrainingCategory => ({
  id: cat._id,
  name: cat.name,
  status: cat.status || "Active",
  membershipCount: cat.membershipsCount,
  classCount: cat.classesCount,
  ptCount: cat.personalTrainings,
  createdAt: new Date(cat.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  }),
  memberships: cat.memberships.map(m => ({ id: m._id, name: m.name })),
  classes: cat.classes.map(c => ({ id: c._id, name: c.name })),
});

const fetchCategories = async (page: number, search: string, status: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;

  const res = await Request.get<ApiListResponse>("/categorys/list", params);
  return res;
};

const TrainingCategories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#22c55e",
    status: "Active" as "Active" | "Inactive",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment state
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedPTPackages, setSelectedPTPackages] = useState<string[]>([]);

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["training-categories", currentPage, searchQuery, statusFilter],
    queryFn: () => fetchCategories(currentPage, searchQuery, statusFilter),
  });

  const categories = apiResponse?.data?.map(mapApiCategory) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const columns: Column<TrainingCategory>[] = [
    {
      key: "name",
      label: "Category",
      priority: "always",
      render: (_, category) => {
        const color = getCategoryColor(category.id);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <FolderOpen className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <p className="font-medium">{category.name}</p>
              <span className="text-xs text-muted-foreground">{category.createdAt}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "membershipCount",
      label: "Memberships",
      priority: "md",
      render: (value) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "classCount",
      label: "Classes",
      priority: "md",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "ptCount",
      label: "PT Packages",
      priority: "lg",
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCog2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
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
    {
      key: "createdAt",
      label: "Created",
      priority: "xl",
      render: (value) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
  ];

  const rowActions: RowAction<TrainingCategory>[] = [
    {
      label: "View Items",
      icon: FolderOpen,
      onClick: (category) => openAssignForm(category),
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: (category) => openEditForm(category),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (category) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await Request.post("/categorys/create", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        color: formData.color,
      });
      toast.success("Category added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await Request.put(`/categorys/${selectedCategory.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        color: formData.color,
      });
      toast.success("Category updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    const totalItems = selectedCategory.membershipCount + selectedCategory.classCount + selectedCategory.ptCount;
    if (totalItems > 0) {
      toast.error("Cannot delete category with assigned items. Remove assignments first.");
      setIsDeleteOpen(false);
      return;
    }
    toast.info("Delete category API integration coming soon");
    setIsDeleteOpen(false);
    setSelectedCategory(null);
  };

  const handleAssignItems = () => {
    toast.info("Assign items API integration coming soon");
    setIsAssignOpen(false);
    setSelectedMemberships([]);
    setSelectedClasses([]);
    setSelectedPTPackages([]);
    setSelectedCategory(null);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#22c55e", status: "Active" });
    setSelectedCategory(null);
  };

  const openEditForm = (category: TrainingCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: "",
      color: getCategoryColor(category.id),
      status: category.status === "Active" ? "Active" : "Inactive",
    });
    setIsEditOpen(true);
  };

  const openAssignForm = (category: TrainingCategory) => {
    setSelectedCategory(category);
    setSelectedMemberships(category.memberships.map(m => m.id));
    setSelectedClasses(category.classes.map(c => c.id));
    setSelectedPTPackages([]);
    setIsAssignOpen(true);
  };

  const toggleMembership = (id: string) => {
    setSelectedMemberships(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleClass = (id: string) => {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePTPackage = (id: string) => {
    setSelectedPTPackages(prev =>
      prev.includes(id) ? prev.filter(pt => pt !== id) : [...prev, id]
    );
  };

  const CategoryForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Premium Plans"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category"
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
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>
      <div>
        <Label>Status</Label>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant={formData.status === "Active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({ ...formData, status: "Active" })}
          >
            Active
          </Button>
          <Button
            type="button"
            variant={formData.status === "Inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({ ...formData, status: "Inactive" })}
          >
            Inactive
          </Button>
        </div>
      </div>
    </div>
  );

  const AssignedItemsView = () => {
    const currentMemberships = selectedCategory?.memberships ?? [];
    const currentClasses = selectedCategory?.classes ?? [];

    return (
      <div className="space-y-6">
        {/* Memberships Section */}
        <div>
          <Label className="flex items-center gap-2 text-base font-semibold mb-3">
            <CreditCard className="h-4 w-4" />
            Memberships ({currentMemberships.length})
          </Label>
          <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-3">
            {currentMemberships.length > 0 ? currentMemberships.map((membership) => (
              <div
                key={membership.id}
                className="flex items-center gap-3 p-2 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-sm">{membership.name}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-2">No memberships assigned</p>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <Label className="flex items-center gap-2 text-base font-semibold mb-3">
            <Dumbbell className="h-4 w-4" />
            Classes ({currentClasses.length})
          </Label>
          <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-3">
            {currentClasses.length > 0 ? currentClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center gap-3 p-2 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-sm">{classItem.name}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-2">No classes assigned</p>
            )}
          </div>
        </div>

        {/* PT Packages Section */}
        <div>
          <Label className="flex items-center gap-2 text-base font-semibold mb-3">
            <UserCog2 className="h-4 w-4" />
            PT Packages ({selectedCategory?.ptCount ?? 0})
          </Label>
          <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-3">
            <p className="text-sm text-muted-foreground py-2">No PT packages assigned</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Categories</h1>
          <p className="text-muted-foreground">Organize memberships, classes, and PT packages into categories</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        searchPlaceholder="Search categories..."
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

      {/* Categories Table */}
      <ResponsiveTable<TrainingCategory>
        columns={columns}
        data={categories}
        keyExtractor={(category) => category.id}
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

      {/* Add Category Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Category"
        description="Create a new category for training items"
        onSubmit={handleAddCategory}
        submitLabel="Add Category"
      >
        <CategoryForm />
      </QuickAddSheet>

      {/* Edit Category Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Category"
        description="Update category details"
        onSubmit={handleEditCategory}
        submitLabel="Save Changes"
      >
        <CategoryForm />
      </QuickAddSheet>

      {/* Assign Items Sheet */}
      {/* View Assigned Items Sheet */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Items in "{selectedCategory?.name}"</DialogTitle>
            <DialogDescription>
              Memberships, classes, and PT packages assigned to this category
            </DialogDescription>
          </DialogHeader>
          <AssignedItemsView />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"?
              {(selectedCategory?.membershipCount || 0) + (selectedCategory?.classCount || 0) + (selectedCategory?.ptCount || 0) > 0 ? (
                <span className="block mt-2 text-destructive">
                  This category has {selectedCategory?.membershipCount} memberships, {selectedCategory?.classCount} classes, and {selectedCategory?.ptCount} PT packages. Please remove assignments first.
                </span>
              ) : (
                " This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingCategories;
