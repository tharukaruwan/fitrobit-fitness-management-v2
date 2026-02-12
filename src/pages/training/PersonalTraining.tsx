import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Pencil, Trash2, User, Calendar, DollarSign, Clock, Users, Target, CheckCircle2, Eye
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
import { useCurrency } from "@/hooks/useCurrency";

interface PTPackage {
  id: string;
  name: string;
  packageType: "session" | "monthly";
  totalSessions: number;
  sessionsPerMonth?: number;
  validityDays: number;
  price: number;
  trainerId: string;
  trainerName: string;
  categoryId?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface MemberPT {
  id: string;
  memberId: string;
  memberName: string;
  packageId: string;
  packageName: string;
  trainerId: string;
  trainerName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
}

const mockTrainers = [
  { id: "t1", name: "John Smith" },
  { id: "t2", name: "Sarah Johnson" },
  { id: "t3", name: "Mike Chen" },
  { id: "t4", name: "Emily Davis" },
];

const mockPackages: PTPackage[] = [
  { id: "p1", name: "Starter Pack", packageType: "session", totalSessions: 10, validityDays: 60, price: 250, trainerId: "t1", trainerName: "John Smith", status: "active", createdAt: "2024-01-15" },
  { id: "p2", name: "Pro Pack", packageType: "session", totalSessions: 20, validityDays: 90, price: 450, trainerId: "t2", trainerName: "Sarah Johnson", status: "active", createdAt: "2024-01-10" },
  { id: "p3", name: "Monthly Basic", packageType: "monthly", totalSessions: 8, sessionsPerMonth: 8, validityDays: 30, price: 200, trainerId: "t3", trainerName: "Mike Chen", status: "active", createdAt: "2024-01-08" },
  { id: "p4", name: "Monthly Premium", packageType: "monthly", totalSessions: 12, sessionsPerMonth: 12, validityDays: 30, price: 300, trainerId: "t1", trainerName: "John Smith", status: "active", createdAt: "2024-01-05" },
  { id: "p5", name: "Elite Pack", packageType: "session", totalSessions: 50, validityDays: 180, price: 1000, trainerId: "t4", trainerName: "Emily Davis", status: "active", createdAt: "2024-01-02" },
];

const mockMemberPTs: MemberPT[] = [
  { id: "mp1", memberId: "m1", memberName: "Alice Brown", packageId: "p1", packageName: "Starter Pack", trainerId: "t1", trainerName: "John Smith", totalSessions: 10, usedSessions: 6, remainingSessions: 4, startDate: "2024-01-20", expiryDate: "2024-03-20", status: "active" },
  { id: "mp2", memberId: "m2", memberName: "Bob Wilson", packageId: "p2", packageName: "Pro Pack", trainerId: "t2", trainerName: "Sarah Johnson", totalSessions: 20, usedSessions: 20, remainingSessions: 0, startDate: "2024-01-10", expiryDate: "2024-04-10", status: "completed" },
  { id: "mp3", memberId: "m3", memberName: "Carol Davis", packageId: "p3", packageName: "Monthly Basic", trainerId: "t3", trainerName: "Mike Chen", totalSessions: 8, usedSessions: 3, remainingSessions: 5, startDate: "2024-02-01", expiryDate: "2024-03-01", status: "active" },
  { id: "mp4", memberId: "m4", memberName: "David Lee", packageId: "p4", packageName: "Monthly Premium", trainerId: "t1", trainerName: "John Smith", totalSessions: 12, usedSessions: 12, remainingSessions: 0, startDate: "2024-01-15", expiryDate: "2024-02-15", status: "expired" },
];

const PersonalTraining = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<"packages" | "members" | "trainers">("packages");
  const [packages, setPackages] = useState<PTPackage[]>(mockPackages);
  const [memberPTs, setMemberPTs] = useState<MemberPT[]>(mockMemberPTs);
  
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  const [isDeletePackageOpen, setIsDeletePackageOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRecordSessionOpen, setIsRecordSessionOpen] = useState(false);
  
  const [selectedPackage, setSelectedPackage] = useState<PTPackage | null>(null);
  const [selectedMemberPT, setSelectedMemberPT] = useState<MemberPT | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");
  
