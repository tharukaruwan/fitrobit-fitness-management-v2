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
import { generateNutritionPDF } from "@/lib/pdf-utils";
import {
  Plus,
  Apple,
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
  Utensils,
  FileText,
  User
} from "lucide-react";

// MealDetails interface matching template structure
interface MealDetails {
  food: string;
  portion: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  note: string;
}

interface NutritionDay {
  name: string;
  meals: MealDetails[];
}

interface CurrentDietPlan {
  name: string;
  startDate: Date;
  endDate: Date;
  targetCalories: string;
  assignedBy: string;
  days: NutritionDay[];
}

interface HistoryDietPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "completed" | "expired";
  targetCalories: string;
  adherence: number;
  assignedBy: string;
  days: NutritionDay[];
}

// Inline editable meal row component
interface MealRowProps {
  meal: MealDetails;
  index: number;
  isEditing: boolean;
  onUpdate: (updated: MealDetails) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

function MealRow({ 
  meal, 
  index, 
  isEditing, 
  onUpdate, 
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: MealRowProps) {
  const [editData, setEditData] = useState<MealDetails>(meal);

  const handleChange = (field: keyof MealDetails, value: string) => {
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
            value={editData.food}
            onChange={(e) => handleChange("food", e.target.value)}
            placeholder="Food item"
            className="h-8 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            value={editData.portion}
            onChange={(e) => handleChange("portion", e.target.value)}
            placeholder="Portion"
            className="h-8 text-sm w-20"
          />
        </td>
        <td className="p-2">
          <Input
            value={editData.calories}
            onChange={(e) => handleChange("calories", e.target.value)}
            placeholder="Kcal"
            className="h-8 text-sm w-16"
          />
        </td>
        <td className="p-2 hidden md:table-cell">
          <Input
            value={editData.protein}
            onChange={(e) => handleChange("protein", e.target.value)}
            placeholder="Protein"
            className="h-8 text-sm w-16"
          />
        </td>
        <td className="p-2 hidden lg:table-cell">
          <Input
            value={editData.carbs}
            onChange={(e) => handleChange("carbs", e.target.value)}
            placeholder="Carbs"
            className="h-8 text-sm w-16"
          />
        </td>
        <td className="p-2 hidden lg:table-cell">
          <Input
            value={editData.fat}
            onChange={(e) => handleChange("fat", e.target.value)}
            placeholder="Fat"
            className="h-8 text-sm w-16"
          />
        </td>
        <td className="p-2 hidden xl:table-cell">
          <Input
            value={editData.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Notes"
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
      <td className="p-2 font-medium text-card-foreground">{meal.food || <span className="text-muted-foreground italic">Untitled</span>}</td>
      <td className="p-2 text-sm">{meal.portion || "-"}</td>
      <td className="p-2 text-sm">{meal.calories || "-"}</td>
      <td className="p-2 text-sm hidden md:table-cell">{meal.protein || "-"}</td>
      <td className="p-2 text-sm hidden lg:table-cell">{meal.carbs || "-"}</td>
      <td className="p-2 text-sm hidden lg:table-cell">{meal.fat || "-"}</td>
      <td className="p-2 text-sm text-muted-foreground hidden xl:table-cell">{meal.note || "-"}</td>
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
const dietTemplates = [
  { id: "1", name: "Weight Loss Plan", goal: "Weight Loss", calories: "1800" },
  { id: "2", name: "Muscle Gain Diet", goal: "Muscle Gain", calories: "2800" },
  { id: "3", name: "Maintenance Plan", goal: "Maintenance", calories: "2200" },
  { id: "4", name: "Keto Diet", goal: "Fat Loss", calories: "1600" },
];

// Template day data for loading
const getTemplateDays = (templateId: string): NutritionDay[] => {
  const templates: Record<string, NutritionDay[]> = {
    "1": [
      {
        name: "Monday",
        meals: [
          { food: "Oatmeal with Berries", portion: "1 bowl", calories: "350", protein: "12", carbs: "55", fat: "8", note: "Breakfast" },
          { food: "Grilled Chicken Salad", portion: "300g", calories: "420", protein: "45", carbs: "15", fat: "18", note: "Lunch" },
          { food: "Salmon with Vegetables", portion: "350g", calories: "480", protein: "42", carbs: "25", fat: "22", note: "Dinner" },
        ],
      },
      {
        name: "Tuesday",
        meals: [
          { food: "Egg White Omelet", portion: "3 eggs", calories: "280", protein: "28", carbs: "8", fat: "12", note: "Breakfast" },
          { food: "Turkey Wrap", portion: "1 wrap", calories: "380", protein: "35", carbs: "32", fat: "14", note: "Lunch" },
        ],
      },
    ],
    "2": [
      {
        name: "Day 1",
        meals: [
          { food: "Protein Pancakes", portion: "3 pancakes", calories: "520", protein: "35", carbs: "60", fat: "15", note: "Breakfast" },
          { food: "Chicken Rice Bowl", portion: "400g", calories: "650", protein: "50", carbs: "70", fat: "18", note: "Lunch" },
        ],
      },
    ],
    "3": [
      {
        name: "Daily Plan",
        meals: [
          { food: "Greek Yogurt Parfait", portion: "300g", calories: "380", protein: "25", carbs: "45", fat: "12", note: "Breakfast" },
          { food: "Mixed Grain Salad", portion: "350g", calories: "450", protein: "20", carbs: "55", fat: "16", note: "Lunch" },
        ],
      },
    ],
    "4": [
      {
        name: "Keto Day",
        meals: [
          { food: "Avocado Eggs", portion: "2 eggs + 1 avocado", calories: "420", protein: "18", carbs: "8", fat: "38", note: "Breakfast" },
          { food: "Keto Salad with Olive Oil", portion: "300g", calories: "380", protein: "25", carbs: "6", fat: "32", note: "Lunch" },
        ],
      },
    ],
  };
  return templates[templateId] || [];
};

// Sample history plans
const sampleHistoryPlans: HistoryDietPlan[] = [
  {
    id: "dp-hist-1",
    name: "Muscle Gain Diet",
    startDate: new Date(2024, 9, 1),
    endDate: new Date(2024, 9, 30),
    status: "completed",
    targetCalories: "2800",
    adherence: 85,
    assignedBy: "Nutritionist Lisa",
    days: [
      {
        name: "Day 1",
        meals: [
          { food: "Protein Pancakes", portion: "3 pancakes", calories: "520", protein: "35", carbs: "60", fat: "15", note: "Breakfast" },
          { food: "Chicken Rice Bowl", portion: "400g", calories: "650", protein: "50", carbs: "70", fat: "18", note: "Lunch" },
        ],
      },
    ],
  },
  {
    id: "dp-hist-2",
    name: "Maintenance Plan",
    startDate: new Date(2024, 7, 1),
    endDate: new Date(2024, 8, 30),
    status: "completed",
    targetCalories: "2200",
    adherence: 72,
    assignedBy: "Coach Mike",
    days: [],
  },
  {
    id: "dp-hist-3",
    name: "Keto Diet Trial",
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 6, 15),
    status: "expired",
    targetCalories: "1600",
    adherence: 45,
    assignedBy: "Nutritionist Lisa",
    days: [],
  },
];

interface EmployeeDietTabProps {
  memberId: string;
  memberName: string;
}

export function EmployeeDietTab({ memberId, memberName }: EmployeeDietTabProps) {
  const { toast } = useToast();

  // Current plan - directly editable
  const [currentPlan, setCurrentPlan] = useState<CurrentDietPlan>({
    name: "Weight Loss Plan (Customized)",
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 31),
    targetCalories: "1800",
    assignedBy: "Nutritionist Lisa",
    days: [
      {
        name: "Monday",
        meals: [
          { food: "Oatmeal with Berries", portion: "1 bowl", calories: "350", protein: "12", carbs: "55", fat: "8", note: "Breakfast" },
          { food: "Grilled Chicken Salad", portion: "300g", calories: "420", protein: "45", carbs: "15", fat: "18", note: "Lunch" },
        ],
      },
      {
        name: "Tuesday",
        meals: [
          { food: "Egg White Omelet", portion: "3 eggs", calories: "280", protein: "28", carbs: "8", fat: "12", note: "Breakfast" },
          { food: "Turkey Wrap", portion: "1 wrap", calories: "380", protein: "35", carbs: "32", fat: "14", note: "Lunch" },
        ],
      },
    ],
  });

  const [historyPlans] = useState<HistoryDietPlan[]>(sampleHistoryPlans);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [selectedHistoryPlan, setSelectedHistoryPlan] = useState<HistoryDietPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // First day expanded by default
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number } | null>(null);
  const [originalMeal, setOriginalMeal] = useState<MealDetails | null>(null);
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Paginated history
  const { paginatedData, paginationProps } = useTableData({
    data: historyPlans,
    itemsPerPage: 5,
  });

  const historyColumns: Column<HistoryDietPlan>[] = [
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
      key: "targetCalories", 
      label: "Calories", 
      priority: "lg",
      render: (value: string) => value ? `${value} kcal` : "-"
    },
    { 
      key: "startDate", 
      label: "Period", 
      priority: "lg",
      render: (value: Date, item: HistoryDietPlan) => (
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
      key: "adherence", 
      label: "Adherence", 
      priority: "md",
      render: (value: number) => (
        <span className={cn(
          "font-medium",
          value >= 80 ? "text-success" : value >= 60 ? "text-warning" : "text-destructive"
        )}>
          {value || 0}%
        </span>
      )
    },
  ];

  const handleExportPDF = () => {
    const pdf = generateNutritionPDF({
      name: currentPlan.name,
      targetCalories: currentPlan.targetCalories,
      days: currentPlan.days,
      client: { name: memberName, memberId },
      trainerName: currentPlan.assignedBy,
      startDate: format(currentPlan.startDate, "MMM d, yyyy"),
      endDate: format(currentPlan.endDate, "MMM d, yyyy"),
    });
    pdf.save(`${memberName.replace(/\s+/g, "_")}_diet_plan.pdf`);
    toast({ title: "PDF Downloaded", description: "Diet plan exported successfully" });
  };

  const handleExportHistoryPDF = (plan: HistoryDietPlan) => {
    const pdf = generateNutritionPDF({
      name: plan.name,
      targetCalories: plan.targetCalories,
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
    const template = dietTemplates.find(t => t.id === templateId);
    if (template) {
      const templateDays = getTemplateDays(templateId);
      setCurrentPlan(prev => ({
        ...prev,
        name: template.name,
        targetCalories: template.calories,
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
      toast({ title: "Plan Saved", description: "Diet plan has been updated" });
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
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newDayName = dayNames[currentPlan.days.length % 7] || `Day ${currentPlan.days.length + 1}`;
    const newDay: NutritionDay = { name: newDayName, meals: [] };
    setCurrentPlan(prev => ({ ...prev, days: [...prev.days, newDay] }));
    setExpandedDays(prev => [...prev, currentPlan.days.length]);
    toast({ title: "Day Added", description: `${newDayName} has been created` });
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

  const addMeal = (dayIndex: number) => {
    const newMeal: MealDetails = {
      food: "",
      portion: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      note: "",
    };
    setCurrentPlan(prev => {
      const updated = [...prev.days];
      updated[dayIndex] = { 
        ...updated[dayIndex], 
        meals: [...updated[dayIndex].meals, newMeal] 
      };
      return { ...prev, days: updated };
    });
    setEditingMeal({ dayIndex, mealIndex: currentPlan.days[dayIndex].meals.length });
    setOriginalMeal(newMeal);
  };

  const updateMeal = (dayIndex: number, mealIndex: number, updated: MealDetails) => {
    setCurrentPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        meals: [...newDays[dayIndex].meals]
      };
      newDays[dayIndex].meals[mealIndex] = updated;
      return { ...prev, days: newDays };
    });
  };

  const deleteMeal = (dayIndex: number, mealIndex: number) => {
    setCurrentPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        meals: newDays[dayIndex].meals.filter((_, i) => i !== mealIndex)
      };
      return { ...prev, days: newDays };
    });
    toast({ title: "Meal Removed" });
  };

  const startEditMeal = (dayIndex: number, mealIndex: number) => {
    setEditingMeal({ dayIndex, mealIndex });
    setOriginalMeal({ ...currentPlan.days[dayIndex].meals[mealIndex] });
  };

  const cancelEditMeal = () => {
    if (editingMeal && originalMeal) {
      // If it was a new empty meal, remove it
      if (!originalMeal.food) {
        setCurrentPlan(prev => {
          const newDays = [...prev.days];
          newDays[editingMeal.dayIndex] = {
            ...newDays[editingMeal.dayIndex],
            meals: newDays[editingMeal.dayIndex].meals.filter(
              (_, i) => i !== editingMeal.mealIndex
            )
          };
          return { ...prev, days: newDays };
        });
      } else {
        // Restore original
        updateMeal(editingMeal.dayIndex, editingMeal.mealIndex, originalMeal);
      }
    }
    setEditingMeal(null);
    setOriginalMeal(null);
  };

  const saveEditMeal = () => {
    setEditingMeal(null);
    setOriginalMeal(null);
    toast({ title: "Meal Saved" });
  };

  const handleViewHistory = (plan: HistoryDietPlan) => {
    setSelectedHistoryPlan(plan);
    setShowViewSheet(true);
  };

  const getTotalMeals = () => currentPlan.days.reduce((sum, day) => sum + day.meals.length, 0);
  const getTotalCalories = () => currentPlan.days.reduce((sum, day) => 
    sum + day.meals.reduce((mealSum, meal) => mealSum + (parseInt(meal.calories) || 0), 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <SectionHeader 
        title={`Current Diet Plan (${currentPlan.days.length} Days, ${getTotalMeals()} Meals)`}
        action={
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={handleLoadTemplate}>
              <SelectTrigger className="w-[180px] h-9 rounded-[0.625rem]">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Load Template" />
              </SelectTrigger>
              <SelectContent>
                {dietTemplates.map((template) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-card rounded-xl border border-border/50">
        <div className="space-y-2 lg:col-span-2">
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
          <Label className="text-xs text-muted-foreground">Target Calories</Label>
          <div className="relative">
            <Input
              value={currentPlan.targetCalories}
              onChange={(e) => setCurrentPlan(prev => ({ ...prev, targetCalories: e.target.value }))}
              placeholder="2000"
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kcal</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Current Avg.</Label>
          <div className="h-10 px-3 flex items-center bg-muted/50 rounded-[0.625rem] border">
            <span className="text-sm font-medium">{Math.round(getTotalCalories() / (currentPlan.days.length || 1))} kcal/day</span>
          </div>
        </div>
      </div>

      {/* Date Range Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-card rounded-xl border border-border/50">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentPlan.startDate, "MMM d, yyyy")}
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
                {format(currentPlan.endDate, "MMM d, yyyy")}
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

      {/* Meal Days */}
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
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-success">{dayIndex + 1}</span>
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
                  <p className="text-xs text-muted-foreground">
                    {day.meals.length} meals • {day.meals.reduce((sum, m) => sum + (parseInt(m.calories) || 0), 0)} kcal
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8"
                  onClick={() => addMeal(dayIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Meal
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

            {/* Day Meals Table */}
            {expandedDays.includes(dayIndex) && (
              <div className="overflow-x-auto">
                {day.meals.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No meals yet</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => addMeal(dayIndex)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add First Meal
                    </Button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground w-10">#</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground">Food</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-20">Portion</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16">Kcal</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16 hidden md:table-cell">Protein</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16 hidden lg:table-cell">Carbs</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16 hidden lg:table-cell">Fat</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Note</th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.meals.map((meal, mealIndex) => (
                        <MealRow
                          key={mealIndex}
                          meal={meal}
                          index={mealIndex}
                          isEditing={editingMeal?.dayIndex === dayIndex && editingMeal?.mealIndex === mealIndex}
                          onUpdate={(updated) => updateMeal(dayIndex, mealIndex, updated)}
                          onDelete={() => deleteMeal(dayIndex, mealIndex)}
                          onStartEdit={() => startEditMeal(dayIndex, mealIndex)}
                          onCancelEdit={cancelEditMeal}
                          onSaveEdit={saveEditMeal}
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
              <span className="text-sm text-muted-foreground">Target Calories</span>
              <span className="font-medium">{selectedHistoryPlan.targetCalories} kcal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Adherence</span>
              <span className={cn(
                "font-medium",
                selectedHistoryPlan.adherence >= 80 ? "text-success" : selectedHistoryPlan.adherence >= 60 ? "text-warning" : "text-destructive"
              )}>
                {selectedHistoryPlan.adherence}%
              </span>
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
                <Label className="text-sm font-medium">Meal Days</Label>
                {selectedHistoryPlan.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-muted/20 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{day.name}</h4>
                    <div className="space-y-1">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="flex justify-between text-xs">
                          <span>{meal.food}</span>
                          <span className="text-muted-foreground">{meal.calories} kcal</span>
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
