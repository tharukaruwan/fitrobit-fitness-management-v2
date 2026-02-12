import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  action,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-card-foreground mt-1">{value}</p>
          <div className="flex items-center gap-2 mt-1 sm:mt-2">
            {change && (
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-medium truncate",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
            {action && <div className="ml-auto">{action}</div>}
          </div>
        </div>
        <div className={cn("w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}