import { WeeklyCalendarSchedule, type ScheduleSlot } from "./WeeklyCalendarSchedule";

interface ScheduleTabProps {
  schedule?: ScheduleSlot[];
  onSave?: (slots: ScheduleSlot[]) => void;
  entityType?: string;
  mode?: "single-week" | "recurring";
}

export function ScheduleTab({ schedule, onSave, entityType = "program", mode = "recurring" }: ScheduleTabProps) {
  return (
    <WeeklyCalendarSchedule
      mode={mode}
      slots={schedule}
      onSave={onSave}
      entityType={entityType}
    />
  );
}
