import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  DetailPageTemplate, 
  DetailTab, 
  SectionHeader 
} from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  ClipboardList,
  Dumbbell, 
  Clock, 
  Target,
  Pencil, 
  Save,
  X,
  Plus,
  Trash2,
  Play,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Calendar,
  Check,
  Youtube,
  FileDown,
  User,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateWorkoutPDF } from "@/lib/pdf-utils";

// WorkoutDetails interface matching the mongoose schema
interface WorkoutDetails {
  exercise: string;
  sets: string;
  repetitions: string;
  rest: string;
  note: string;
  youtubeUrl: string;
}

// Sample template data
const templateData = {
  id: 1,
  name: "Full Body Strength",
  category: "Strength",
  difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
  duration: "60 min",
  targetMuscles: "Full Body",
  description: "A comprehensive full-body workout designed to build strength and muscle.",
  createdBy: "Mike Johnson",
  createdAt: "Jan 15, 2024",
  updatedAt: "Dec 28, 2024",
  usageCount: 156,
  status: "active" as const,
  restBetweenSets: "60-90 sec",
  warmupDuration: "10 min",
  cooldownDuration: "5 min",
};

// Day structure with name and exercises
interface WorkoutDay {
  name: string;
  exercises: WorkoutDetails[];
}

// Initial workouts data - array of days containing exercises
const initialWorkouts: WorkoutDay[] = [
  {
    name: "Push Day",
    exercises: [
      { exercise: "Barbell Squat", sets: "4", repetitions: "8-10", rest: "90 sec", note: "Keep core tight", youtubeUrl: "" },
      { exercise: "Bench Press", sets: "4", repetitions: "8-10", rest: "90 sec", note: "Full range of motion", youtubeUrl: "" },
      { exercise: "Bent Over Row", sets: "4", repetitions: "8-10", rest: "60 sec", note: "Squeeze at top", youtubeUrl: "" },
    ],
  },
  {
    name: "Pull Day",
    exercises: [
      { exercise: "Overhead Press", sets: "3", repetitions: "10-12", rest: "60 sec", note: "Control the movement", youtubeUrl: "" },
      { exercise: "Romanian Deadlift", sets: "3", repetitions: "10-12", rest: "60 sec", note: "Hinge at hips", youtubeUrl: "" },
      { exercise: "Pull-ups", sets: "3", repetitions: "8-12", rest: "60 sec", note: "Assisted if needed", youtubeUrl: "" },
    ],
  },
  {
    name: "Leg Day",
    exercises: [
      { exercise: "Dumbbell Lunges", sets: "3", repetitions: "12 each", rest: "45 sec", note: "Alternate legs", youtubeUrl: "" },
      { exercise: "Plank", sets: "3", repetitions: "45 sec", rest: "30 sec", note: "Keep body straight", youtubeUrl: "" },
    ],
  },
];

interface UsageRecord {
  id: number;
  memberName: string;
  date: string;
  completedExercises: number;
  totalExercises: number;
  duration: string;
  feedback: string;
}

const usageData: UsageRecord[] = [
  { id: 1, memberName: "John Smith", date: "Dec 30, 2024", completedExercises: 8, totalExercises: 8, duration: "58 min", feedback: "Great workout!" },
  { id: 2, memberName: "Sarah Johnson", date: "Dec 29, 2024", completedExercises: 8, totalExercises: 8, duration: "62 min", feedback: "Challenging but effective" },
  { id: 3, memberName: "Mike Wilson", date: "Dec 28, 2024", completedExercises: 6, totalExercises: 8, duration: "45 min", feedback: "Skipped last 2 exercises" },
];

const usageColumns: Column<UsageRecord>[] = [
  { key: "memberName", label: "Member", priority: "always", render: (value: string) => <span className="font-medium">{value}</span> },
  { key: "date", label: "Date", priority: "always" },
  { 
    key: "completedExercises", 
    label: "Progress", 
    priority: "md",
    render: (value: number, row: UsageRecord) => (
      <span className={value === row.totalExercises ? "text-success" : "text-warning"}>
        {value}/{row.totalExercises}
      </span>
    )
  },
  { key: "duration", label: "Duration", priority: "md" },
  { key: "feedback", label: "Feedback", priority: "lg", render: (value: string) => value || <span className="text-muted-foreground">-</span> },
];

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
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

