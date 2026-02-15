import { UserPlus, CreditCard, Dumbbell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "member",
    title: "New employee registered",
    description: "Sarah Johnson joined Premium Plan",
    time: "2 min ago",
    icon: UserPlus,
    iconBg: "bg-success/10 text-success",
  },
  {
    id: 2,
    type: "payment",
    title: "Salary paid",
    description: "LKR 150,000 from Mike Chen",
    time: "15 min ago",
    icon: CreditCard,
    iconBg: "bg-primary/10 text-primary",
  },
  // {
  //   id: 3,
  //   type: "class",
  //   title: "Class completed",
  //   description: "Morning Yoga - 12 attendees",
  //   time: "1 hour ago",
  //   icon: Dumbbell,
  //   iconBg: "bg-warning/10 text-warning",
  // },
  {
    id: 4,
    type: "checkin",
    title: "Visitor check-in",
    description: "David Smith checked in",
    time: "2 hours ago",
    icon: Clock,
    iconBg: "bg-accent text-accent-foreground",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 pb-4",
              index !== activities.length - 1 && "border-b border-border"
            )}
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", activity.iconBg)}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
