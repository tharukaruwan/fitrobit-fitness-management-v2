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
import { subDays } from "date-fns";
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

interface ApiMember {
  _id: string;
  memberId: string;
  name: string;
  image: string;
  email: string;
  phoneNumber: string;
  memberShipName: string;
  classes: string[];
  pt: string[];
  createdAt: string;
  renewalDay: string;
  gender?: "male" | "female" | "other";
  status: "Active" | "Inactive" | "Lead" | "Paused";
  branch: Branch;
  dateOfBirth?: string; // Format: "MM-DD"
}
interface ApiListResponse {
  analytics: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    leadMembers: number;
    pausedMembers: number;
  };
  data: ApiMember[];
  dataCount: number;
  currentPaginationIndex: number;
  dataPerPage: number;
  message: string;
}

interface Member {
  id: string;
  memberId: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  nic?: string;
  remark?: string;
  name: string;
  image: string;
  email: string;
  phone: string;
  membership: string;
  classes: string[];
  pt: string[];
  joinDate: string;
  expiryDate: string;
  status: "Active" | "Inactive" | "Lead" | "Paused";
  branch?: string;
  branchName?: string;
  dateOfBirth?: string; // Format: "MM-DD"
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

const fetchMembers = async (page: number, search: string, status: string, branch: string, gender: string, startDate?: Date, endDate?: Date) => {
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

  const res = await Request.get<ApiListResponse>("/members/list", params);
  return res;
};

const columns: Column<Member>[] = [
  { key: "image", label: "", priority: "always", className: "w-12", render: (value: string, item: Member) => <ImagePreview src={value} alt={item.name} size="md" /> },
  {
    key: "name",
    label: "Member",
    priority: "always",
    render: (value: string, item: Member) => (
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
  { key: "phone", label: "Phone", priority: "xl" },
  {
    key: "membership",
    label: "Plan",
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
          <span className="text-xs text-muted-foreground">—</span>
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
    key: "pt",
    label: "PT",
    priority: "lg",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <>
            {value.slice(0, 2).map((pkg) => (
              <span key={pkg} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/10 text-warning">
                {pkg}
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
  { key: "expiryDate", label: "Expires", priority: "xl" },
  { key: "branchName", label: "Branch", priority: "xl" },
  {
    key: "status",
    label: "Status",
    priority: "always",
    render: (value: "Active" | "Inactive" | "Lead") => (
      <StatusBadge status={value === "Active" ? "success" : value === "Inactive" ? "error" : "warning"} label={value.charAt(0).toUpperCase() + value.slice(1)} />
    ),
  },
];

const mapApiMember = (mb: ApiMember): Member => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name,
  gender: mb.gender,
  image: mb.image ? mb.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  email: mb.email ? mb.email : "_",
  phone: mb.phoneNumber ? mb.phoneNumber : "_",
  membership: mb.memberShipName ? (mb.memberShipName.length > 5 ? mb.memberShipName.substring(0, 5) + ".." : mb.memberShipName) : "_",
  classes: mb.classes ? mb.classes : [],
  pt: [],
  joinDate: mb.createdAt ? new Date(mb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "_",
  expiryDate: mb.renewalDay ? new Date(mb.renewalDay).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "_",
  status: mb.status || "Inactive",
  dateOfBirth: mb.dateOfBirth || "",
  branch: mb.branch ? mb.branch._id : "_",
  branchName: mb.branch ? mb.branch.name : "_",
});

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
    memberId: string;
    name: string;
    phoneNumber: string;
    email: string;
    branch: string;
    status: "Active" | "Inactive" | "Lead" | "Paused";
    gender?: "male" | "female" | "other";
    nic?: string;
    remark?: string;
    dateOfBirth?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    memberId: string;
    name: string;
    phoneNumber: string;
    email: string;
    branch: string;
    status: "Active" | "Inactive" | "Lead" | "Paused";
    gender?: "male" | "female" | "other";
    nic?: string;
    remark?: string;
    dateOfBirth?: string;
  }>>;
}

const MemberForm = ({ formData, setFormData }: DeviceFormProps) => {
  // Fetch branches for dropdown
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches-dropdown"],
    queryFn: fetchBranches,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="memberId">Member Id <span className="text-red-500">*</span></Label>
        <Input
          id="memberId"
          value={formData.memberId}
          onChange={(e) => setFormData(prev => ({ ...prev, memberId: e.target.value }))}
          placeholder="e.g., 12345"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="name">Member Name <span className="text-red-500">*</span></Label>
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
        <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as "Active" | "Inactive" | "Lead" | "Paused" }))}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
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
        <Label htmlFor="phoneNumber">Phone No </Label>
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
        <Label htmlFor="branch">Branch </Label>
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
        <Label htmlFor="remark">Remark </Label>
        <Input
          id="remark"
          value={formData.remark}
          onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
          placeholder="e.g., Member is a regular customer"
          className="mt-1.5"
        />
      </div>
    </div>
  );
};

