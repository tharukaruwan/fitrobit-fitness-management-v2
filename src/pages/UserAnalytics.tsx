import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserMinus,
  UserPlus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings2,
  ChevronRight,
  Filter,
  Building2,
  CreditCard,
  Clock,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { format, subDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, eachWeekOfInterval, eachMonthOfInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Branch data
const branches = [
  { id: "all", name: "All Branches" },
  { id: "main", name: "Main Street" },
  { id: "downtown", name: "Downtown Center" },
  { id: "west", name: "West End" },
];

// Membership types
const membershipTypes = [
  { id: "all", name: "All Types" },
  { id: "premium", name: "Premium" },
  { id: "standard", name: "Standard" },
  { id: "basic", name: "Basic" },
];

// Classes
const classes = [
  { id: "all", name: "All Classes" },
  { id: "yoga", name: "Yoga" },
  { id: "hiit", name: "HIIT" },
  { id: "spinning", name: "Spinning" },
  { id: "crossfit", name: "CrossFit" },
];

// Generate mock enrollment data with full date info
const generateEnrollmentData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "MMM d"),
      fullDate: format(date, "yyyy-MM-dd"),
      dateObj: date,
      enrollments: Math.floor(Math.random() * 15) + 5,
      dropouts: Math.floor(Math.random() * 8) + 2,
    });
  }
  return data;
};

// Generate at-risk members
const generateAtRiskMembers = () => {
  const names = [
    "John Smith", "Emma Wilson", "James Brown", "Sarah Johnson", "Mike Chen",
    "Lisa Park", "Anna Lee", "David Kim", "Jessica Taylor", "Robert Garcia",
    "Jennifer Martinez", "Michael Davis", "Ashley Anderson", "Chris Wilson", "Amanda Thomas",
  ];
  const reasons = [
    { text: "No attendance for 21 days", severity: "high" },
    { text: "Payment overdue by 15 days", severity: "high" },
    { text: "Declining attendance (3 visits in 30 days)", severity: "medium" },
    { text: "Last visit was 18 days ago", severity: "medium" },
    { text: "Missed 2 scheduled classes", severity: "low" },
    { text: "Reduced class participation", severity: "low" },
  ];
  const membershipTypes = ["Premium", "Standard", "Basic"];
  const branches = ["Main Street", "Downtown Center", "West End"];

  return names.map((name, i) => {
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const riskLevel = reason.severity as "low" | "medium" | "high";
    const lastAttendance = subDays(new Date(), Math.floor(Math.random() * 30) + 7);
    const lastPayment = subDays(new Date(), Math.floor(Math.random() * 45));
    
    return {
      id: `member-${i}`,
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
      membershipType: membershipTypes[Math.floor(Math.random() * membershipTypes.length)],
      branch: branches[Math.floor(Math.random() * branches.length)],
      riskLevel,
      primaryReason: reason.text,
      lastAttendance: format(lastAttendance, "MMM d, yyyy"),
      lastPayment: format(lastPayment, "MMM d, yyyy"),
      daysInactive: differenceInDays(new Date(), lastAttendance),
      membershipStatus: Math.random() > 0.3 ? "Active" : "Expired",
    };
  }).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.riskLevel] - order[b.riskLevel];
  });
};

// Generate dropped members
const generateDroppedMembers = () => {
  const names = [
    "Alex Turner", "Emily Clark", "Ryan Hughes", "Sophie Brown", "Daniel Lee",
    "Olivia Miller", "Ethan Davis", "Mia Johnson", "Noah Garcia", "Isabella Martinez",
  ];
  const reasons = [
    "No attendance for 45 days",
    "Membership expired (30+ days)",
    "Payment overdue by 60 days",
    "No class attendance after enrollment",
  ];

  return names.map((name, i) => ({
    id: `dropped-${i}`,
    name,
    droppedDate: format(subDays(new Date(), Math.floor(Math.random() * 30) + 10), "MMM d, yyyy"),
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    membershipType: ["Premium", "Standard", "Basic"][Math.floor(Math.random() * 3)],
    branch: ["Main Street", "Downtown Center", "West End"][Math.floor(Math.random() * 3)],
    lastAttendance: format(subDays(new Date(), Math.floor(Math.random() * 60) + 45), "MMM d, yyyy"),
    lastPayment: format(subDays(new Date(), Math.floor(Math.random() * 90) + 30), "MMM d, yyyy"),
  }));
};

