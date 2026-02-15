import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { Users, UserPlus, UserCheck, UserX, Cake, Plus, Pencil, Eye, Trash2, MessageCircle, Mail, User, UserRound, Contact, Shield   } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { toast } from "sonner";
import Request from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cleanObject } from "@/utils/helpers";

interface Branch {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
}

interface BranchListResponse {
  data: Branch[];
  message: string;
}

interface ApiEmployee {
  _id: string;
  memberId: string;
  name: string;
  image: string;
  email: string;
  phoneNumber: string;
  employeeShipName: string;
  classes: string[];
  createdAt: string;
  renewalDay: string;
  gender?: "male" | "female" | "other";
  status: "Active" | "Inactive";
  branch: Branch;
  dateOfBirth?: string; // Format: "MM-DD"
  isInstructor: boolean;
  nic?: string;
  designation: string;
}
interface ApiListResponse {
  analytics: {
    totalEmployees: number;
    activeEmployees: number;
    instructors: number;
    onLeaveEmployees: number;
  };
  data: ApiEmployee[];
  dataCount: number;
  currentPaginationIndex: number;
  dataPerPage: number;
  message: string;
}

interface Employee {
  id: string;
  memberId: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  nic?: string;
  designation: string;
  name: string;
  image: string;
  email: string;
  classes: string[];
  joinDate: string;
  status: "Active" | "Inactive";
  branch?: string;
  branchName?: string;
  dateOfBirth?: string; // Format: "MM-DD"
  isInstructor: boolean;
}

// Helper to check if today is dateOfBirth
const isBirthdayToday = (dateOfBirth?: string) => {
  if (!dateOfBirth) return false;
  const today = new Date();
  const [month, day] = dateOfBirth.split("-").map(Number);
  return today.getMonth() + 1 === month && today.getDate() === day;
};

// Helper to check if dateOfBirth is within next 7 days
const isBirthdaySoon = (dateOfBirth?: string) => {
  if (!dateOfBirth) return false;
  const today = new Date();
  const [month, day] = dateOfBirth.split("-").map(Number);
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

  // If dateOfBirth passed this year, check next year
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(today.getFullYear() + 1);
  }

  const diffDays = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
};

const ITEMS_PER_PAGE = 8;

const fetchEmployees = async (page: number, search: string, status: string, branch: string, gender: string, startDate?: Date, endDate?: Date) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;
  if (branch && branch !== "all") params["filters[branch]"] = branch;
  if (gender && gender !== "all") params["filters[gender]"] = gender;
  if (startDate) params["startDay"] = startDate;
  if (endDate) params["endDay"] = endDate;

  const res = await Request.get<ApiListResponse>("/employees/list", params);
  return res;
};

const columns: Column<Employee>[] = [
  { key: "image", label: "", priority: "always", className: "w-12", render: (value: string, item: Employee) => <ImagePreview src={value} alt={item.name} size="md" /> },
  {
    key: "name",
    label: "Employee",
    priority: "always",
    render: (value: string, item: Employee) => (
      <div className="flex items-center gap-2">
        <div>
          <p className="font-medium">{value}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {item.gender === "male" && (
              <User className="w-2.5 h-2.5 text-blue-500" />
            )}

            {item.gender === "female" && (
              <UserRound className="w-2.5 h-2.5 text-pink-500" />
            )}

            {item.gender === "other" && (
              <Contact className="w-2.5 h-2.5 text-gray-500" />
            )}
            <span>{item.memberId}</span>
          </div>
        </div>
        {isBirthdayToday(item.dateOfBirth) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center animate-pulse">
                  <Cake className="w-3.5 h-3.5 text-warning" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🎉 Birthday Today!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!isBirthdayToday(item.dateOfBirth) && isBirthdaySoon(item.dateOfBirth) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Cake className="w-3.5 h-3.5 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Birthday coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    ),
  },
  { key: "phoneNumber", label: "Phone", priority: "xl" },
  { key: "email", label: "Email", priority: "xl" },
  {
    key: "role",
    label: "Role",
    priority: "md",
    render: (value: string | undefined) => {
      return (value && value !== "_") ? (
        <Badge variant="outline" className="gap-1">
          <Shield className="w-3 h-3" />
          {value}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">_</span>
      );
    },
  },
  {
    key: "classes",
    label: "Classes",
    priority: "lg",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground">_</span>
        ) : (
          <>
            {value.slice(0, 2).map((cls) => (
              <span key={cls} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                {cls}
              </span>
            ))}
            {value.length > 2 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                +{value.length - 2}
              </span>
            )}
          </>
        )}
      </div>
    ),
  },
  {
    key: "classes",
    label: "Branchers",
    priority: "lg",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground">_</span>
        ) : (
          <>
            {value.slice(0, 2).map((cls) => (
              <span key={cls} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                {cls}
              </span>
            ))}
            {value.length > 2 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                +{value.length - 2}
              </span>
            )}
          </>
        )}
      </div>
    ),
  },
  { key: "joinDate", label: "Joined", priority: "lg" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "Active" | "Inactive") => (
      <StatusBadge status={value === "Active" ? "success" : value === "Inactive" ? "error" : "warning"} label={value.charAt(0).toUpperCase() + value.slice(1)} />
    ),
  },
];

