import { useState } from "react";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingDown, FileText, PieChart, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/useCurrency";

interface Expense {
  id: number;
  expenseId: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  status: "approved" | "pending" | "rejected";
  branch: string;
}

const initialData: Expense[] = [
  { id: 1, expenseId: "EXP-001", category: "Equipment", vendor: "FitGear Pro", description: "New treadmill maintenance parts", amount: 450.00, date: "2024-12-31", paidBy: "Admin", status: "approved", branch: "Downtown" },
  { id: 2, expenseId: "EXP-002", category: "Utilities", vendor: "City Power", description: "Monthly electricity bill", amount: 1250.00, date: "2024-12-30", paidBy: "Auto-Pay", status: "approved", branch: "All" },
  { id: 3, expenseId: "EXP-003", category: "Supplies", vendor: "CleanMax", description: "Cleaning supplies & sanitizers", amount: 189.50, date: "2024-12-29", paidBy: "Manager", status: "pending", branch: "Westside" },
  { id: 4, expenseId: "EXP-004", category: "Marketing", vendor: "AdPro Agency", description: "Social media advertising - December", amount: 800.00, date: "2024-12-28", paidBy: "Admin", status: "approved", branch: "All" },
  { id: 5, expenseId: "EXP-005", category: "Maintenance", vendor: "HVAC Solutions", description: "Air conditioning repair", amount: 350.00, date: "2024-12-27", paidBy: "Manager", status: "rejected", branch: "Eastside" },
  { id: 6, expenseId: "EXP-006", category: "Insurance", vendor: "SafeGuard Inc", description: "Quarterly liability insurance", amount: 2500.00, date: "2024-12-25", paidBy: "Auto-Pay", status: "approved", branch: "All" },
  { id: 7, expenseId: "EXP-007", category: "Equipment", vendor: "GymTech", description: "New dumbbells set", amount: 650.00, date: "2024-12-24", paidBy: "Admin", status: "approved", branch: "Downtown" },
  { id: 8, expenseId: "EXP-008", category: "Supplies", vendor: "TowelWorld", description: "Gym towels bulk order", amount: 320.00, date: "2024-12-23", paidBy: "Manager", status: "pending", branch: "Westside" },
];

const categories = ["Equipment", "Utilities", "Supplies", "Marketing", "Maintenance", "Insurance", "Rent", "Salaries"];
const branches = ["Downtown", "Westside", "Eastside", "All"];
const paidByOptions = ["Admin", "Manager", "Auto-Pay", "Petty Cash"];

