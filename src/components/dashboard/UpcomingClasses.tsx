import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const classes = [
  {
    id: 1,
    name: "Power Yoga",
    instructor: "Emma Wilson",
    time: "09:00 AM",
    duration: "60 min",
    enrolled: 18,
    capacity: 20,
    color: "bg-purple-500",
  },
  {
    id: 2,
    name: "HIIT Training",
    instructor: "James Brown",
    time: "10:30 AM",
    duration: "45 min",
    enrolled: 12,
    capacity: 15,
    color: "bg-orange-500",
  },
  {
    id: 3,
    name: "Spin Class",
    instructor: "Lisa Park",
    time: "12:00 PM",
    duration: "45 min",
    enrolled: 20,
    capacity: 25,
    color: "bg-primary",
  },
  {
    id: 4,
    name: "Pilates",
    instructor: "Anna Lee",
    time: "02:00 PM",
    duration: "50 min",
    enrolled: 8,
    capacity: 12,
    color: "bg-pink-500",
  },
];

export function UpcomingClasses() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-card-foreground">Today's Classes</h3>
        <span className="text-xs text-muted-foreground">{classes.length} scheduled</span>
      </div>

      <div className="space-y-3">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={cn("w-1 h-12 rounded-full", cls.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground">{cls.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cls.instructor}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{cls.time}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Users className="w-3 h-3" />
                <span>{cls.enrolled}/{cls.capacity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
