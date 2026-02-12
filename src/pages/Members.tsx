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
  phone: string;
  membership: string;
  classes: string[];
  pt: string[];
  joinDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
  branch: string;
  birthday?: string; // Format: "MM-DD"
}
interface ApiListResponse {
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
  status: "active" | "expired" | "pending";
  branch: string;
  birthday?: string; // Format: "MM-DD"
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

const sampleData: Member[] = [
  { id: 1, memberId: "MEM-001", name: "John Smith", image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150", email: "john.smith@email.com", phone: "+1 234 567 890", membership: "Premium", classes: ["Yoga", "HIIT", "Spin"], pt: ["Weight Loss", "Cardio Fitness"], joinDate: "Jan 15, 2024", expiryDate: "Jan 15, 2025", status: "active", branch: "Downtown", birthday: "12-31" },
  { id: 2, memberId: "MEM-002", name: "Sarah Johnson", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", email: "sarah.j@email.com", phone: "+1 234 567 891", membership: "VIP", classes: ["Pilates", "Zumba"], pt: ["Body Toning"], joinDate: "Mar 20, 2024", expiryDate: "Mar 20, 2025", status: "active", branch: "Downtown", birthday: "01-05" },
  { id: 3, memberId: "MEM-003", name: "Mike Davis", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", email: "mike.d@email.com", phone: "+1 234 567 892", membership: "Standard", classes: ["CrossFit", "Boxing"], pt: ["Muscle Building", "Sports Performance"], joinDate: "Feb 10, 2024", expiryDate: "Feb 10, 2025", status: "active", branch: "Westside" },
  { id: 4, memberId: "MEM-004", name: "Emily Chen", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", email: "emily.c@email.com", phone: "+1 234 567 893", membership: "Premium", classes: ["Yoga", "Pilates", "Swimming"], pt: ["Flexibility"], joinDate: "Dec 5, 2023", expiryDate: "Dec 5, 2024", status: "expired", branch: "Downtown" },
  { id: 5, memberId: "MEM-005", name: "David Wilson", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", email: "david.w@email.com", phone: "+1 234 567 894", membership: "Standard", classes: ["HIIT"], pt: [], joinDate: "Nov 28, 2024", expiryDate: "Nov 28, 2025", status: "pending", branch: "Eastside", birthday: "01-02" },
  { id: 6, memberId: "MEM-006", name: "Lisa Brown", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", email: "lisa.b@email.com", phone: "+1 234 567 895", membership: "VIP", classes: ["Spin", "Zumba", "Kickboxing", "Strength Training"], pt: ["Weight Loss", "Endurance"], joinDate: "Aug 12, 2024", expiryDate: "Aug 12, 2025", status: "active", branch: "Downtown" },
  { id: 7, memberId: "MEM-007", name: "James Taylor", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", email: "james.t@email.com", phone: "+1 234 567 896", membership: "Premium", classes: ["CrossFit", "Boxing", "HIIT"], pt: ["Muscle Building"], joinDate: "Oct 3, 2024", expiryDate: "Oct 3, 2025", status: "active", branch: "Westside" },
  { id: 8, memberId: "MEM-008", name: "Anna Martinez", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", email: "anna.m@email.com", phone: "+1 234 567 897", membership: "Standard", classes: ["Yoga", "Swimming"], pt: ["Rehabilitation"], joinDate: "Sep 15, 2024", expiryDate: "Sep 15, 2025", status: "active", branch: "Eastside" },
  { id: 9, memberId: "MEM-009", name: "Robert Lee", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", email: "robert.l@email.com", phone: "+1 234 567 898", membership: "VIP", classes: ["Pilates", "Strength Training"], pt: ["Cardio Fitness", "Body Toning"], joinDate: "Jul 22, 2024", expiryDate: "Jul 22, 2025", status: "active", branch: "Downtown" },
  { id: 10, memberId: "MEM-010", name: "Jessica White", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150", email: "jessica.w@email.com", phone: "+1 234 567 899", membership: "Premium", classes: ["Zumba", "Spin"], pt: ["Flexibility", "Endurance"], joinDate: "Jun 8, 2024", expiryDate: "Jun 8, 2025", status: "active", branch: "Westside" },
  { id: 11, memberId: "MEM-011", name: "Chris Anderson", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150", email: "chris.a@email.com", phone: "+1 234 567 900", membership: "Standard", classes: ["Boxing"], pt: [], joinDate: "May 1, 2024", expiryDate: "May 1, 2025", status: "expired", branch: "Downtown" },
  { id: 12, memberId: "MEM-012", name: "Michelle Garcia", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150", email: "michelle.g@email.com", phone: "+1 234 567 901", membership: "Premium", classes: ["Yoga", "HIIT", "Kickboxing"], pt: ["Sports Performance"], joinDate: "Apr 20, 2024", expiryDate: "Apr 20, 2025", status: "active", branch: "Eastside" },
];

const ITEMS_PER_PAGE = 8;

const fetchMembers = async (page: number, search: string, status: string) => {
  const params: Record<string, unknown> = {
    currentPageIndex: page,
    dataPerPage: ITEMS_PER_PAGE,
  };
  if (search) params.search = search;
  if (status && status !== "all") params["filters[status]"] = status;

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
    render: (value: "active" | "expired" | "pending") => (
      <StatusBadge status={value === "active" ? "success" : value === "expired" ? "error" : "warning"} label={value.charAt(0).toUpperCase() + value.slice(1)} />
    ),
  },
];

const mapApiMember = (mb: ApiMember): Member => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name,
  image: mb.image,
  email: mb.email,
  phone: "+1 234 567 890",
  membership: "Premium",
  classes: ["Yoga", "HIIT", "Spin"],
  pt: ["Weight Loss", "Cardio Fitness"],
  joinDate: "Jan 15, 2024",
  expiryDate: "Jan 15, 2025",
  status: "active",
  branch: "Downtown",
  birthday: "12-31"
});

export default function Members() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const { paginatedData, searchQuery: sampleSearchQuery, handleSearch: sampleHandleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["name", "memberId", "email"],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["members-list", currentPage, searchQuery, statusFilter],
    queryFn: () => fetchMembers(currentPage, searchQuery, statusFilter),
  });

  const members = apiResponse?.data?.map(mapApiMember) ?? [];
  const totalItems = apiResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / (apiResponse?.dataPerPage || ITEMS_PER_PAGE)));

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
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1,248</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1,156</p>
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
              <p className="text-2xl font-bold text-card-foreground">23</p>
              <p className="text-xs text-muted-foreground">New This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">69</p>
              <p className="text-xs text-muted-foreground">Expired</p>
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
                value: filters.status || "all",
                onChange: (v) => handleFilter("status", v),
                options: [
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                  { value: "pending", label: "Pending" },
                ],
              },
              {
                key: "membership",
                label: "Plan",
                value: filters.membership || "all",
                onChange: (v) => handleFilter("membership", v),
                options: [
                  { value: "VIP", label: "VIP" },
                  { value: "Premium", label: "Premium" },
                  { value: "Standard", label: "Standard" },
                ],
              },
              {
                key: "classes",
                label: "Class",
                value: filters.classes || "all",
                onChange: (v) => handleFilter("classes", v),
                type: "async" as const,
                onSearch: async (query: string) => {
                  await new Promise((r) => setTimeout(r, 300));
                  return [
                    { value: "all", label: "All Classes" },
                    ...allClasses
                      .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
                      .map((c) => ({ value: c, label: c })),
                  ];
                },
              },
              {
                key: "pt",
                label: "PT Package",
                value: filters.pt || "all",
                onChange: (v) => handleFilter("pt", v),
                type: "async" as const,
                onSearch: async (query: string) => {
                  await new Promise((r) => setTimeout(r, 300));
                  return [
                    { value: "all", label: "All PT Packages" },
                    ...allPTPackages
                      .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
                      .map((p) => ({ value: p, label: p })),
                  ];
                },
              },
              {
                key: "branch",
                label: "Branch",
                value: filters.branch || "all",
                onChange: (v) => handleFilter("branch", v),
                options: [
                  { value: "Downtown", label: "Downtown" },
                  { value: "Westside", label: "Westside" },
                  { value: "Eastside", label: "Eastside" },
                ],
              },
            ]}
          />
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Table */}
      <ResponsiveTable
        data={members}
        columns={columns}
        keyExtractor={(item) => item.id}
        // pagination={paginationProps}
        isLoading={isLoading}
        rowActions={rowActions}
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
