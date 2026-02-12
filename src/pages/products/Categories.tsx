import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { 
  Plus, Pencil, Trash2, FolderOpen, Package, Palette
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
import { useTableData } from "@/hooks/use-table-data";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  productCount: number;
  createdAt: string;
  status: "active" | "inactive";
}

const mockCategories: Category[] = [
  { id: "1", name: "Supplements", description: "Protein, vitamins, and health supplements", color: "#22c55e", productCount: 12, createdAt: "2024-01-15", status: "active" },
  { id: "2", name: "Snacks", description: "Energy bars and healthy snacks", color: "#f59e0b", productCount: 8, createdAt: "2024-01-10", status: "active" },
  { id: "3", name: "Accessories", description: "Gym accessories and gear", color: "#3b82f6", productCount: 15, createdAt: "2024-01-08", status: "active" },
  { id: "4", name: "Equipment", description: "Training equipment for home and gym", color: "#8b5cf6", productCount: 6, createdAt: "2024-01-05", status: "active" },
  { id: "5", name: "Apparel", description: "Gym clothing and sportswear", color: "#ec4899", productCount: 20, createdAt: "2024-01-02", status: "active" },
  { id: "6", name: "Beverages", description: "Sports drinks and water", color: "#06b6d4", productCount: 4, createdAt: "2024-01-01", status: "inactive" },
];

const colorOptions = [
  "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#14b8a6"
];

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#22c55e",
    status: "active" as "active" | "inactive",
  });

  const { searchQuery, handleSearch, paginatedData, currentPage, handlePageChange, totalPages } = useTableData({
    data: categories.filter(c => statusFilter === "all" || c.status === statusFilter),
    itemsPerPage: 8,
    searchFields: ["name", "description"],
  });

  const columns: Column<Category>[] = [
    { 
      key: "name", 
      label: "Category", 
      priority: "always",
      render: (_, category) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <FolderOpen className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <div 
              className="w-3 h-3 rounded-full inline-block mr-1" 
              style={{ backgroundColor: category.color }}
            />
            <span className="text-xs text-muted-foreground">Color</span>
          </div>
        </div>
      ),
    },
    { 
      key: "description", 
      label: "Description", 
      priority: "lg",
      render: (value) => <span className="text-sm text-muted-foreground line-clamp-2">{value}</span>,
    },
    { 
      key: "productCount", 
      label: "Products", 
      priority: "md",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    { 
      key: "status", 
      label: "Status", 
      priority: "md",
      render: (value) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
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

  const rowActions: RowAction<Category>[] = [
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

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: formData.status,
    };
    setCategories([...categories, newCategory]);
    toast.success("Category added successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;
    setCategories(categories.map(c => 
      c.id === selectedCategory.id 
        ? { ...c, name: formData.name, description: formData.description, color: formData.color, status: formData.status }
        : c
    ));
    toast.success("Category updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    if (selectedCategory.productCount > 0) {
      toast.error("Cannot delete category with products. Move products first.");
      setIsDeleteOpen(false);
      return;
    }
    setCategories(categories.filter(c => c.id !== selectedCategory.id));
    toast.success("Category deleted successfully");
    setIsDeleteOpen(false);
    setSelectedCategory(null);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#22c55e", status: "active" });
    setSelectedCategory(null);
  };

  const openEditForm = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      status: category.status,
    });
    setIsEditOpen(true);
  };

  const CategoryForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description"
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
            variant={formData.status === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({ ...formData, status: "active" })}
          >
            Active
          </Button>
          <Button
            type="button"
            variant={formData.status === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({ ...formData, status: "inactive" })}
          >
            Inactive
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Categories</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
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
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Categories Table */}
      <ResponsiveTable<Category>
        columns={columns}
        data={paginatedData}
        keyExtractor={(category) => category.id}
        rowActions={rowActions}
        pagination={{
          currentPage,
          totalPages,
          totalItems: categories.length,
          itemsPerPage: 8,
          onPageChange: handlePageChange,
        }}
      />

      {/* Add Category Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Category"
        description="Create a new product category"
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

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {selectedCategory?.productCount ? (
                <span className="block mt-2 text-destructive">
                  This category has {selectedCategory.productCount} products. Please move them first.
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

export default Categories;
