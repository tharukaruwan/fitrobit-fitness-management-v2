import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { Users, UserPlus, UserCheck, UserX, Cake, Plus, Pencil, Eye, CreditCard, Printer, MessageCircle, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";
import Request from "@/lib/api/client";

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
  status: "Active" | "Inactive" | "Lead" | "Paused";
  branchName: string;
  birthday?: string; // Format: "MM-DD"
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
  id: string | number;
  memberId: string;
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
  branch: string;
  birthday?: string; // Format: "MM-DD"
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

const allClasses = [
  "Yoga", "HIIT", "Spin", "Pilates", "CrossFit", "Boxing", "Zumba", "Strength Training", "Swimming", "Kickboxing",
];

const allPTPackages = [
  "Weight Loss", "Muscle Building", "Cardio Fitness", "Flexibility", "Sports Performance", "Rehabilitation", "Body Toning", "Endurance",
];


// Helper to check if today is birthday
const isBirthdayToday = (birthday?: string) => {
  if (!birthday) return false;
  const today = new Date();
  const [month, day] = birthday.split("-").map(Number);
  return today.getMonth() + 1 === month && today.getDate() === day;
};

// Helper to check if birthday is within next 7 days
const isBirthdaySoon = (birthday?: string) => {
  if (!birthday) return false;
  const today = new Date();
  const [month, day] = birthday.split("-").map(Number);
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

  // If birthday passed this year, check next year
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(today.getFullYear() + 1);
  }

  const diffDays = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
};

const ITEMS_PER_PAGE = 8;

const fetchMembers = async (page: number, search: string, status: string, branch: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;
  if (branch && branch !== "all") params["filters[branch]"] = branch;

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
          <p className="text-xs text-muted-foreground">{item.memberId}</p>
        </div>
        {isBirthdayToday(item.birthday) && (
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
        {!isBirthdayToday(item.birthday) && isBirthdaySoon(item.birthday) && (
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
  { key: "email", label: "Email", priority: "lg" },
  { key: "phone", label: "Phone", priority: "xl" },
  {
    key: "membership",
    label: "Plan",
    priority: "md",
    render: (value: string) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${value === "VIP" ? "bg-warning/10 text-warning" : value === "Premium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {value}
      </span>
    ),
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
  { key: "branch", label: "Branch", priority: "xl" },
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
  image: mb.image ? mb.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  email: mb.email ? mb.email : "_",
  phone: mb.phoneNumber ? mb.phoneNumber : "_",
  membership: mb.memberShipName ? (mb.memberShipName.length > 5 ? mb.memberShipName.substring(0, 5) + ".." : mb.memberShipName) : "_",
  classes: mb.classes ? mb.classes : [],
  pt: [],
  joinDate: mb.createdAt ? new Date(mb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "_",
  expiryDate: mb.renewalDay ? new Date(mb.renewalDay).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "_",
  status: mb.status || "Inactive",
  branch: mb.branchName || "_",
  birthday: mb.birthday || "_"
});

export default function Members() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membership: "",
    branch: "",
    birthday: "",
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

  // Row action handlers
  const handleEdit = (member: Member) => {
    toast({ title: "Edit Member", description: `Editing ${member.name}` });
  };

  const handleView = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handlePayment = (member: Member) => {
    toast({ title: "Payment", description: `Processing payment for ${member.name}` });
  };

  const handlePrint = (member: Member) => {
    toast({ title: "Print", description: `Printing details for ${member.name}` });
  };

  const handleWhatsApp = (member: Member) => {
    window.open(`https://wa.me/${member.phone.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (member: Member) => {
    window.open(`mailto:${member.email}`, "_blank");
  };

  const rowActions: RowAction<Member>[] = [
    { icon: Pencil, label: "Edit", onClick: handleEdit, variant: "default" },
    { icon: Eye, label: "View", onClick: handleView, variant: "primary" },
    { icon: CreditCard, label: "Payment", onClick: handlePayment, variant: "default" },
    { icon: Printer, label: "Print", onClick: handlePrint, variant: "default" },
    { icon: MessageCircle, label: "WhatsApp", onClick: handleWhatsApp, variant: "default" },
    { icon: Mail, label: "Email", onClick: handleEmail, variant: "default" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["members-list", currentPage, searchQuery,  statusFilter, branchFilter],
    queryFn: () => fetchMembers(currentPage, searchQuery, statusFilter, branchFilter),
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

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.membership || !formData.branch) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Member Added",
        description: `${formData.name} has been added successfully.`,
      });
      setIsSubmitting(false);
      setIsAddOpen(false);
      setFormData({ name: "", email: "", phone: "", membership: "", branch: "", birthday: "" });
    }, 1000);
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
              { label: "Paused", value: "Pau  sed" },
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
        onSubmit={handleSubmit}
        submitLabel="Add Member"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="membership">Membership Plan <span className="text-destructive">*</span></Label>
            <Select value={formData.membership} onValueChange={(v) => handleInputChange("membership", v)}>
              <SelectTrigger id="membership">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch <span className="text-destructive">*</span></Label>
            <Select value={formData.branch} onValueChange={(v) => handleInputChange("branch", v)}>
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

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday (Optional)</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange("birthday", e.target.value)}
            />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
