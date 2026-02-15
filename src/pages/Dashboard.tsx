import { Users, CreditCard, Calendar, TrendingUp, BarChart3, Activity, ChevronRight, UserMinus, MessageSquare, Mail, Phone, ClipboardList, Clock, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { useAppSelector } from "@/store/hooks";

const messagingCredits = [
  { label: "SMS", count: "1,247", icon: MessageSquare, color: "text-primary" },
  { label: "Email", count: "3,580", icon: Mail, color: "text-success" },
  { label: "WhatsApp", count: "892", icon: Phone, color: "text-[hsl(142,70%,45%)]" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const authUser = useAppSelector((state) => state.auth.user);
  const isRootAdmin = authUser?.role === "admin";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value="1,247"
          change="+12 new hires this month"
          changeType="positive"
          icon={Users}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Present Today"
          value="1,089"
          change="87.3% attendance rate"
          changeType="positive"
          icon={UserCheck}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="On Leave"
          value="42"
          change="18 pending approvals"
          changeType="neutral"
          icon={Calendar}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="Avg. Work Hours"
          value="8.2h"
          change="+0.3h from last week"
          changeType="positive"
          icon={Clock}
          iconColor="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Quick Actions - Shown at top on mobile/tablet, hidden on desktop */}
      <div className="lg:hidden">
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Attendance Overview */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground">Today's Attendance</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary hover:text-primary"
                onClick={() => navigate("/attendance")}
              >
                View All
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-success/5 rounded-lg p-4 border border-success/20">
                <div className="text-2xl font-bold text-success">1,089</div>
                <div className="text-xs text-muted-foreground mt-1">Present</div>
              </div>
              <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">38</div>
                <div className="text-xs text-muted-foreground mt-1">Absent</div>
              </div>
              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <div className="text-2xl font-bold text-warning">42</div>
                <div className="text-xs text-muted-foreground mt-1">On Leave</div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="text-2xl font-bold text-primary">78</div>
                <div className="text-xs text-muted-foreground mt-1">Late Check-in</div>
              </div>
            </div>
          </div>

          <RecentActivity />

        </div>

        {/* Right Column - Quick Actions & Analytics */}
        <div className="space-y-6">

          {/* Attendance Summary */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground">This Week</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary hover:text-primary"
                onClick={() => navigate("/attendance/weekly")}
              >
                Details
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Attendance</span>
                <span className="text-sm font-semibold text-card-foreground">88.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Late Arrivals</span>
                <span className="text-sm font-semibold text-card-foreground">82/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Early Departures</span>
                <span className="text-sm font-semibold text-card-foreground">45/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Work Hours</span>
                <span className="text-sm font-semibold text-card-foreground">51,234h</span>
              </div>
            </div>
          </div>
          
          {/* Analytics Hub */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Analytics Hub</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/payroll-analytics")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">Payroll Analytics</p>
                    <p className="text-xs text-muted-foreground">Cost tracking & forecasts</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/employee-analytics")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <UserMinus className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">Employee Analytics</p>
                    <p className="text-xs text-muted-foreground">Turnover & retention</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/leave-analytics")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-warning" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">Leave Management</p>
                    <p className="text-xs text-muted-foreground">Requests & balances</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {/* Department Overview */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Department Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Engineering</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">456</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sales & Marketing</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-success rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">323</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Operations</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-warning rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">268</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">HR & Admin</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-purple-500 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}