const mapApiEmployee = (mb: ApiEmployee): Employee => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name,
  gender: mb.gender,
  image: mb.image ? mb.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  email: mb.email ? mb.email : "_",
  phoneNumber: mb.phoneNumber ? mb.phoneNumber : "_",
  classes: mb.classes ? mb.classes : [],
  joinDate: mb.createdAt ? new Date(mb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "_",
  status: mb.status || "Inactive",
  dateOfBirth: mb.dateOfBirth || "",
  branch: mb.branch ? mb.branch._id : "_",
  branchName: mb.branch ? mb.branch.name : "_",
  isInstructor: mb.isInstructor || false,
  designation: mb.designation || "",
});

const fetchBranches = async () => {
  const params = {
    "filters[status]": "Active",
    dataPerPage: 100, // Get all active branches
  };
  const res = await Request.get<BranchListResponse>("/branchers/list", params);
  return res.data || [];
};

interface EmployeeFormProps {
  formData: {
    memberId: string;
    name: string;
    phoneNumber: string;
    email: string;
    branch: string;
    status: "Active" | "Inactive";
    gender?: "male" | "female" | "other";
    isInstructor: boolean;
    nic?: string;
    designation: string;
    dateOfBirth?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    memberId: string;
    name: string;
    phoneNumber: string;
    email: string;
    branch: string;
    status: "Active" | "Inactive";
    gender?: "male" | "female" | "other";
    isInstructor?: boolean;
    nic?: string;
    designation?: string;
    dateOfBirth?: string;
  }>>;
}

const EmployeeForm = ({ formData, setFormData }: EmployeeFormProps) => {
  // Fetch branches for dropdown
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches-dropdown"],
    queryFn: fetchBranches,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="memberId">Employee Id <span className="text-red-500">*</span></Label>
        <Input
          id="memberId"
          value={formData.memberId}
          onChange={(e) => setFormData(prev => ({ ...prev, memberId: e.target.value }))}
          placeholder="e.g., 12345"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="name">Employee Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., John Doe"
          className="mt-1.5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
        <Select value={formData.gender} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v as "male" | "female" | "other" }))}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
        <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as "Active" | "Inactive" }))}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Birthday</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone No <span className="text-destructive">*</span></Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          placeholder="e.g., 0771234567"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="email">Email </Label>
        <Input
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="e.g., john.doe@example.com"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="nic">NIC </Label>
        <Input
          id="nic"
          value={formData.nic}
          onChange={(e) => setFormData(prev => ({ ...prev, nic: e.target.value }))}
          placeholder="e.g., 123456789V"
          className="mt-1.5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch">Role  <span className="text-destructive">*</span></Label>
        <Select
          value={formData.branch}
          onValueChange={(v) => setFormData(prev => ({ ...prev, branch: v }))}
          disabled={branchesLoading}
        >
          <SelectTrigger id="branch">
            <SelectValue placeholder={branchesLoading ? "Loading roles..." : "Select role"} />
          </SelectTrigger>
          <SelectContent>
            {branches.length === 0 && !branchesLoading ? (
              <SelectItem value="no-roles" disabled>
                No active roles available
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
      <Label>Type <span className="text-red-500">*</span></Label>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant={formData.isInstructor === true ? "default" : "outline"}
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, isInstructor: true }))}
        >
          Permanant
        </Button>
        <Button
          type="button"
          variant={formData.isInstructor === false ? "default" : "outline"}
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, isInstructor: false }))}
        >
          Contract
        </Button>
      </div>
    </div>
      <div>
        <Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label>
        <Input
          id="designation"
          value={formData.designation}
          onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
          placeholder="e.g., Yoga Instructor"
          className="mt-1.5"
        />
      </div>
    </div>
  );
};