// Pie chart colors
const COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function UserAnalytics() {
  const navigate = useNavigate();
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMembership, setSelectedMembership] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Dropout configuration
  const [dropoutConfig, setDropoutConfig] = useState({
    noAttendanceDays: 30,
    membershipExpiredDays: 14,
    paymentOverdueDays: 30,
    noClassAttendance: true,
    useAndLogic: false,
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Member detail modal
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  // Raw Data
  const rawEnrollmentData = useMemo(() => generateEnrollmentData(), []);
  
  // Aggregate data based on granularity
  const enrollmentData = useMemo(() => {
    if (granularity === "daily") return rawEnrollmentData;

    const aggregateData = (items: typeof rawEnrollmentData) => ({
      enrollments: items.reduce((sum, d) => sum + d.enrollments, 0),
      dropouts: items.reduce((sum, d) => sum + d.dropouts, 0),
    });

    if (granularity === "weekly") {
      const weeks: Record<string, typeof rawEnrollmentData> = {};
      rawEnrollmentData.forEach(d => {
        const weekStart = format(startOfWeek(d.dateObj, { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weeks[weekStart]) weeks[weekStart] = [];
        weeks[weekStart].push(d);
      });
      return Object.entries(weeks).map(([weekStart, items]) => {
        const agg = aggregateData(items);
        const weekEnd = format(endOfWeek(parseISO(weekStart), { weekStartsOn: 1 }), "MMM d");
        return {
          date: `${format(parseISO(weekStart), "MMM d")} - ${weekEnd}`,
          fullDate: weekStart,
          dateObj: parseISO(weekStart),
          ...agg,
        };
      });
    }

    if (granularity === "monthly") {
      const months: Record<string, typeof rawEnrollmentData> = {};
      rawEnrollmentData.forEach(d => {
        const monthKey = format(d.dateObj, "yyyy-MM");
        if (!months[monthKey]) months[monthKey] = [];
        months[monthKey].push(d);
      });
      return Object.entries(months).map(([monthKey, items]) => {
        const agg = aggregateData(items);
        return {
          date: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
          fullDate: `${monthKey}-01`,
          dateObj: parseISO(`${monthKey}-01`),
          ...agg,
        };
      });
    }

    return rawEnrollmentData;
  }, [rawEnrollmentData, granularity]);

  const atRiskMembers = useMemo(() => generateAtRiskMembers(), []);
  const droppedMembers = useMemo(() => generateDroppedMembers(), []);
  
  // Stats
  const stats = useMemo(() => {
    const totalEnrollments = enrollmentData.reduce((acc, d) => acc + d.enrollments, 0);
    const totalDropouts = enrollmentData.reduce((acc, d) => acc + d.dropouts, 0);
    const dropoutRatio = Math.round((totalDropouts / (totalEnrollments + totalDropouts)) * 100);
    const activeMembers = 1247;
    const atRiskCount = atRiskMembers.filter(m => m.riskLevel === "high" || m.riskLevel === "medium").length;
    
    return {
      totalEnrollments,
      totalDropouts,
      dropoutRatio,
      activeMembers,
      atRiskCount,
      retentionRate: 100 - dropoutRatio,
    };
  }, [enrollmentData, atRiskMembers]);
  
  // Risk distribution for pie chart
  const riskDistribution = useMemo(() => [
    { name: "Active", value: stats.activeMembers - atRiskMembers.length, color: "hsl(var(--success))" },
    { name: "At Risk", value: atRiskMembers.filter(m => m.riskLevel !== "high").length, color: "hsl(var(--warning))" },
    { name: "High Risk", value: atRiskMembers.filter(m => m.riskLevel === "high").length, color: "hsl(var(--destructive))" },
  ], [stats.activeMembers, atRiskMembers]);
  
  // Branch comparison data
  const branchComparison = useMemo(() => [
    { branch: "Main Street", enrollments: 45, dropouts: 12, atRisk: 8 },
    { branch: "Downtown", enrollments: 38, dropouts: 15, atRisk: 11 },
    { branch: "West End", enrollments: 28, dropouts: 8, atRisk: 5 },
  ], []);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "low":
        return <Badge variant="secondary">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              User Analytics & Retention
            </h1>
            <p className="text-sm text-muted-foreground">
              Track enrollments, identify dropouts, and prevent churn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Dropout Rules
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>
          
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[150px]">
              <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMembership} onValueChange={setSelectedMembership}>
            <SelectTrigger className="w-[150px]">
              <CreditCard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Membership" />
            </SelectTrigger>
            <SelectContent>
              {membershipTypes.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[140px]">
              <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangeFields
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Members</p>
              <p className="text-xl font-bold text-foreground">{stats.activeMembers.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <UserPlus className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New Enrollments</p>
              <p className="text-xl font-bold text-foreground">{stats.totalEnrollments}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <UserMinus className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dropouts</p>
              <p className="text-xl font-bold text-foreground">{stats.totalDropouts}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">At Risk</p>
              <p className="text-xl font-bold text-foreground">{stats.atRiskCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retention Rate</p>
              <p className="text-xl font-bold text-foreground">{stats.retentionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk</TabsTrigger>
          <TabsTrigger value="dropouts">Dropouts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Enrollment vs Dropout Trend */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Enrollment vs Dropout Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDropout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    name="New Enrollments"
                    stroke="hsl(var(--success))"
                    fill="url(#colorEnroll)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="dropouts"
                    name="Dropouts"
                    stroke="hsl(var(--destructive))"
                    fill="url(#colorDropout)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* X-Axis Frequency Controls */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border mt-4">
              <span className="text-xs text-muted-foreground mr-2">X-Axis Interval:</span>
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {(["daily", "weekly", "monthly"] as const).map((g) => (
                  <Button
                    key={g}
                    variant={granularity === g ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setGranularity(g)}
                    className={cn(
                      "h-7 px-3 text-xs capitalize",
                      granularity === g && "shadow-sm"
                    )}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Distribution */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Member Health Distribution
              </h3>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Branch Comparison */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Branch Comparison
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="branch" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="enrollments" name="Enrollments" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dropouts" name="Dropouts" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="atRisk" name="At Risk" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Quick Answers Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Are we losing members?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.dropoutRatio > 15 
                      ? `Yes, ${stats.dropoutRatio}% dropout rate is concerning` 
                      : `Dropout rate is ${stats.dropoutRatio}%, within healthy range`}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Why are we losing them?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Top reason: No attendance for 30+ days (68%)
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Who might leave next?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {atRiskMembers.filter(m => m.riskLevel === "high").length} members at high risk
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Problem areas?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Downtown Center has highest dropout rate (28%)
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* At Risk Tab */}
        <TabsContent value="at-risk" className="space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Members Likely to Drop Out</h3>
                <p className="text-sm text-muted-foreground">Based on your configured dropout rules</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {atRiskMembers.length} members
              </Badge>
            </div>
            
            <div className="space-y-3">
              {atRiskMembers.slice(0, 10).map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="w-full flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      member.riskLevel === "high" ? "bg-destructive/10" :
                      member.riskLevel === "medium" ? "bg-warning/10" : "bg-muted"
                    )}>
                      <Users className={cn(
                        "h-5 w-5",
                        member.riskLevel === "high" ? "text-destructive" :
                        member.riskLevel === "medium" ? "text-warning" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.primaryReason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRiskBadge(member.riskLevel)}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Dropouts Tab */}
        <TabsContent value="dropouts" className="space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Identified Dropouts</h3>
                <p className="text-sm text-muted-foreground">Members classified as dropped based on your rules</p>
              </div>
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {droppedMembers.length} dropouts
              </Badge>
            </div>
            
            <div className="space-y-3">
              {droppedMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="w-full flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20 hover:bg-destructive/10 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <UserMinus className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Dropped {member.droppedDate}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Top Dropout Reasons
              </h3>
              <div className="space-y-4">
                {[
                  { reason: "No attendance for 30+ days", percentage: 68, count: 34 },
                  { reason: "Payment overdue", percentage: 22, count: 11 },
                  { reason: "Membership expired", percentage: 18, count: 9 },
                  { reason: "No class participation", percentage: 12, count: 6 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{item.reason}</span>
                      <span className="text-muted-foreground">{item.count} members</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                Risk Indicators
              </h3>
              <div className="space-y-3">
                {[
                  { indicator: "Declining visit frequency", count: 23, trend: "up" },
                  { indicator: "Late payments (2+ times)", count: 15, trend: "stable" },
                  { indicator: "Missed scheduled classes", count: 19, trend: "up" },
                  { indicator: "Long gaps between visits", count: 31, trend: "down" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm text-foreground">{item.indicator}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.count}</Badge>
                      {item.trend === "up" && <TrendingUp className="h-4 w-4 text-destructive" />}
                      {item.trend === "down" && <TrendingDown className="h-4 w-4 text-success" />}
                      {item.trend === "stable" && <Activity className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Retention Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  title: "Re-engage inactive members", 
                  description: "Send personalized outreach to 23 members inactive for 2+ weeks",
                  priority: "high"
                },
                { 
                  title: "Follow up on payments", 
                  description: "11 members have overdue payments - consider payment plans",
                  priority: "high"
                },
                { 
                  title: "Downtown Center attention", 
                  description: "This branch has 28% dropout rate - investigate causes",
                  priority: "medium"
                },
              ].map((rec, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-lg border",
                  rec.priority === "high" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                )}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      rec.priority === "high" ? "text-destructive" : "text-warning"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dropout Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Dropout Configuration
            </DialogTitle>
            <DialogDescription>
              Define what conditions classify a member as "dropped out"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">No attendance for (days)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[dropoutConfig.noAttendanceDays]}
                  onValueChange={(v) => setDropoutConfig(prev => ({ ...prev, noAttendanceDays: v[0] }))}
                  min={7}
                  max={90}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={dropoutConfig.noAttendanceDays}
                  onChange={(e) => setDropoutConfig(prev => ({ ...prev, noAttendanceDays: parseInt(e.target.value) || 30 }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Membership expired for (days)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[dropoutConfig.membershipExpiredDays]}
                  onValueChange={(v) => setDropoutConfig(prev => ({ ...prev, membershipExpiredDays: v[0] }))}
                  min={0}
                  max={60}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={dropoutConfig.membershipExpiredDays}
                  onChange={(e) => setDropoutConfig(prev => ({ ...prev, membershipExpiredDays: parseInt(e.target.value) || 14 }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment overdue for (days)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[dropoutConfig.paymentOverdueDays]}
                  onValueChange={(v) => setDropoutConfig(prev => ({ ...prev, paymentOverdueDays: v[0] }))}
                  min={7}
                  max={90}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={dropoutConfig.paymentOverdueDays}
                  onChange={(e) => setDropoutConfig(prev => ({ ...prev, paymentOverdueDays: parseInt(e.target.value) || 30 }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">No class attendance after enrollment</Label>
              <Switch
                checked={dropoutConfig.noClassAttendance}
                onCheckedChange={(checked) => setDropoutConfig(prev => ({ ...prev, noClassAttendance: checked }))}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Rule combination</Label>
                <p className="text-xs text-muted-foreground">How to combine multiple rules</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={!dropoutConfig.useAndLogic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDropoutConfig(prev => ({ ...prev, useAndLogic: false }))}
                >
                  OR
                </Button>
                <Button
                  variant={dropoutConfig.useAndLogic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDropoutConfig(prev => ({ ...prev, useAndLogic: true }))}
                >
                  AND
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsConfigOpen(false)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply & Recalculate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Detail Modal */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Member Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center",
                  selectedMember.riskLevel === "high" ? "bg-destructive/10" :
                  selectedMember.riskLevel === "medium" ? "bg-warning/10" : "bg-muted"
                )}>
                  <Users className={cn(
                    "h-7 w-7",
                    selectedMember.riskLevel === "high" ? "text-destructive" :
                    selectedMember.riskLevel === "medium" ? "text-warning" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.branch}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Membership</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.membershipType}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Attendance</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.lastAttendance}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.lastPayment}</p>
                </div>
              </div>

              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Classification Reason</span>
                </div>
                <p className="text-sm text-foreground">{selectedMember.primaryReason || selectedMember.reason}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Status</span>
                {selectedMember.membershipStatus ? (
                  <Badge variant={selectedMember.membershipStatus === "Active" ? "default" : "destructive"}>
                    {selectedMember.membershipStatus}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Dropped</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
