import { Users, CreditCard, Dumbbell, TrendingUp, BarChart3, Activity, ChevronRight, UserMinus, MessageSquare, Mail, Phone, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
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
  const isRootAdmin = authUser?.role === "gym";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Members"
          value="1,247"
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(2450)}
          change="+8% from yesterday"
          changeType="positive"
          icon={CreditCard}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Classes Today"
          value="12"
          change="4 in progress"
          changeType="neutral"
          icon={Dumbbell}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="Check-ins"
          value="186"
          change="+5% from average"
          changeType="positive"
          icon={TrendingUp}
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
          <RecentActivity />
          <UpcomingClasses />
        </div>

        {/* Right Column - Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions - Hidden on mobile/tablet, shown on desktop */}
          <div className="hidden lg:block">
            <QuickActions />
          </div>

          {/* Messaging Credits */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground">Messaging Credits</h3>
              {isRootAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary"
                  onClick={() => navigate("/settings?tab=account")}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Top Up
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {messagingCredits.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Analytics Hub */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Analytics Hub</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/revenue-analytics")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">Revenue Prediction</p>
                    <p className="text-xs text-muted-foreground">Forecast & gap analysis</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/attendance-heatmap")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">Attendance Heatmap</p>
                    <p className="text-xs text-muted-foreground">Peak hours & patterns</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-3 hover:bg-primary/5"
                onClick={() => navigate("/user-analytics")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <UserMinus className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">User Analytics</p>
                    <p className="text-xs text-muted-foreground">Dropout & retention</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {/* Membership Overview */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Membership Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Premium</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">456</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Standard</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-success rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">523</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Basic</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-warning rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">268</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