export default function Employees() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<EmployeeFormProps["formData"]>({
    memberId: "",
    nic: "",
    name: "",
    phoneNumber: "",
    email: "",
    gender: "other",
    status: "Active",
    branch: "",
    isInstructor: false,
    designation: "",
    dateOfBirth: "",
  });

  // Async branch search for filter
  const searchBranchesForFilter = async (query: string) => {
    try {
      const params: Record<string, unknown> = {
        dataPerPage: 20,
      };
      if (query.trim()) {
        params.search = query;
      }

      const res = await Request.get<BranchListResponse>("/branchers/list", params);
      const branches = res.data || [];

      return [
        { value: "all", label: "All Branches" },
        ...branches.map((branch) => ({
          value: branch._id,
          label: branch.name,
        })),
      ];
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      return [{ value: "all", label: "All Branches" }];
    }
  };

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleWhatsApp = (employee: Employee) => {
    window.open(`https://wa.me/${employee.phoneNumber.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (employee: Employee) => {
    window.open(`mailto:${employee.email}`, "_blank");
  };

  const rowActions: RowAction<Employee>[] = [
    { icon: Pencil, label: "Edit", onClick: (mb) => openEditForm(mb), variant: "default" },
    { icon: Eye, label: "View", onClick: handleView, variant: "primary" },
    { icon: MessageCircle, label: "WhatsApp", onClick: handleWhatsApp, variant: "default" },
    { icon: Mail, label: "Email", onClick: handleEmail, variant: "default" },
    { label: "Delete", icon: Trash2, onClick: (employee) => { setSelectedEmployee(employee); setIsDeleteOpen(true); }, variant: "danger" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["employees-list", currentPage, searchQuery, statusFilter, branchFilter, genderFilter, startDate, endDate],
    queryFn: () => fetchEmployees(currentPage, searchQuery, statusFilter, branchFilter, genderFilter, startDate, endDate),
  });

  const employees = apiResponse?.data?.map(mapApiEmployee) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));
  const analytics = apiResponse?.analytics ? {
    totalEmployees: apiResponse?.analytics?.totalEmployees || 0,
    activeEmployees: apiResponse?.analytics?.activeEmployees || 0,
    instructors: apiResponse?.analytics?.instructors || 0,
    onLeaveEmployees: apiResponse?.analytics?.onLeaveEmployees || 0,
  } : { totalEmployees: 0, activeEmployees: 0, instructors: 0, onLeaveEmployees: 0 };

  const handleAddEmployee = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (!formData.memberId.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!formData.gender) {
      toast.error("Employee gender is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.post("/employees/create", formData);
      toast.success("Employee added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (!formData.memberId.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!formData.gender) {
      toast.error("Employee gender is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.put(`/employees/${selectedEmployee.id}`, cleanObject(formData));
      toast.success("Employee updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await Request.delete(`/employees/${selectedEmployee.id}`);
      toast.success("Employee deleted successfully");
      setIsDeleteOpen(false);
      setSelectedEmployee(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      memberId: "",
      gender: "other",
      branch: "",
      phoneNumber: "",
      email: "",
      nic: "",
      designation: "",
      dateOfBirth: "",
      status: "Active",
      isInstructor: false,
    });
    setSelectedEmployee(null);
  };

  const openEditForm = (mb: Employee) => {
    setSelectedEmployee(mb);
    setFormData({
      name: mb.name,
      memberId: mb.memberId,
      gender: mb.gender || "other",
      branch: mb.branch || "",
      phoneNumber: mb.phoneNumber || "",
      email: mb.email || "",
      nic: mb.nic || "",
      designation: mb.designation || "",
      dateOfBirth: mb.dateOfBirth || "",
      status: mb.status,
      isInstructor: mb.isInstructor,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage employees and their details</p>
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
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.totalEmployees}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.activeEmployees}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.instructors}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.onLeaveEmployees}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFields
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Filters with Quick Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1">
          <FilterBar
            searchPlaceholder="Search employees..."
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
              {
                key: "gender",
                label: "Gender",
                type: "sync",
                options: [
                  { label: "All Genders", value: "all" },
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ],
                value: genderFilter,
                onChange: (val) => {
                  setGenderFilter(val);
                  setCurrentPage(1);
                },
              },
              {
                key: "branch",
                label: "Branch",
                type: "async" as const,
                value: branchFilter || "all",
                onChange: (val) => {
                  setBranchFilter(val);
                  setCurrentPage(1);
                },
                onSearch: searchBranchesForFilter,
              },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <ResponsiveTable
        data={employees}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={(item) => navigate(`/employees/${item.id}`)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Quick Add Employee Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Employee"
        description="Fill in the details to register a new employee."
        onSubmit={handleAddEmployee}
        submitLabel="Add Employee"
        isSubmitting={isSubmitting}
      >
        <EmployeeForm formData={formData} setFormData={setFormData} />
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
        <EmployeeForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      {/* Delete Employee */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEmployee?.name}"?
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
              onClick={handleDeleteEmployee}
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
