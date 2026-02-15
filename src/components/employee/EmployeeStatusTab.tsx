import { Progress } from "@/components/ui/progress";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { SectionHeader } from "@/components/ui/detail-page-template";

// --- Interfaces ---

export interface ProgressMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  activity: string;
}

interface EmployeeStatusTabProps {
  id: string;
}

// --- Table Column Definitions ---
const progressMetrics: ProgressMetric[] = [
  { label: "Workouts This Month", current: 18, target: 20, unit: "sessions" },
  { label: "Classes Attended", current: 8, target: 12, unit: "classes" },
  { label: "Calories Burned", current: 15200, target: 20000, unit: "kcal" },
  { label: "Active Days", current: 22, target: 25, unit: "days" },
];

const attendanceData: AttendanceRecord[] = [
  { id: 1, date: "Dec 30, 2024", checkIn: "06:30 AM", checkOut: "08:15 AM", duration: "1h 45m", activity: "Strength Training" },
  { id: 2, date: "Dec 28, 2024", checkIn: "07:00 AM", checkOut: "08:30 AM", duration: "1h 30m", activity: "Cardio" },
  { id: 3, date: "Dec 27, 2024", checkIn: "06:45 AM", checkOut: "08:00 AM", duration: "1h 15m", activity: "HIIT Class" },
  { id: 4, date: "Dec 25, 2024", checkIn: "08:00 AM", checkOut: "09:30 AM", duration: "1h 30m", activity: "Swimming" },
  { id: 5, date: "Dec 24, 2024", checkIn: "06:30 AM", checkOut: "08:00 AM", duration: "1h 30m", activity: "Strength Training" },
];

const attendanceColumns: Column<AttendanceRecord>[] = [
  { key: "date", label: "Date", priority: "always" },
  { key: "checkIn", label: "Check In", priority: "always" },
  { key: "checkOut", label: "Check Out", priority: "md" },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "activity", label: "Activity", priority: "md" },
];

// --- Main Component ---

export function EmployeeStatusTab({ id }: EmployeeStatusTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Monthly Goals" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {progressMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-muted/30 rounded-lg p-4 border border-border/30"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-card-foreground">
                {metric.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.current}/{metric.target} {metric.unit}
              </span>
            </div>
            <Progress
              value={(metric.current / metric.target) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((metric.current / metric.target) * 100)}% completed
            </p>
          </div>
        ))}
      </div>

      <SectionHeader title="Recent Attendance" />
      <ResponsiveTable
        data={attendanceData}
        columns={attendanceColumns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}