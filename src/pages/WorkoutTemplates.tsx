import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, Search, Dumbbell, Clock, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Eye, Pencil, Copy, Trash2 } from "lucide-react";

interface WorkoutTemplate {
  id: number;
  name: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  exercises: number;
  targetMuscles: string;
  createdBy: string;
  usageCount: number;
  status: "active" | "draft" | "archived";
}

const sampleTemplates: WorkoutTemplate[] = [
  { id: 1, name: "Full Body Strength", category: "Strength", difficulty: "intermediate", duration: "60 min", exercises: 12, targetMuscles: "Full Body", createdBy: "Mike Johnson", usageCount: 156, status: "active" },
  { id: 2, name: "HIIT Cardio Blast", category: "Cardio", difficulty: "advanced", duration: "30 min", exercises: 8, targetMuscles: "Full Body", createdBy: "Sarah Williams", usageCount: 203, status: "active" },
  { id: 3, name: "Upper Body Focus", category: "Strength", difficulty: "intermediate", duration: "45 min", exercises: 10, targetMuscles: "Chest, Back, Arms", createdBy: "Mike Johnson", usageCount: 89, status: "active" },
  { id: 4, name: "Leg Day Essentials", category: "Strength", difficulty: "intermediate", duration: "50 min", exercises: 9, targetMuscles: "Legs, Glutes", createdBy: "David Chen", usageCount: 124, status: "active" },
  { id: 5, name: "Core & Abs Burner", category: "Core", difficulty: "beginner", duration: "25 min", exercises: 6, targetMuscles: "Core, Abs", createdBy: "Sarah Williams", usageCount: 178, status: "active" },
  { id: 6, name: "Beginner Full Body", category: "General", difficulty: "beginner", duration: "40 min", exercises: 8, targetMuscles: "Full Body", createdBy: "Mike Johnson", usageCount: 312, status: "active" },
  { id: 7, name: "Advanced Power Lifting", category: "Strength", difficulty: "advanced", duration: "75 min", exercises: 6, targetMuscles: "Full Body", createdBy: "David Chen", usageCount: 67, status: "active" },
  { id: 8, name: "Yoga & Flexibility", category: "Flexibility", difficulty: "beginner", duration: "45 min", exercises: 15, targetMuscles: "Full Body", createdBy: "Emily Davis", usageCount: 145, status: "active" },
  { id: 9, name: "New Template Draft", category: "Strength", difficulty: "intermediate", duration: "50 min", exercises: 0, targetMuscles: "TBD", createdBy: "Admin", usageCount: 0, status: "draft" },
];

const columns: Column<WorkoutTemplate>[] = [
  { 
    key: "name", 
    label: "Template Name", 
    priority: "always",
    render: (value: string, row: WorkoutTemplate) => (
      <div>
        <p className="font-medium text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{row.category}</p>
      </div>
    )
  },
  { 
    key: "difficulty", 
    label: "Difficulty", 
    priority: "md",
    render: (value: "beginner" | "intermediate" | "advanced") => (
      <StatusBadge 
        status={value === "beginner" ? "success" : value === "intermediate" ? "warning" : "error"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "exercises", label: "Exercises", priority: "md" },
  { key: "targetMuscles", label: "Target", priority: "lg" },
  { key: "usageCount", label: "Used", priority: "md", render: (value: number) => <span className="font-medium">{value}x</span> },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "active" | "draft" | "archived") => (
      <StatusBadge 
        status={value === "active" ? "success" : value === "draft" ? "warning" : "neutral"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

export default function WorkoutTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    difficulty: "",
    duration: "",
    targetMuscles: "",
    description: "",
  });

  const filteredTemplates = sampleTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.targetMuscles.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowActions: RowAction<WorkoutTemplate>[] = [
    { 
      icon: Eye, 
      label: "View", 
      onClick: (row) => navigate(`/master-data/workouts/${row.id}`),
      variant: "default" 
    },
    { 
      icon: Pencil, 
      label: "Edit", 
      onClick: (row) => toast({ title: "Edit Template", description: `Editing ${row.name}` }),
      variant: "default" 
    },
    { 
      icon: Copy, 
      label: "Duplicate", 
      onClick: (row) => toast({ title: "Template Duplicated", description: `${row.name} has been copied` }),
      variant: "default" 
    },
    { 
      icon: Trash2, 
      label: "Delete", 
      onClick: (row) => toast({ title: "Template Deleted", description: `${row.name} has been removed`, variant: "destructive" }),
      variant: "danger" 
    },
  ];

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.category) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Template Created", description: `${newTemplate.name} has been added` });
    setIsAddSheetOpen(false);
    setNewTemplate({ name: "", category: "", difficulty: "", duration: "", targetMuscles: "", description: "" });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-card-foreground">Workout Templates</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage exercise programs and routines</p>
          </div>
        </div>
        <Button onClick={() => setIsAddSheetOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{sampleTemplates.length}</p>
              <p className="text-xs text-muted-foreground">Total Templates</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{sampleTemplates.filter(t => t.status === "active").length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">45m</p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">1,274</p>
              <p className="text-xs text-muted-foreground">Total Uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <ResponsiveTable<WorkoutTemplate>
        data={filteredTemplates}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
      />

      {/* Add Template Sheet */}
      <QuickAddSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        title="Add Workout Template"
        description="Create a new workout program"
        onSubmit={handleAddTemplate}
        submitLabel={t('common.save')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Full Body Strength"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={newTemplate.category}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={newTemplate.difficulty}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={newTemplate.duration}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 45 min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMuscles">Target Muscles</Label>
              <Input
                id="targetMuscles"
                value={newTemplate.targetMuscles}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, targetMuscles: e.target.value }))}
                placeholder="e.g., Chest, Back"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the workout program..."
              rows={3}
            />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
