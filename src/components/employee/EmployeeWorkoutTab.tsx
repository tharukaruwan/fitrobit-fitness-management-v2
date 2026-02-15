import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { useToast } from "@/hooks/use-toast";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import { generateWorkoutPDF } from "@/lib/pdf-utils";
import {
  Plus,
  Dumbbell,
  Calendar as CalendarIcon,
  Eye,
  Trash2,
  Save,
  Download,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
  Youtube,
  FileText,
  User
} from "lucide-react";

// WorkoutDetails interface matching template structure
interface WorkoutDetails {
  exercise: string;
  sets: string;
  repetitions: string;
  rest: string;
  note: string;
  youtubeUrl: string;
}

interface WorkoutDay {
  name: string;
  exercises: WorkoutDetails[];
}

interface CurrentWorkoutPlan {
  name: string;
  startDate: Date;
  endDate: Date;
  assignedBy: string;
  days: WorkoutDay[];
}

interface HistoryPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "completed" | "expired";
  progress: number;
  assignedBy: string;
  days: WorkoutDay[];
}

// Inline editable exercise row component
interface ExerciseRowProps {
  exercise: WorkoutDetails;
  index: number;
  isEditing: boolean;
  onUpdate: (updated: WorkoutDetails) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

function ExerciseRow({ 
  exercise, 
  index, 
  isEditing, 
  onUpdate, 
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: ExerciseRowProps) {
  const [editData, setEditData] = useState<WorkoutDetails>(exercise);

  const handleChange = (field: keyof WorkoutDetails, value: string) => {
    const updated = { ...editData, [field]: value };
    setEditData(updated);
    onUpdate(updated);
  };

  if (isEditing) {
    return (
      <tr className="border-b border-border/50 bg-primary/5">
        <td className="p-2 text-center text-muted-foreground font-mono text-sm">{index + 1}</td>
        <td className="p-2">
          <Input
            value={editData.exercise}
            onChange={(e) => handleChange("exercise", e.target.value)}
            placeholder="Exercise name"
            className="h-8 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            value={editData.sets}
            onChange={(e) => handleChange("sets", e.target.value)}
            placeholder="Sets"
            className="h-8 text-sm w-16"
          />
        </td>
        <td className="p-2">
          <Input
            value={editData.repetitions}
            onChange={(e) => handleChange("repetitions", e.target.value)}
            placeholder="Reps"
            className="h-8 text-sm w-20"
          />
        </td>
        <td className="p-2 hidden md:table-cell">
          <Input
            value={editData.rest}
            onChange={(e) => handleChange("rest", e.target.value)}
            placeholder="Rest"
            className="h-8 text-sm w-20"
          />
        </td>
        <td className="p-2 hidden lg:table-cell">
          <Input
            value={editData.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Notes"
            className="h-8 text-sm"
          />
        </td>
        <td className="p-2 hidden lg:table-cell">
          <Input
            value={editData.youtubeUrl}
            onChange={(e) => handleChange("youtubeUrl", e.target.value)}
            placeholder="YouTube URL"
            className="h-8 text-sm"
          />
        </td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-success" onClick={onSaveEdit}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={onCancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="p-2 text-center text-muted-foreground font-mono text-sm">{index + 1}</td>
      <td className="p-2 font-medium text-card-foreground">{exercise.exercise || <span className="text-muted-foreground italic">Untitled</span>}</td>
      <td className="p-2 text-sm">{exercise.sets || "-"}</td>
      <td className="p-2 text-sm">{exercise.repetitions || "-"}</td>
      <td className="p-2 text-sm hidden md:table-cell">{exercise.rest || "-"}</td>
      <td className="p-2 text-sm text-muted-foreground hidden lg:table-cell">{exercise.note || "-"}</td>
      <td className="p-2 hidden lg:table-cell">
        {exercise.youtubeUrl ? (
          <a href={exercise.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-destructive hover:underline">
            <Youtube className="w-4 h-4" />
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onStartEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Sample templates for loading
const workoutTemplates = [
  { id: "1", name: "Full Body Strength", category: "Strength", difficulty: "intermediate" },
  { id: "2", name: "HIIT Fat Burner", category: "Cardio", difficulty: "advanced" },
  { id: "3", name: "Beginner Basics", category: "General", difficulty: "beginner" },
  { id: "4", name: "Muscle Building", category: "Hypertrophy", difficulty: "intermediate" },
];

// Template day data for loading
const getTemplateDays = (templateId: string): WorkoutDay[] => {
  const templates: Record<string, WorkoutDay[]> = {
    "1": [
      {
        name: "Push Day",
        exercises: [
          { exercise: "Barbell Squat", sets: "4", repetitions: "8-10", rest: "90 sec", note: "Keep core tight", youtubeUrl: "" },
          { exercise: "Bench Press", sets: "4", repetitions: "8-10", rest: "90 sec", note: "", youtubeUrl: "" },
        ],
      },
      {
        name: "Pull Day",
        exercises: [
          { exercise: "Deadlift", sets: "4", repetitions: "6-8", rest: "120 sec", note: "", youtubeUrl: "" },
          { exercise: "Bent Over Row", sets: "4", repetitions: "8-10", rest: "60 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
    "2": [
      {
        name: "Day 1",
        exercises: [
          { exercise: "Burpees", sets: "4", repetitions: "20", rest: "30 sec", note: "", youtubeUrl: "" },
          { exercise: "Mountain Climbers", sets: "4", repetitions: "30", rest: "30 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
    "3": [
      {
        name: "Full Body",
        exercises: [
          { exercise: "Bodyweight Squats", sets: "3", repetitions: "15", rest: "60 sec", note: "", youtubeUrl: "" },
          { exercise: "Push-ups", sets: "3", repetitions: "10", rest: "60 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
    "4": [
      {
        name: "Chest & Triceps",
        exercises: [
          { exercise: "Incline Bench Press", sets: "4", repetitions: "8-10", rest: "90 sec", note: "", youtubeUrl: "" },
          { exercise: "Cable Flyes", sets: "3", repetitions: "12-15", rest: "60 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
  };
  return templates[templateId] || [];
};

// Sample history plans
const sampleHistoryPlans: HistoryPlan[] = [
  {
    id: "wp-hist-1",
    name: "HIIT Fat Burner",
    startDate: new Date(2024, 9, 1),
    endDate: new Date(2024, 9, 30),
    status: "completed",
    progress: 100,
    assignedBy: "Coach Mike",
    days: [
      {
        name: "Day 1",
        exercises: [
          { exercise: "Burpees", sets: "4", repetitions: "20", rest: "30 sec", note: "", youtubeUrl: "" },
          { exercise: "Mountain Climbers", sets: "4", repetitions: "30", rest: "30 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
  },
  {
    id: "wp-hist-2",
    name: "Beginner Basics",
    startDate: new Date(2024, 7, 1),
    endDate: new Date(2024, 8, 30),
    status: "completed",
    progress: 85,
    assignedBy: "Coach Sarah",
    days: [],
  },
  {
    id: "wp-hist-3",
    name: "Muscle Building",
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 6, 30),
    status: "expired",
    progress: 60,
    assignedBy: "Coach Mike",
    days: [],
  },
];

interface EmployeeWorkoutTabProps {
  memberId: string;
  memberName: string;
}

export function EmployeeWorkoutTab({ memberId, memberName }: EmployeeWorkoutTabProps) {
  const { toast } = useToast();

  // Current plan - directly editable
  const [currentPlan, setCurrentPlan] = useState<CurrentWorkoutPlan>({
    name: "Full Body Strength (Customized)",
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 31),
    assignedBy: "Coach Mike",
    days: [
      {
        name: "Push Day",
        exercises: [
          { exercise: "Bench Press", sets: "4", repetitions: "8-10", rest: "90 sec", note: "", youtubeUrl: "" },
          { exercise: "Overhead Press", sets: "3", repetitions: "10-12", rest: "60 sec", note: "", youtubeUrl: "" },
        ],
      },
      {
        name: "Pull Day",
        exercises: [
          { exercise: "Deadlift", sets: "4", repetitions: "6-8", rest: "120 sec", note: "", youtubeUrl: "" },
          { exercise: "Pull-ups", sets: "3", repetitions: "8-12", rest: "60 sec", note: "", youtubeUrl: "" },
        ],
      },
    ],
  });

  const [historyPlans] = useState<HistoryPlan[]>(sampleHistoryPlans);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [selectedHistoryPlan, setSelectedHistoryPlan] = useState<HistoryPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // First day expanded by default
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [originalExercise, setOriginalExercise] = useState<WorkoutDetails | null>(null);
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Paginated history
  const { paginatedData, paginationProps } = useTableData({
    data: historyPlans,
    itemsPerPage: 5,
  });

  const historyColumns: Column<HistoryPlan>[] = [
    { 
      key: "name", 
      label: "Plan Name", 
      priority: "always",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    { 
      key: "assignedBy", 
      label: "Assigned By", 
      priority: "md",
      render: (value: string) => (
        <span className="text-muted-foreground flex items-center gap-1">
          <User className="w-3 h-3" />
          {value}
        </span>
      )
    },
    { 
      key: "startDate", 
      label: "Period", 
      priority: "lg",
      render: (value: Date, item: HistoryPlan) => (
        <span className="text-muted-foreground">
          {format(value, "MMM d")} - {format(item.endDate, "MMM d, yyyy")}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      priority: "always",
      render: (value: string) => (
        <StatusBadge 
          status={value === "completed" ? "info" : "neutral"} 
          label={value.charAt(0).toUpperCase() + value.slice(1)} 
        />
      )
    },
    { 
      key: "progress", 
      label: "Progress", 
      priority: "lg",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all" 
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{value || 0}%</span>
        </div>
      )
    },
  ];

  const handleExportPDF = () => {
    const pdf = generateWorkoutPDF({
      name: currentPlan.name,
      category: "Custom",
      difficulty: "Intermediate",
      duration: `${currentPlan.days.length} days`,
      days: currentPlan.days,
      client: { name: memberName, memberId },
      trainerName: currentPlan.assignedBy,
      startDate: format(currentPlan.startDate, "MMM d, yyyy"),
      endDate: format(currentPlan.endDate, "MMM d, yyyy"),
    });
    pdf.save(`${memberName.replace(/\s+/g, "_")}_workout_plan.pdf`);
    toast({ title: "PDF Downloaded", description: "Workout plan exported successfully" });
  };

  const handleExportHistoryPDF = (plan: HistoryPlan) => {
    const pdf = generateWorkoutPDF({
      name: plan.name,
      category: "Custom",
      difficulty: "Intermediate",
      duration: `${plan.days.length} days`,
      days: plan.days,
      client: { name: memberName, memberId },
      trainerName: plan.assignedBy,
      startDate: format(plan.startDate, "MMM d, yyyy"),
      endDate: format(plan.endDate, "MMM d, yyyy"),
    });
    pdf.save(`${memberName.replace(/\s+/g, "_")}_${plan.name.replace(/\s+/g, "_")}.pdf`);
    toast({ title: "PDF Downloaded", description: "Plan exported successfully" });
  };

  const handleLoadTemplate = (templateId: string) => {
    if (templateId === "none") return;
    const template = workoutTemplates.find(t => t.id === templateId);
    if (template) {
      const templateDays = getTemplateDays(templateId);
      setCurrentPlan(prev => ({
        ...prev,
        name: template.name,
        days: templateDays,
      }));
      setExpandedDays([0]);
      toast({ title: "Template Loaded", description: `${template.name} loaded - you can now customize it` });
    }
  };

  const handleSavePlan = () => {
    if (!currentPlan.name.trim()) {
      toast({ title: "Error", description: "Please enter a plan name", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Plan Saved", description: "Workout plan has been updated" });
    }, 500);
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const addDay = () => {
    const newDay: WorkoutDay = { name: `Day ${currentPlan.days.length + 1}`, exercises: [] };
    setCurrentPlan(prev => ({ ...prev, days: [...prev.days, newDay] }));
    setExpandedDays(prev => [...prev, currentPlan.days.length]);
    toast({ title: "Day Added", description: `New day has been created` });
  };

  const removeDay = (dayIndex: number) => {
    if (currentPlan.days.length <= 1) {
      toast({ title: "Cannot Remove", description: "At least one day is required", variant: "destructive" });
      return;
    }
    const dayName = currentPlan.days[dayIndex].name;
    setCurrentPlan(prev => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== dayIndex)
    }));
    setExpandedDays(prev => prev.filter(d => d !== dayIndex).map(d => d > dayIndex ? d - 1 : d));
    toast({ title: "Day Removed", description: `${dayName} has been deleted` });
  };

  const updateDayName = (dayIndex: number, newName: string) => {
    setCurrentPlan(prev => {
      const updated = [...prev.days];
      updated[dayIndex] = { ...updated[dayIndex], name: newName };
      return { ...prev, days: updated };
    });
  };

  const addExercise = (dayIndex: number) => {
    const newExercise: WorkoutDetails = {
      exercise: "",
      sets: "",
      repetitions: "",
      rest: "",
      note: "",
      youtubeUrl: "",
    };
    setCurrentPlan(prev => {
      const updated = [...prev.days];
      updated[dayIndex] = { 
        ...updated[dayIndex], 
        exercises: [...updated[dayIndex].exercises, newExercise] 
      };
      return { ...prev, days: updated };
    });
    setEditingExercise({ dayIndex, exerciseIndex: currentPlan.days[dayIndex].exercises.length });
    setOriginalExercise(newExercise);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, updated: WorkoutDetails) => {
    setCurrentPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: [...newDays[dayIndex].exercises]
      };
      newDays[dayIndex].exercises[exerciseIndex] = updated;
      return { ...prev, days: newDays };
    });
  };

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    setCurrentPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: newDays[dayIndex].exercises.filter((_, i) => i !== exerciseIndex)
      };
      return { ...prev, days: newDays };
    });
    toast({ title: "Exercise Removed" });
  };

  const startEditExercise = (dayIndex: number, exerciseIndex: number) => {
    setEditingExercise({ dayIndex, exerciseIndex });
    setOriginalExercise({ ...currentPlan.days[dayIndex].exercises[exerciseIndex] });
  };

  const cancelEditExercise = () => {
    if (editingExercise && originalExercise) {
      // If it was a new empty exercise, remove it
      if (!originalExercise.exercise) {
        setCurrentPlan(prev => {
          const newDays = [...prev.days];
          newDays[editingExercise.dayIndex] = {
            ...newDays[editingExercise.dayIndex],
            exercises: newDays[editingExercise.dayIndex].exercises.filter(
              (_, i) => i !== editingExercise.exerciseIndex
            )
          };
          return { ...prev, days: newDays };
        });
      } else {
        // Restore original
        updateExercise(editingExercise.dayIndex, editingExercise.exerciseIndex, originalExercise);
      }
    }
    setEditingExercise(null);
    setOriginalExercise(null);
  };

  const saveEditExercise = () => {
    setEditingExercise(null);
    setOriginalExercise(null);
    toast({ title: "Exercise Saved" });
  };

  const handleViewHistory = (plan: HistoryPlan) => {
    setSelectedHistoryPlan(plan);
    setShowViewSheet(true);
  };

  const getTotalExercises = () => currentPlan.days.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <SectionHeader 
        title={`Current Workout Plan (${currentPlan.days.length} Days, ${getTotalExercises()} Exercises)`}
        action={
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={handleLoadTemplate}>
              <SelectTrigger className="w-[180px] h-9 rounded-[0.625rem]">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Load Template" />
              </SelectTrigger>
              <SelectContent>
                {workoutTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={addDay}>
              <CalendarIcon className="w-4 h-4 mr-1" />
              Add Day
            </Button>
            <Button size="sm" onClick={handleSavePlan} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? "Saving..." : "Save All"}
            </Button>
          </div>
        }
      />

      {/* Plan Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-card rounded-xl border border-border/50">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Plan Name</Label>
          <Input
            value={currentPlan.name}
            onChange={(e) => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter plan name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Assigned By</Label>
          <div className="h-10 px-3 flex items-center gap-2 bg-muted/50 rounded-[0.625rem] border">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{currentPlan.assignedBy}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentPlan.startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentPlan.startDate}
                onSelect={(date) => date && setCurrentPlan(prev => ({ ...prev, startDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentPlan.endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentPlan.endDate}
                onSelect={(date) => date && setCurrentPlan(prev => ({ ...prev, endDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Workout Days */}
      <div className="space-y-3">
        {currentPlan.days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {/* Day Header */}
            <div 
              className={cn(
                "flex items-center justify-between p-4 cursor-pointer transition-colors",
                expandedDays.includes(dayIndex) ? "bg-primary/5 border-b border-border/50" : "hover:bg-muted/30"
              )}
              onClick={() => toggleDay(dayIndex)}
            >
              <div className="flex items-center gap-3">
                {expandedDays.includes(dayIndex) ? (
                  <ChevronDown className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{dayIndex + 1}</span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {editingDayName === dayIndex ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={day.name}
                        onChange={(e) => updateDayName(dayIndex, e.target.value)}
                        className="h-7 text-sm w-32"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingDayName(null);
                          if (e.key === "Escape") setEditingDayName(null);
                        }}
                      />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingDayName(null)}>
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h4 className="font-semibold text-card-foreground">{day.name}</h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditingDayName(dayIndex)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{day.exercises.length} exercises</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8"
                  onClick={() => addExercise(dayIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Exercise
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeDay(dayIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Day Exercises Table */}
            {expandedDays.includes(dayIndex) && (
              <div className="overflow-x-auto">
                {day.exercises.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No exercises yet</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => addExercise(dayIndex)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add First Exercise
                    </Button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground w-10">#</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground">Exercise</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16">Sets</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-20">Reps</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-20 hidden md:table-cell">Rest</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Note</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16 hidden lg:table-cell">Video</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <ExerciseRow
                          key={exerciseIndex}
                          exercise={exercise}
                          index={exerciseIndex}
                          isEditing={editingExercise?.dayIndex === dayIndex && editingExercise?.exerciseIndex === exerciseIndex}
                          onUpdate={(updated) => updateExercise(dayIndex, exerciseIndex, updated)}
                          onDelete={() => deleteExercise(dayIndex, exerciseIndex)}
                          onStartEdit={() => startEditExercise(dayIndex, exerciseIndex)}
                          onCancelEdit={cancelEditExercise}
                          onSaveEdit={saveEditExercise}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Plan History */}
      <SectionHeader title="Plan History" />
      <ResponsiveTable
        data={paginatedData}
        columns={historyColumns}
        keyExtractor={(item) => item.id}
        onRowClick={handleViewHistory}
        pagination={paginationProps}
        rowActions={[
          {
            icon: Eye,
            label: "View Details",
            onClick: handleViewHistory,
          },
          {
            icon: FileText,
            label: "Download PDF",
            onClick: handleExportHistoryPDF,
          },
        ]}
      />

      {/* View History Sheet */}
      <QuickAddSheet
        open={showViewSheet}
        onOpenChange={setShowViewSheet}
        title={selectedHistoryPlan?.name || "Plan Details"}
        description={selectedHistoryPlan ? `${format(selectedHistoryPlan.startDate, "MMM d")} - ${format(selectedHistoryPlan.endDate, "MMM d, yyyy")}` : ""}
      >
        {selectedHistoryPlan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Assigned By</span>
              <span className="font-medium flex items-center gap-1">
                <User className="w-3 h-3" />
                {selectedHistoryPlan.assignedBy}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge 
                status={selectedHistoryPlan.status === "completed" ? "info" : "neutral"} 
                label={selectedHistoryPlan.status.charAt(0).toUpperCase() + selectedHistoryPlan.status.slice(1)} 
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="font-medium">{selectedHistoryPlan.progress}%</span>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleExportHistoryPDF(selectedHistoryPlan)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            
            {selectedHistoryPlan.days.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Workout Days</Label>
                {selectedHistoryPlan.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-muted/20 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{day.name}</h4>
                    <div className="space-y-1">
                      {day.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="flex justify-between text-xs">
                          <span>{exercise.exercise}</span>
                          <span className="text-muted-foreground">{exercise.sets} x {exercise.repetitions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </QuickAddSheet>
    </div>
  );
}