export default function Expenses() {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    vendor: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paidBy: "",
    status: "pending" as "approved" | "pending" | "rejected",
    branch: "",
  });

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: expenses,
    itemsPerPage: 8,
    searchFields: ["category", "vendor", "expenseId", "description"],
  });

  const filteredData = paginatedData.filter((expense) => {
    if (filters.status && filters.status !== "all" && expense.status !== filters.status) return false;
    if (filters.category && filters.category !== "all" && expense.category !== filters.category) return false;
    if (filters.branch && filters.branch !== "all" && expense.branch !== filters.branch) return false;
    return true;
  });

  const columns: Column<Expense>[] = [
    {
      key: "category",
      label: "Category",
      priority: "always",
      render: (value: string, item: Expense) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground md:hidden">{formatCurrency(item.amount)}</p>
        </div>
      ),
    },
    { key: "expenseId", label: "ID", priority: "xl", render: (value: string) => <span className="font-mono text-xs">{value}</span> },
    { key: "vendor", label: "Vendor", priority: "md" },
    { key: "description", label: "Description", priority: "lg", render: (value: string) => <span className="text-sm truncate max-w-[180px] block">{value}</span> },
    { key: "amount", label: "Amount", priority: "always", render: (value: number) => <span className="font-semibold text-destructive">{formatCurrency(value)}</span> },
    { key: "date", label: "Date", priority: "md", render: (value: string) => new Date(value).toLocaleDateString() },
    { key: "paidBy", label: "Paid By", priority: "lg" },
    { key: "branch", label: "Branch", priority: "xl" },
    {
      key: "status",
      label: "Status",
      priority: "md",
      render: (value: "approved" | "pending" | "rejected") => {
        const statusMap = { approved: { status: "success" as const, label: "Approved" }, pending: { status: "warning" as const, label: "Pending" }, rejected: { status: "error" as const, label: "Rejected" } };
        return <StatusBadge {...statusMap[value]} />;
      },
    },
  ];

  const rowActions: RowAction<Expense>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (expense) => {
        setSelectedExpense(expense);
        setIsViewOpen(true);
      },
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: (expense) => openEditForm(expense),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (expense) => {
        setSelectedExpense(expense);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const resetForm = () => {
    setFormData({
      category: "",
      vendor: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      paidBy: "",
      status: "pending",
      branch: "",
    });
    setSelectedExpense(null);
  };

  const openEditForm = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      vendor: expense.vendor,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      paidBy: expense.paidBy,
      status: expense.status,
      branch: expense.branch,
    });
    setIsEditOpen(true);
  };

  const handleAddExpense = () => {
    if (!formData.category || !formData.vendor || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      expenseId: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
      category: formData.category,
      vendor: formData.vendor,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paidBy: formData.paidBy,
      status: formData.status,
      branch: formData.branch,
    };

    setExpenses([newExpense, ...expenses]);
    toast.success("Expense added successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditExpense = () => {
    if (!selectedExpense) return;
    
    setExpenses(expenses.map(e => 
      e.id === selectedExpense.id 
        ? {
            ...e,
            category: formData.category,
            vendor: formData.vendor,
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date,
            paidBy: formData.paidBy,
            status: formData.status,
            branch: formData.branch,
          }
        : e
    ));
    toast.success("Expense updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteExpense = () => {
    if (!selectedExpense) return;
    setExpenses(expenses.filter(e => e.id !== selectedExpense.id));
    toast.success("Expense deleted successfully");
    setIsDeleteOpen(false);
    setSelectedExpense(null);
  };

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === "pending").length;

  const ExpenseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="branch">Branch *</Label>
          <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="vendor">Vendor *</Label>
        <Input
          id="vendor"
          value={formData.vendor}
          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
          placeholder="Enter vendor name"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Expense description"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={formData.paidBy} onValueChange={(v) => setFormData({ ...formData, paidBy: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {paidByOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v: "approved" | "pending" | "rejected") => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track and manage gym expenses</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalThisMonth)}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">32%</p>
              <p className="text-xs text-muted-foreground">Equipment</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">-5.2%</p>
              <p className="text-xs text-muted-foreground">vs Last Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search expenses..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            key: "category",
            label: "Category",
            value: filters.category || "all",
            onChange: (v) => handleFilter("category", v),
            options: categories.map(c => ({ value: c, label: c })),
          },
          {
            key: "branch",
            label: "Branch",
            value: filters.branch || "all",
            onChange: (v) => handleFilter("branch", v),
            options: branches.map(b => ({ value: b, label: b })),
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable 
        data={filteredData} 
        columns={columns} 
        keyExtractor={(item) => item.id} 
        pagination={paginationProps}
        rowActions={rowActions}
      />

      {/* Add Expense Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Expense"
        description="Record a new expense"
        onSubmit={handleAddExpense}
        submitLabel="Add Expense"
      >
        <ExpenseForm />
      </QuickAddSheet>

      {/* Edit Expense Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Expense"
        description="Update expense details"
        onSubmit={handleEditExpense}
        submitLabel="Save Changes"
      >
        <ExpenseForm />
      </QuickAddSheet>

      {/* View Expense Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>{selectedExpense?.expenseId}</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-destructive">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid By</p>
                  <p className="font-medium">{selectedExpense.paidBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{selectedExpense.branch}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedExpense.description || "No description"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge 
                  status={selectedExpense.status === "approved" ? "success" : selectedExpense.status === "pending" ? "warning" : "error"} 
                  label={selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewOpen(false); if (selectedExpense) openEditForm(selectedExpense); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete expense "{selectedExpense?.expenseId}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