export default function Members() {
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
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<DeviceFormProps["formData"]>({
    memberId: "",
    nic: "",
    name: "",
    phoneNumber: "",
    email: "",
    gender: "other",
    status: "Active",
    branch: "",
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

  const handleView = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleWhatsApp = (member: Member) => {
    window.open(`https://wa.me/${member.phone.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (member: Member) => {
    window.open(`mailto:${member.email}`, "_blank");
  };

  const rowActions: RowAction<Member>[] = [
    { icon: Pencil, label: "Edit", onClick: (mb) => openEditForm(mb), variant: "default" },
    { icon: Eye, label: "View", onClick: handleView, variant: "primary" },
    { icon: MessageCircle, label: "WhatsApp", onClick: handleWhatsApp, variant: "default" },
    { icon: Mail, label: "Email", onClick: handleEmail, variant: "default" },
    { label: "Delete", icon: Trash2, onClick: (member) => { setSelectedMember(member); setIsDeleteOpen(true); }, variant: "danger" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["members-list", currentPage, searchQuery, statusFilter, branchFilter, genderFilter, startDate, endDate],
    queryFn: () => fetchMembers(currentPage, searchQuery, statusFilter, branchFilter, genderFilter, startDate, endDate),
  });

  const members = apiResponse?.data?.map(mapApiMember) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));
  const analytics = apiResponse?.analytics ? {
    totalMembers: apiResponse?.analytics?.totalMembers || 0,
    activeMembers: apiResponse?.analytics?.activeMembers || 0,
    inactiveMembers: apiResponse?.analytics?.inactiveMembers || 0,
    leadMembers: apiResponse?.analytics?.leadMembers || 0,
    pausedMembers: apiResponse?.analytics?.pausedMembers || 0,
  } : { totalMembers: 0, activeMembers: 0, inactiveMembers: 0, leadMembers: 0, pausedMembers: 0 };

  const handleAddMember = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Member name is required");
      return;
    }
    if (!formData.memberId.trim()) {
      toast.error("Member ID is required");
      return;
    }
    if (!formData.gender) {
      toast.error("Member gender is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.post("/members/create", formData);
      toast.success("Member added successfully");
      setIsAddOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Member name is required");
      return;
    }
    if (!formData.memberId.trim()) {
      toast.error("Member ID is required");
      return;
    }
    if (!formData.gender) {
      toast.error("Member gender is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await Request.put(`/members/${selectedMember.id}`, cleanObject(formData));
      toast.success("Member updated successfully");
      setIsEditOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      await Request.delete(`/members/${selectedMember.id}`);
      toast.success("Member deleted successfully");
      setIsDeleteOpen(false);
      setSelectedMember(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete member");
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
      remark: "",
      dateOfBirth: "",
      status: "Active",
    });
    setSelectedMember(null);
  };

  const openEditForm = (mb: Member) => {
    setSelectedMember(mb);
    setFormData({
      name: mb.name,
      memberId: mb.memberId,
      gender: mb.gender || "other",
      branch: mb.branch || "",
      phoneNumber: mb.phoneNumber || "",
      email: mb.email || "",
      nic: mb.nic || "",
      remark: mb.remark || "",
      dateOfBirth: mb.dateOfBirth || "",
      status: mb.status,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">Manage members and their details</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
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
              <p className="text-2xl font-bold text-card-foreground">{analytics.activeMembers}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.leadMembers}</p>
              <p className="text-xs text-muted-foreground">New Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.pausedMembers}</p>
              <p className="text-xs text-muted-foreground">Paused</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{analytics.inactiveMembers}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
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
            searchPlaceholder="Search members..."
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
                  { label: "Lead", value: "Lead" },
                  { label: "Paused", value: "Paused" },
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
        data={members}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        rowActions={rowActions}
        onRowClick={(item) => navigate(`/members/${item.id}`)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Quick Add Member Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Member"
        description="Fill in the details to register a new member."
        onSubmit={handleAddMember}
        submitLabel="Add Member"
        isSubmitting={isSubmitting}
      >
        <MemberForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      {/* Edit Employee Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Member"
        description="Update member details"
        onSubmit={handleEditMember}
        submitLabel="Save Changes"
      >
        <MemberForm formData={formData} setFormData={setFormData} />
      </QuickAddSheet>

      {/* Delete Member */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMember?.name}"?
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
              onClick={handleDeleteMember}
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
