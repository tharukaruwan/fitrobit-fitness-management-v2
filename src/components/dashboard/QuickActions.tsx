import { UserPlus, CreditCard, CalendarPlus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Add Member",
    icon: UserPlus,
    color: "bg-primary hover:bg-primary/90",
  },
  {
    title: "New Sale",
    icon: CreditCard,
    color: "bg-success hover:bg-success/90",
  },
  {
    title: "Book Class",
    icon: CalendarPlus,
    color: "bg-warning hover:bg-warning/90",
  },
  {
    title: "Day Pass",
    icon: Receipt,
    color: "bg-purple-500 hover:bg-purple-600",
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            className={cn(
              "h-auto py-4 flex-col gap-2 rounded-xl text-white hover:text-black",
              action.color
            )}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