function ExerciseRow({ 
  exercise, 
  index, 
  isEditing, 
  onUpdate, 
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver
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
        <td className="p-2"><GripVertical className="w-4 h-4 text-muted-foreground/30" /></td>
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
    <tr 
      className={cn(
        "border-b border-border/50 hover:bg-muted/30 transition-colors",
        isDragging && "opacity-50",
        isDragOver && "border-t-2 border-t-primary"
      )}
      draggable={!isEditing}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      <td className="p-2 cursor-grab active:cursor-grabbing" onMouseDown={(e) => e.stopPropagation()}>
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </td>
      <td className="p-2 text-center text-muted-foreground font-mono text-sm">{index + 1}</td>
      <td className="p-2 font-medium text-card-foreground">{exercise.exercise}</td>
      <td className="p-2 text-sm">{exercise.sets}</td>
      <td className="p-2 text-sm">{exercise.repetitions}</td>
      <td className="p-2 text-sm hidden md:table-cell">{exercise.rest}</td>
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

export default function WorkoutTemplateDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State for details editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: templateData.name,
    category: templateData.category,
    difficulty: templateData.difficulty,
    duration: templateData.duration,
    targetMuscles: templateData.targetMuscles,
    description: templateData.description,
    restBetweenSets: templateData.restBetweenSets,
    warmupDuration: templateData.warmupDuration,
    cooldownDuration: templateData.cooldownDuration,
  });

  // State for workouts (array of days with names and exercises)
  const [workouts, setWorkouts] = useState<WorkoutDay[]>(initialWorkouts);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // First day expanded by default
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [originalExercise, setOriginalExercise] = useState<WorkoutDetails | null>(null);
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{ dayIndex: number; fromIndex: number; overIndex: number } | null>(null);

  const handleExerciseDragStart = (dayIndex: number, index: number) => {
    setDragState({ dayIndex, fromIndex: index, overIndex: index });
  };

  const handleExerciseDragOver = (dayIndex: number, e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState && dragState.dayIndex === dayIndex) {
      setDragState(prev => prev ? { ...prev, overIndex: index } : null);
    }
  };

  const handleExerciseDragEnd = (dayIndex: number) => {
    if (dragState && dragState.dayIndex === dayIndex && dragState.fromIndex !== dragState.overIndex) {
      setWorkouts(prev => {
        const updated = [...prev];
        const exercises = [...updated[dayIndex].exercises];
        const [moved] = exercises.splice(dragState.fromIndex, 1);
        exercises.splice(dragState.overIndex, 0, moved);
        updated[dayIndex] = { ...updated[dayIndex], exercises };
        return updated;
      });
      toast({ title: "Exercise reordered" });
    }
    setDragState(null);
  };

  const handleSave = () => {
    toast({ title: "Template Updated", description: "Changes have been saved successfully." });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: templateData.name,
      category: templateData.category,
      difficulty: templateData.difficulty,
      duration: templateData.duration,
      targetMuscles: templateData.targetMuscles,
      description: templateData.description,
      restBetweenSets: templateData.restBetweenSets,
      warmupDuration: templateData.warmupDuration,
      cooldownDuration: templateData.cooldownDuration,
    });
    setIsEditing(false);
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const addDay = () => {
    const newDay: WorkoutDay = { name: `Day ${workouts.length + 1}`, exercises: [] };
    setWorkouts(prev => [...prev, newDay]);
    setExpandedDays(prev => [...prev, workouts.length]);
    toast({ title: "Day Added", description: `New day has been created` });
  };

  const removeDay = (dayIndex: number) => {
    if (workouts.length <= 1) {
      toast({ title: "Cannot Remove", description: "At least one day is required", variant: "destructive" });
      return;
    }
    const dayName = workouts[dayIndex].name;
    setWorkouts(prev => prev.filter((_, i) => i !== dayIndex));
    setExpandedDays(prev => prev.filter(d => d !== dayIndex).map(d => d > dayIndex ? d - 1 : d));
    toast({ title: "Day Removed", description: `${dayName} has been deleted` });
  };

  const updateDayName = (dayIndex: number, newName: string) => {
    setWorkouts(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], name: newName };
      return updated;
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
    setWorkouts(prev => {
      const updated = [...prev];
      updated[dayIndex] = { 
        ...updated[dayIndex], 
        exercises: [...updated[dayIndex].exercises, newExercise] 
      };
      return updated;
    });
    setEditingExercise({ dayIndex, exerciseIndex: workouts[dayIndex].exercises.length });
    setOriginalExercise(newExercise);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, updated: WorkoutDetails) => {
    setWorkouts(prev => {
      const newWorkouts = [...prev];
      newWorkouts[dayIndex] = {
        ...newWorkouts[dayIndex],
        exercises: [...newWorkouts[dayIndex].exercises]
      };
      newWorkouts[dayIndex].exercises[exerciseIndex] = updated;
      return newWorkouts;
    });
  };

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    setWorkouts(prev => {
      const newWorkouts = [...prev];
      newWorkouts[dayIndex] = {
        ...newWorkouts[dayIndex],
        exercises: newWorkouts[dayIndex].exercises.filter((_, i) => i !== exerciseIndex)
      };
      return newWorkouts;
    });
    toast({ title: "Exercise Removed" });
  };

  const startEditExercise = (dayIndex: number, exerciseIndex: number) => {
    setEditingExercise({ dayIndex, exerciseIndex });
    setOriginalExercise({ ...workouts[dayIndex].exercises[exerciseIndex] });
  };

  const cancelEditExercise = () => {
    if (editingExercise && originalExercise) {
      // If it was a new empty exercise, remove it
      if (!originalExercise.exercise) {
        setWorkouts(prev => {
          const newWorkouts = [...prev];
          newWorkouts[editingExercise.dayIndex] = {
            ...newWorkouts[editingExercise.dayIndex],
            exercises: newWorkouts[editingExercise.dayIndex].exercises.filter(
              (_, i) => i !== editingExercise.exerciseIndex
            )
          };
          return newWorkouts;
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

  const saveAllWorkouts = () => {
    // Convert to array of arrays format for backend compatibility
    const workoutsArrayOfArrays = workouts.map(day => day.exercises);
    
    const fullModel = {
      ...templateData,
      ...formData,
      dayNames: workouts.map(day => day.name),
      workouts: workoutsArrayOfArrays,
    };
    console.log("=== FULL WORKOUT MODEL ===");
    console.log(JSON.stringify(fullModel, null, 2));
    console.log("=== WORKOUTS ARRAY (array of arrays) ===");
    console.log(workoutsArrayOfArrays);
    toast({ title: "Workouts Saved", description: "Check console for full model data" });
  };

  const getTotalExercises = () => workouts.reduce((sum, day) => sum + day.exercises.length, 0);

  // Sample client data - in a real app this would come from member selection
  const [selectedClient, setSelectedClient] = useState({
    name: "John Smith",
    memberId: "MEM-001",
    phone: "+1 234 567 890",
    email: "john.smith@email.com",
    membership: "Premium",
    branch: "Downtown",
  });

  const generatePDF = () => {
    const doc = generateWorkoutPDF({
      name: formData.name,
      category: formData.category,
      difficulty: formData.difficulty,
      duration: formData.duration,
      description: formData.description,
      targetMuscles: formData.targetMuscles,
      days: workouts,
      client: selectedClient,
      trainerName: "Mike Johnson",
      startDate: new Date().toLocaleDateString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    });
    
    doc.save(`${formData.name.replace(/\s+/g, "_")}_workout.pdf`);
    toast({ title: "PDF Generated", description: "Professional workout routine has been downloaded" });
  };

  // Details Tab
  const DetailsTab = (
    <div className="space-y-6">
      <SectionHeader 
        title="Template Information"
        action={
          !isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-1" />
              {t('common.edit')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                {t('common.save')}
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Template Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!isEditing}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Strength">Strength</SelectItem>
              <SelectItem value="Cardio">Cardio</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Flexibility">Flexibility</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as typeof formData.difficulty }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Duration
          </Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            disabled={!isEditing}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Target Muscles
          </Label>
          <Input
            value={formData.targetMuscles}
            onChange={(e) => setFormData(prev => ({ ...prev, targetMuscles: e.target.value }))}
            disabled={!isEditing}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Rest Between Sets</Label>
          <Input
            value={formData.restBetweenSets}
            onChange={(e) => setFormData(prev => ({ ...prev, restBetweenSets: e.target.value }))}
            disabled={!isEditing}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          disabled={!isEditing}
          className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30 min-h-[80px]"
        />
      </div>

      <SectionHeader title="Timing" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Warmup</p>
          <p className="text-lg font-bold text-card-foreground">{formData.warmupDuration}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Workout</p>
          <p className="text-lg font-bold text-card-foreground">{formData.duration}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Cooldown</p>
          <p className="text-lg font-bold text-card-foreground">{formData.cooldownDuration}</p>
        </div>
      </div>
    </div>
  );

  // Exercises Tab with Days
  const ExercisesTab = (
    <div className="space-y-4">
      <SectionHeader 
        title={`Workout Program (${workouts.length} Days, ${getTotalExercises()} Exercises)`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={generatePDF}>
              <FileDown className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={addDay}>
              <Calendar className="w-4 h-4 mr-1" />
              Add Day
            </Button>
            <Button size="sm" onClick={saveAllWorkouts}>
              <Save className="w-4 h-4 mr-1" />
              Save All
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {workouts.map((day, dayIndex) => (
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
                        <th className="p-2 w-8"></th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-10">#</th>
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
                          onDragStart={(idx) => handleExerciseDragStart(dayIndex, idx)}
                          onDragOver={(e, idx) => handleExerciseDragOver(dayIndex, e, idx)}
                          onDragEnd={() => handleExerciseDragEnd(dayIndex)}
                          isDragging={dragState?.dayIndex === dayIndex && dragState?.fromIndex === exerciseIndex}
                          isDragOver={dragState?.dayIndex === dayIndex && dragState?.overIndex === exerciseIndex}
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
    </div>
  );

  // Usage Tab
  const UsageTab = (
    <div className="space-y-4">
      <SectionHeader title="Usage Statistics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Total Uses</p>
          <p className="text-2xl font-bold text-card-foreground">{templateData.usageCount}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl font-bold text-primary">12</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-success">94%</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
          <p className="text-2xl font-bold text-card-foreground">57m</p>
        </div>
      </div>

      <SectionHeader title="Recent Usage" />
      <ResponsiveTable<UsageRecord>
        data={usageData}
        columns={usageColumns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  const tabs: DetailTab[] = [
    { id: "details", label: "Details", icon: <ClipboardList className="w-4 h-4" />, content: DetailsTab },
    { id: "exercises", label: "Exercises", icon: <Dumbbell className="w-4 h-4" />, content: ExercisesTab },
    { id: "usage", label: "Usage", icon: <BarChart3 className="w-4 h-4" />, content: UsageTab },
  ];

  const difficultyStatus = templateData.difficulty === "beginner" ? "success" : templateData.difficulty === "advanced" ? "error" : "warning";

  return (
    <DetailPageTemplate
      title={templateData.name}
      subtitle={`${templateData.category} • ${workouts.length} days • ${getTotalExercises()} exercises`}
      avatar={
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
        </div>
      }
      badge={
        <StatusBadge 
          status={difficultyStatus} 
          label={templateData.difficulty.charAt(0).toUpperCase() + templateData.difficulty.slice(1)} 
        />
      }
      tabs={tabs}
      defaultTab="exercises"
      backPath="/master-data/workouts"
      headerActions={[
        { label: "Start Workout", icon: <Play className="w-4 h-4" />, onClick: () => toast({ title: "Starting workout..." }) },
      ]}
    />
  );
}
