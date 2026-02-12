import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Briefcase, Clock, Plus, Pencil, Trash2, Eye, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/PermissionsContext";
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

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  image: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  shift: string;
  status: "active" | "on-leave" | "inactive";
  branch: string;
  systemRoleId?: string; // RBAC role assignment
}

const initialData: Employee[] = [
  { id: 1, employeeId: "EMP-001", name: "Amanda Roberts", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", email: "amanda.r@fitgym.com", phone: "+1 555 111 2222", role: "General Manager", department: "Management", joinDate: "2022-01-15", shift: "9 AM - 6 PM", status: "active", branch: "Downtown", systemRoleId: "super-admin" },
  { id: 2, employeeId: "EMP-002", name: "Marcus Johnson", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", email: "marcus.j@fitgym.com", phone: "+1 555 222 3333", role: "Head Trainer", department: "Training", joinDate: "2022-03-20", shift: "6 AM - 2 PM", status: "active", branch: "Downtown", systemRoleId: "trainer" },
  { id: 3, employeeId: "EMP-003", name: "Jessica Lee", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", email: "jessica.l@fitgym.com", phone: "+1 555 333 4444", role: "Yoga Instructor", department: "Training", joinDate: "2023-06-10", shift: "7 AM - 3 PM", status: "active", branch: "Westside", systemRoleId: "trainer" },
  { id: 4, employeeId: "EMP-004", name: "Daniel Kim", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", email: "daniel.k@fitgym.com", phone: "+1 555 444 5555", role: "Front Desk", department: "Reception", joinDate: "2023-08-05", shift: "2 PM - 10 PM", status: "on-leave", branch: "Downtown", systemRoleId: "front-desk" },
  { id: 5, employeeId: "EMP-005", name: "Sofia Martinez", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", email: "sofia.m@fitgym.com", phone: "+1 555 555 6666", role: "Nutritionist", department: "Wellness", joinDate: "2023-09-12", shift: "10 AM - 6 PM", status: "active", branch: "All", systemRoleId: "admin" },
  { id: 6, employeeId: "EMP-006", name: "Tyler Brown", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", email: "tyler.b@fitgym.com", phone: "+1 555 666 7777", role: "Maintenance", department: "Operations", joinDate: "2023-11-01", shift: "8 AM - 4 PM", status: "inactive", branch: "Eastside" },
  { id: 7, employeeId: "EMP-007", name: "Emily Davis", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", email: "emily.d@fitgym.com", phone: "+1 555 777 8888", role: "Spin Instructor", department: "Training", joinDate: "2023-02-15", shift: "6 AM - 2 PM", status: "active", branch: "Downtown", systemRoleId: "trainer" },
  { id: 8, employeeId: "EMP-008", name: "Jake Wilson", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150", email: "jake.w@fitgym.com", phone: "+1 555 888 9999", role: "Personal Trainer", department: "Training", joinDate: "2023-04-01", shift: "8 AM - 4 PM", status: "active", branch: "Westside", systemRoleId: "trainer" },
];

const departments = ["Management", "Training", "Reception", "Wellness", "Operations", "Sales"];
const branches = ["Downtown", "Westside", "Eastside", "All"];
const jobRoles = ["General Manager", "Head Trainer", "Personal Trainer", "Yoga Instructor", "Spin Instructor", "Boxing Coach", "Front Desk", "Nutritionist", "Maintenance", "Sales Rep"];
const shifts = ["6 AM - 2 PM", "7 AM - 3 PM", "8 AM - 4 PM", "9 AM - 5 PM", "10 AM - 6 PM", "2 PM - 10 PM", "4 PM - 10 PM"];

export default function Employees() {
  const navigate = useNavigate();
  const { roles, getRoleById, hasPermission } = usePermissions();
  const [employees, setEmployees] = useState<Employee[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    joinDate: new Date().toISOString().split('T')[0],
    shift: "",
    status: "active" as "active" | "on-leave" | "inactive",
    branch: "",
    image: "",
    systemRoleId: "",
  });

  const canCreate = hasPermission("employees", "create");
  const canEdit = hasPermission("employees", "edit");
  const canDelete = hasPermission("employees", "delete");

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: employees,
    itemsPerPage: 8,
    searchFields: ["name", "employeeId", "email", "role"],
  });

  const filteredData = paginatedData.filter((employee) => {
    if (filters.status && filters.status !== "all" && employee.status !== filters.status) return false;
    if (filters.department && filters.department !== "all" && employee.department !== filters.department) return false;
    if (filters.branch && filters.branch !== "all" && employee.branch !== filters.branch) return false;
    return true;
  });

  const columns: Column<Employee>[] = [
    { 
      key: "image", 
      label: "", 
      priority: "always", 
      className: "w-12", 
      render: (value: string, item: Employee) => value ? (
        <ImagePreview src={value} alt={item.name} size="md" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      )
    },
    {
      key: "name",
      label: "Employee",
      priority: "always",
      render: (value: string, item: Employee) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{item.role}</p>
        </div>
      ),
    },
    { key: "employeeId", label: "ID", priority: "xl" },
    { key: "department", label: "Department", priority: "lg" },
    { key: "email", label: "Email", priority: "xl" },
    { key: "phone", label: "Phone", priority: "lg" },
    { key: "shift", label: "Shift", priority: "md" },
    { key: "branch", label: "Branch", priority: "lg" },
    {
      key: "systemRoleId",
      label: "System Role",
      priority: "md",
      render: (value: string | undefined) => {
        const systemRole = value ? getRoleById(value) : null;
        return systemRole ? (
          <Badge variant="outline" className="gap-1">
            <Shield className="w-3 h-3" />
            {systemRole.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">No role</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (value: "active" | "on-leave" | "inactive") => {
        const statusMap = { active: { status: "success" as const, label: "Active" }, "on-leave": { status: "warning" as const, label: "On Leave" }, inactive: { status: "neutral" as const, label: "Inactive" } };
        return <StatusBadge {...statusMap[value]} />;
      },
    },
  ];

  const rowActions: RowAction<Employee>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (employee) => {
        setSelectedEmployee(employee);
        setIsViewOpen(true);
      },
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: (employee) => openEditForm(employee),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (employee) => {
        setSelectedEmployee(employee);
        setIsDeleteOpen(true);
      },
      variant: "danger",
    },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      joinDate: new Date().toISOString().split('T')[0],
      shift: "",
      status: "active",
      branch: "",
      image: "",
      systemRoleId: "",
    });
    setSelectedEmployee(null);
  };

  const openEditForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      joinDate: employee.joinDate,
      shift: employee.shift,
      status: employee.status,
      branch: employee.branch,
      image: employee.image,
      systemRoleId: employee.systemRoleId || "",
    });
    setIsEditOpen(true);
  };

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in required fields");
      return;
    }

    const newEmployee: Employee = {
      id: Date.now(),
      employeeId: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      joinDate: formData.joinDate,
      shift: formData.shift,
      status: formData.status,
      branch: formData.branch,
      image: formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      systemRoleId: formData.systemRoleId || undefined,
    };

    setEmployees([newEmployee, ...employees]);
    toast.success("Employee added successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
    
    setEmployees(employees.map(e => 
      e.id === selectedEmployee.id 
        ? {
            ...e,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            joinDate: formData.joinDate,
            shift: formData.shift,
            status: formData.status,
            branch: formData.branch,
            image: formData.image || e.image,
            systemRoleId: formData.systemRoleId || undefined,
          }
        : e
    ));
    toast.success("Employee updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
    toast.success("Employee deleted successfully");
    setIsDeleteOpen(false);
    setSelectedEmployee(null);
  };

  const activeCount = employees.filter(e => e.status === "active").length;
  const trainersCount = employees.filter(e => e.department === "Training").length;
  const onLeaveCount = employees.filter(e => e.status === "on-leave").length;

  const EmployeeForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {jobRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="shift">Shift</Label>
          <Select value={formData.shift} onValueChange={(v) => setFormData({ ...formData, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>
              {shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="joinDate">Join Date</Label>
          <Input
            id="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v: "active" | "on-leave" | "inactive") => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="image">Profile Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        <div>
          <Label htmlFor="systemRoleId">System Access Role</Label>
          <Select 
            value={formData.systemRoleId || "none"} 
            onValueChange={(v) => setFormData({ ...formData, systemRoleId: v === "none" ? "" : v })}
          >
            <SelectTrigger><SelectValue placeholder="Select access role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No System Access</SelectItem>
              {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
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
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage gym staff and employees</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{trainersCount}</p>
              <p className="text-xs text-muted-foreground">Trainers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{onLeaveCount}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search employees..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "active", label: "Active" },
              { value: "on-leave", label: "On Leave" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            key: "department",
            label: "Department",
            value: filters.department || "all",
            onChange: (v) => handleFilter("department", v),
            options: departments.map(d => ({ value: d, label: d })),
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
        onRowClick={(item) => navigate(`/employees/${item.id}`)}
      />

      {/* Add Employee Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add Employee"
        description="Add a new staff member"
        onSubmit={handleAddEmployee}
        submitLabel="Add Employee"
      >
        <EmployeeForm />
      </QuickAddSheet>

      {/* Edit Employee Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Employee"
        description="Update employee details"
        onSubmit={handleEditEmployee}
        submitLabel="Save Changes"
      >
        <EmployeeForm />
      </QuickAddSheet>

      {/* View Employee Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>{selectedEmployee?.employeeId}</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedEmployee.image ? (
                  <img src={selectedEmployee.image} alt={selectedEmployee.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold">{selectedEmployee.name}</p>
                  <p className="text-muted-foreground">{selectedEmployee.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{selectedEmployee.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shift</p>
                  <p className="font-medium">{selectedEmployee.shift}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge 
                  status={selectedEmployee.status === "active" ? "success" : selectedEmployee.status === "on-leave" ? "warning" : "neutral"} 
                  label={selectedEmployee.status === "on-leave" ? "On Leave" : selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewOpen(false); if (selectedEmployee) openEditForm(selectedEmployee); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEmployee?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
