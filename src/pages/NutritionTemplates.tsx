import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apple, Plus, Search, Flame, Clock, Target, Users } from "lucide-react";
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

interface NutritionTemplate {
  id: number;
  name: string;
  category: string;
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "athletic";
  duration: string;
  meals: number;
  calories: string;
  createdBy: string;
  usageCount: number;
  status: "active" | "draft" | "archived";
}

const sampleTemplates: NutritionTemplate[] = [
  { id: 1, name: "Weight Loss Plan", category: "Diet", goal: "weight_loss", duration: "12 weeks", meals: 5, calories: "1800 kcal", createdBy: "Dr. Sarah Smith", usageCount: 189, status: "active" },
  { id: 2, name: "Muscle Building Diet", category: "Bodybuilding", goal: "muscle_gain", duration: "8 weeks", meals: 6, calories: "3200 kcal", createdBy: "Mike Johnson", usageCount: 156, status: "active" },
  { id: 3, name: "Balanced Nutrition", category: "General", goal: "maintenance", duration: "Ongoing", meals: 4, calories: "2200 kcal", createdBy: "Dr. Sarah Smith", usageCount: 234, status: "active" },
  { id: 4, name: "Athlete Performance", category: "Sports", goal: "athletic", duration: "16 weeks", meals: 6, calories: "3500 kcal", createdBy: "Coach David", usageCount: 98, status: "active" },
  { id: 5, name: "Keto Diet Plan", category: "Diet", goal: "weight_loss", duration: "8 weeks", meals: 4, calories: "1600 kcal", createdBy: "Dr. Sarah Smith", usageCount: 145, status: "active" },
  { id: 6, name: "Vegetarian Gains", category: "Bodybuilding", goal: "muscle_gain", duration: "12 weeks", meals: 5, calories: "2800 kcal", createdBy: "Emily Davis", usageCount: 87, status: "active" },
  { id: 7, name: "Pre-Competition Cut", category: "Bodybuilding", goal: "weight_loss", duration: "6 weeks", meals: 6, calories: "1500 kcal", createdBy: "Coach David", usageCount: 45, status: "active" },
  { id: 8, name: "New Template Draft", category: "General", goal: "maintenance", duration: "TBD", meals: 0, calories: "TBD", createdBy: "Admin", usageCount: 0, status: "draft" },
];

const columns: Column<NutritionTemplate>[] = [
  { 
    key: "name", 
    label: "Template Name", 
    priority: "always",
    render: (value: string, row: NutritionTemplate) => (
      <div>
        <p className="font-medium text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{row.category}</p>
      </div>
    )
  },
  { 
    key: "goal", 
    label: "Goal", 
    priority: "md",
    render: (value: "weight_loss" | "muscle_gain" | "maintenance" | "athletic") => {
      const labels: Record<typeof value, { label: string; status: "success" | "warning" | "error" | "info" }> = {
        weight_loss: { label: "Weight Loss", status: "error" },
        muscle_gain: { label: "Muscle Gain", status: "success" },
        maintenance: { label: "Maintenance", status: "info" },
        athletic: { label: "Athletic", status: "warning" },
      };
      return <StatusBadge status={labels[value].status} label={labels[value].label} />;
    }
  },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "meals", label: "Meals/Day", priority: "md" },
  { key: "calories", label: "Calories", priority: "lg" },
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

export default function NutritionTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    goal: "",
    duration: "",
    calories: "",
    description: "",
  });

  const filteredTemplates = sampleTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.calories.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowActions: RowAction<NutritionTemplate>[] = [
    { 
      icon: Eye, 
      label: "View", 
      onClick: (row) => navigate(`/master-data/meals/${row.id}`),
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
    setNewTemplate({ name: "", category: "", goal: "", duration: "", calories: "", description: "" });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-card-foreground">Nutrition Templates</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage diet plans and meal programs</p>
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
              <Apple className="w-5 h-5 text-primary" />
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
              <Flame className="w-5 h-5 text-success" />
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
              <p className="text-2xl font-bold text-card-foreground">2,200</p>
              <p className="text-xs text-muted-foreground">Avg Calories</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">954</p>
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
      <ResponsiveTable<NutritionTemplate>
        data={filteredTemplates}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
      />

      {/* Add Template Sheet */}
      <QuickAddSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        title="Add Nutrition Template"
        description="Create a new diet plan"
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
              placeholder="e.g., Weight Loss Plan"
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
                  <SelectItem value="Diet">Diet</SelectItem>
                  <SelectItem value="Bodybuilding">Bodybuilding</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Select
                value={newTemplate.goal}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
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
                placeholder="e.g., 12 weeks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calories</Label>
              <Input
                id="calories"
                value={newTemplate.calories}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="e.g., 2000 kcal"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the nutrition plan..."
              rows={3}
            />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