  const [packageForm, setPackageForm] = useState({
    name: "",
    packageType: "session" as "session" | "monthly",
    totalSessions: 10,
    sessionsPerMonth: 8,
    validityDays: 60,
    price: 0,
    trainerId: "",
    status: "active" as "active" | "inactive",
  });

  const [assignForm, setAssignForm] = useState({
    memberId: "",
    memberName: "",
    packageId: "",
    startDate: new Date().toISOString().split('T')[0],
  });

  // Package table data
  const { 
    searchQuery: packageSearch, 
    handleSearch: handlePackageSearch, 
    paginatedData: paginatedPackages, 
    currentPage: packagePage, 
    handlePageChange: handlePackagePage, 
    totalPages: packageTotalPages 
  } = useTableData({
    data: packages.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (trainerFilter !== "all" && p.trainerId !== trainerFilter) return false;
      return true;
    }),
    itemsPerPage: 8,
    searchFields: ["name", "trainerName"],
  });

  // Member PT table data
  const { 
    searchQuery: memberSearch, 
    handleSearch: handleMemberSearch, 
    paginatedData: paginatedMemberPTs, 
    currentPage: memberPage, 
    handlePageChange: handleMemberPage, 
    totalPages: memberTotalPages 
  } = useTableData({
    data: memberPTs.filter(mp => {
      if (statusFilter !== "all" && mp.status !== statusFilter) return false;
      if (trainerFilter !== "all" && mp.trainerId !== trainerFilter) return false;
      return true;
    }),
    itemsPerPage: 8,
    searchFields: ["memberName", "packageName", "trainerName"],
  });

  // Trainer stats
  const trainerStats = mockTrainers.map(trainer => {
    const activeClients = memberPTs.filter(mp => mp.trainerId === trainer.id && mp.status === "active").length;
    const totalSessions = memberPTs.filter(mp => mp.trainerId === trainer.id).reduce((acc, mp) => acc + mp.usedSessions, 0);
    const assignedPackages = packages.filter(p => p.trainerId === trainer.id).length;
    return { ...trainer, activeClients, totalSessions, assignedPackages };
  });

  // Package columns
  const packageColumns: Column<PTPackage>[] = [
    { 
      key: "name", 
      label: "Package Name", 
      priority: "always",
      render: (_, pkg) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{pkg.name}</p>
            <Badge variant="outline" className="text-xs mt-0.5">
              {pkg.packageType === "session" ? "Session-based" : "Monthly"}
            </Badge>
          </div>
        </div>
      ),
    },
    { 
      key: "totalSessions", 
      label: "Sessions", 
      priority: "md",
      render: (value, pkg) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{value} {pkg.packageType === "monthly" ? `/ month` : "total"}</span>
        </div>
      ),
    },
    { 
      key: "trainerName", 
      label: "Trainer", 
      priority: "lg",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    { 
      key: "validityDays", 
      label: "Validity", 
      priority: "lg",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{value} days</span>
        </div>
      ),
    },
    { 
      key: "price", 
      label: "Price", 
      priority: "md",
      render: (value) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{formatCurrency(value)}</span>
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
  ];

  // Member PT columns
  const memberPTColumns: Column<MemberPT>[] = [
    { 
      key: "memberName", 
      label: "Member", 
      priority: "always",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    { 
      key: "packageName", 
      label: "Package", 
      priority: "md",
      render: (value) => <span>{value}</span>,
    },
    { 
      key: "trainerName", 
      label: "Trainer", 
      priority: "lg",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    { 
      key: "remainingSessions", 
      label: "Sessions", 
      priority: "always",
      render: (_, mp) => {
        const progress = (mp.usedSessions / mp.totalSessions) * 100;
        return (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex justify-between text-xs">
              <span>{mp.usedSessions} used</span>
              <span>{mp.remainingSessions} left</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      },
    },
    { 
      key: "expiryDate", 
      label: "Expires", 
      priority: "lg",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    { 
      key: "status", 
      label: "Status", 
      priority: "md",
      render: (value) => (
        <Badge variant={value === "active" ? "default" : value === "completed" ? "outline" : "secondary"}>
          {value}
        </Badge>
      ),
    },
  ];

  const packageActions: RowAction<PTPackage>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (pkg) => navigate(`/training/personal/${pkg.id}`),
      variant: "primary",
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: (pkg) => openEditPackage(pkg),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (pkg) => {
        setSelectedPackage(pkg);
        setIsDeletePackageOpen(true);
      },
      variant: "danger",
    },
  ];

  const memberPTActions: RowAction<MemberPT>[] = [
    {
      label: "Record Session",
      icon: CheckCircle2,
      onClick: (mp) => {
        if (mp.remainingSessions <= 0) {
          toast.error("No remaining sessions");
          return;
        }
        setSelectedMemberPT(mp);
        setIsRecordSessionOpen(true);
      },
    },
  ];

  const handleAddPackage = () => {
    const trainer = mockTrainers.find(t => t.id === packageForm.trainerId);
    const newPackage: PTPackage = {
      id: Date.now().toString(),
      name: packageForm.name,
      packageType: packageForm.packageType,
      totalSessions: packageForm.packageType === "monthly" ? packageForm.sessionsPerMonth : packageForm.totalSessions,
      sessionsPerMonth: packageForm.packageType === "monthly" ? packageForm.sessionsPerMonth : undefined,
      validityDays: packageForm.validityDays,
      price: packageForm.price,
      trainerId: packageForm.trainerId,
      trainerName: trainer?.name || "",
      status: packageForm.status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPackages([...packages, newPackage]);
    toast.success("Package created successfully");
    setIsAddPackageOpen(false);
    resetPackageForm();
  };

  const handleEditPackage = () => {
    if (!selectedPackage) return;
    const trainer = mockTrainers.find(t => t.id === packageForm.trainerId);
    setPackages(packages.map(p => 
      p.id === selectedPackage.id 
        ? { 
            ...p, 
            name: packageForm.name,
            packageType: packageForm.packageType,
            totalSessions: packageForm.packageType === "monthly" ? packageForm.sessionsPerMonth : packageForm.totalSessions,
            sessionsPerMonth: packageForm.packageType === "monthly" ? packageForm.sessionsPerMonth : undefined,
            validityDays: packageForm.validityDays,
            price: packageForm.price,
            trainerId: packageForm.trainerId,
            trainerName: trainer?.name || "",
            status: packageForm.status,
          }
        : p
    ));
    toast.success("Package updated successfully");
    setIsEditPackageOpen(false);
    resetPackageForm();
  };

  const handleDeletePackage = () => {
    if (!selectedPackage) return;
    setPackages(packages.filter(p => p.id !== selectedPackage.id));
    toast.success("Package deleted successfully");
    setIsDeletePackageOpen(false);
    setSelectedPackage(null);
  };

  const handleAssignPackage = () => {
    const pkg = packages.find(p => p.id === assignForm.packageId);
    if (!pkg) return;
    
    const expiryDate = new Date(assignForm.startDate);
    expiryDate.setDate(expiryDate.getDate() + pkg.validityDays);
    
    const newMemberPT: MemberPT = {
      id: Date.now().toString(),
      memberId: assignForm.memberId,
      memberName: assignForm.memberName,
      packageId: pkg.id,
      packageName: pkg.name,
      trainerId: pkg.trainerId,
      trainerName: pkg.trainerName,
      totalSessions: pkg.totalSessions,
      usedSessions: 0,
      remainingSessions: pkg.totalSessions,
      startDate: assignForm.startDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: "active",
    };
    setMemberPTs([...memberPTs, newMemberPT]);
    toast.success("Package assigned to member");
    setIsAssignOpen(false);
    setAssignForm({ memberId: "", memberName: "", packageId: "", startDate: new Date().toISOString().split('T')[0] });
  };

  const handleRecordSession = () => {
    if (!selectedMemberPT) return;
    setMemberPTs(memberPTs.map(mp => {
      if (mp.id === selectedMemberPT.id) {
        const newUsed = mp.usedSessions + 1;
        const newRemaining = mp.remainingSessions - 1;
        return {
          ...mp,
          usedSessions: newUsed,
          remainingSessions: newRemaining,
          status: newRemaining === 0 ? "completed" : mp.status,
        };
      }
      return mp;
    }));
    toast.success("Session recorded successfully");
    setIsRecordSessionOpen(false);
    setSelectedMemberPT(null);
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: "",
      packageType: "session",
      totalSessions: 10,
      sessionsPerMonth: 8,
      validityDays: 60,
      price: 0,
      trainerId: "",
      status: "active",
    });
    setSelectedPackage(null);
  };

  const openEditPackage = (pkg: PTPackage) => {
    setSelectedPackage(pkg);
    setPackageForm({
      name: pkg.name,
      packageType: pkg.packageType,
      totalSessions: pkg.totalSessions,
      sessionsPerMonth: pkg.sessionsPerMonth || 8,
      validityDays: pkg.validityDays,
      price: pkg.price,
      trainerId: pkg.trainerId,
      status: pkg.status,
    });
    setIsEditPackageOpen(true);
  };

  const PackageForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Package Name *</Label>
        <Input
          id="name"
          value={packageForm.name}
          onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
          placeholder="e.g., Starter Pack"
          className="mt-1.5"
        />
      </div>
      
      <div>
        <Label>Package Type *</Label>
        <div className="flex gap-2 mt-1.5">
          <Button
            type="button"
            variant={packageForm.packageType === "session" ? "default" : "outline"}
            size="sm"
            onClick={() => setPackageForm({ ...packageForm, packageType: "session" })}
          >
            Session-based
          </Button>
          <Button
            type="button"
            variant={packageForm.packageType === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPackageForm({ ...packageForm, packageType: "monthly" })}
          >
            Monthly
          </Button>
        </div>
      </div>

      {packageForm.packageType === "session" ? (
        <div>
          <Label htmlFor="totalSessions">Total Sessions *</Label>
          <Input
            id="totalSessions"
            type="number"
            value={packageForm.totalSessions}
            onChange={(e) => setPackageForm({ ...packageForm, totalSessions: parseInt(e.target.value) || 0 })}
            className="mt-1.5"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="sessionsPerMonth">Sessions per Month *</Label>
          <Input
            id="sessionsPerMonth"
            type="number"
            value={packageForm.sessionsPerMonth}
            onChange={(e) => setPackageForm({ ...packageForm, sessionsPerMonth: parseInt(e.target.value) || 0 })}
            className="mt-1.5"
          />
        </div>
      )}

      <div>
        <Label htmlFor="validityDays">Validity (Days) *</Label>
        <Input
          id="validityDays"
          type="number"
          value={packageForm.validityDays}
          onChange={(e) => setPackageForm({ ...packageForm, validityDays: parseInt(e.target.value) || 0 })}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          value={packageForm.price}
          onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) || 0 })}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="trainer">Assign Trainer *</Label>
        <Select 
          value={packageForm.trainerId} 
          onValueChange={(value) => setPackageForm({ ...packageForm, trainerId: value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select trainer" />
          </SelectTrigger>
          <SelectContent>
            {mockTrainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>{trainer.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <div className="flex gap-2 mt-1.5">
          <Button
            type="button"
            variant={packageForm.status === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setPackageForm({ ...packageForm, status: "active" })}
          >
            Active
          </Button>
          <Button
            type="button"
            variant={packageForm.status === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setPackageForm({ ...packageForm, status: "inactive" })}
          >
            Inactive
          </Button>
        </div>
      </div>
    </div>
  );

  const AssignForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="memberName">Member Name *</Label>
        <Input
          id="memberName"
          value={assignForm.memberName}
          onChange={(e) => setAssignForm({ ...assignForm, memberName: e.target.value, memberId: `m-${Date.now()}` })}
          placeholder="Enter member name"
          className="mt-1.5"
        />
      </div>
      
      <div>
        <Label htmlFor="package">Select Package *</Label>
        <Select 
          value={assignForm.packageId} 
          onValueChange={(value) => setAssignForm({ ...assignForm, packageId: value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select package" />
          </SelectTrigger>
          <SelectContent>
            {packages.filter(p => p.status === "active").map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name} - {formatCurrency(pkg.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="startDate">Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          value={assignForm.startDate}
          onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
          className="mt-1.5"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personal Training</h1>
          <p className="text-muted-foreground">Manage PT packages, member sessions, and trainer assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Assign to Member
          </Button>
          <Button onClick={() => setIsAddPackageOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Package
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "packages" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Packages
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "members" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Member Sessions
        </button>
        <button
          onClick={() => setActiveTab("trainers")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "trainers" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Trainer Stats
        </button>
      </div>

      {/* Packages Tab */}
      {activeTab === "packages" && (
        <>
          <FilterBar
            searchValue={packageSearch}
            onSearchChange={handlePackageSearch}
            searchPlaceholder="Search packages..."
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
              {
                key: "trainer",
                label: "Trainer",
                type: "sync",
                options: [
                  { label: "All Trainers", value: "all" },
                  ...mockTrainers.map(t => ({ label: t.name, value: t.id })),
                ],
                value: trainerFilter,
                onChange: setTrainerFilter,
              },
            ]}
          />

          <ResponsiveTable<PTPackage>
            columns={packageColumns}
            data={paginatedPackages}
            keyExtractor={(pkg) => pkg.id}
            rowActions={packageActions}
            pagination={{
              currentPage: packagePage,
              totalPages: packageTotalPages,
              totalItems: packages.length,
              itemsPerPage: 8,
              onPageChange: handlePackagePage,
            }}
          />
        </>
      )}

      {/* Member Sessions Tab */}
      {activeTab === "members" && (
        <>
          <FilterBar
            searchValue={memberSearch}
            onSearchChange={handleMemberSearch}
            searchPlaceholder="Search members..."
            filters={[
              {
                key: "status",
                label: "Status",
                type: "sync",
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Completed", value: "completed" },
                  { label: "Expired", value: "expired" },
                ],
                value: statusFilter,
                onChange: setStatusFilter,
              },
              {
                key: "trainer",
                label: "Trainer",
                type: "sync",
                options: [
                  { label: "All Trainers", value: "all" },
                  ...mockTrainers.map(t => ({ label: t.name, value: t.id })),
                ],
                value: trainerFilter,
                onChange: setTrainerFilter,
              },
            ]}
          />

          <ResponsiveTable<MemberPT>
            columns={memberPTColumns}
            data={paginatedMemberPTs}
            keyExtractor={(mp) => mp.id}
            rowActions={memberPTActions}
            pagination={{
              currentPage: memberPage,
              totalPages: memberTotalPages,
              totalItems: memberPTs.length,
              itemsPerPage: 8,
              onPageChange: handleMemberPage,
            }}
          />
        </>
      )}

      {/* Trainer Stats Tab */}
      {activeTab === "trainers" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trainerStats.map((trainer) => (
            <div key={trainer.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{trainer.name}</p>
                  <p className="text-xs text-muted-foreground">Personal Trainer</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Clients</span>
                  <span className="font-medium">{trainer.activeClients}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions Completed</span>
                  <span className="font-medium">{trainer.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assigned Packages</span>
                  <span className="font-medium">{trainer.assignedPackages}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Package Sheet */}
      <QuickAddSheet
        open={isAddPackageOpen}
        onOpenChange={setIsAddPackageOpen}
        title="Create PT Package"
        description="Define a new personal training package"
        onSubmit={handleAddPackage}
        submitLabel="Create Package"
      >
        <PackageForm />
      </QuickAddSheet>

      {/* Edit Package Sheet */}
      <QuickAddSheet
        open={isEditPackageOpen}
        onOpenChange={setIsEditPackageOpen}
        title="Edit PT Package"
        description="Update package details"
        onSubmit={handleEditPackage}
        submitLabel="Save Changes"
      >
        <PackageForm />
      </QuickAddSheet>

      {/* Assign to Member Sheet */}
      <QuickAddSheet
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        title="Assign Package to Member"
        description="Assign a PT package to a gym member"
        onSubmit={handleAssignPackage}
        submitLabel="Assign Package"
      >
        <AssignForm />
      </QuickAddSheet>

      {/* Delete Confirmation */}
      <Dialog open={isDeletePackageOpen} onOpenChange={setIsDeletePackageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePackageOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePackage}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Session Confirmation */}
      <Dialog open={isRecordSessionOpen} onOpenChange={setIsRecordSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record PT Session</DialogTitle>
            <DialogDescription>
              Record a session for {selectedMemberPT?.memberName}?
              <br />
              <span className="text-sm mt-2 block">
                Current: {selectedMemberPT?.usedSessions} used / {selectedMemberPT?.remainingSessions} remaining
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordSessionOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordSession}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Record Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalTraining;
