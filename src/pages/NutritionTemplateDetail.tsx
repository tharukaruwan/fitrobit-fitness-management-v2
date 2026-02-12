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
  Apple,
  Flame, 
  Clock, 
  Target,
  Pencil, 
  Save,
  X,
  Plus,
  Trash2,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Calendar,
  Check,
  FileDown,
  User,
  Utensils,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

// MealDetails interface
interface MealDetails {
  food: string;
  portion: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  note: string;
}

// Sample template data
const templateData = {
  id: 1,
  name: "Weight Loss Plan",
  category: "Diet",
  goal: "weight_loss" as "weight_loss" | "muscle_gain" | "maintenance" | "athletic",
  duration: "12 weeks",
  targetCalories: "1800 kcal",
  description: "A comprehensive weight loss plan designed for sustainable fat loss while maintaining muscle mass.",
  createdBy: "Dr. Sarah Smith",
  createdAt: "Jan 10, 2024",
  updatedAt: "Dec 28, 2024",
  usageCount: 189,
  status: "active" as const,
  protein: "150g",
  carbs: "180g",
  fat: "60g",
  waterIntake: "3L",
};

// Day structure with name and meals
interface NutritionDay {
  name: string;
  meals: MealDetails[];
}

// Initial meals data - array of days containing meals
const initialMeals: NutritionDay[] = [
  {
    name: "Monday",
    meals: [
      { food: "Oatmeal with Berries", portion: "1 bowl", calories: "350", protein: "12g", carbs: "55g", fat: "8g", note: "Breakfast" },
      { food: "Grilled Chicken Salad", portion: "300g", calories: "420", protein: "45g", carbs: "15g", fat: "18g", note: "Lunch" },
      { food: "Greek Yogurt", portion: "200g", calories: "180", protein: "18g", carbs: "12g", fat: "6g", note: "Snack" },
      { food: "Salmon with Vegetables", portion: "350g", calories: "480", protein: "42g", carbs: "25g", fat: "22g", note: "Dinner" },
    ],
  },
  {
    name: "Tuesday",
    meals: [
      { food: "Egg White Omelet", portion: "3 eggs", calories: "280", protein: "28g", carbs: "8g", fat: "12g", note: "Breakfast" },
      { food: "Turkey Wrap", portion: "1 wrap", calories: "380", protein: "35g", carbs: "32g", fat: "14g", note: "Lunch" },
      { food: "Protein Shake", portion: "1 scoop", calories: "150", protein: "25g", carbs: "5g", fat: "2g", note: "Post-workout" },
      { food: "Lean Beef Stir Fry", portion: "300g", calories: "450", protein: "40g", carbs: "28g", fat: "20g", note: "Dinner" },
    ],
  },
  {
    name: "Wednesday",
    meals: [
      { food: "Avocado Toast", portion: "2 slices", calories: "320", protein: "10g", carbs: "35g", fat: "16g", note: "Breakfast" },
      { food: "Tuna Salad", portion: "250g", calories: "350", protein: "38g", carbs: "12g", fat: "16g", note: "Lunch" },
      { food: "Almonds", portion: "30g", calories: "180", protein: "6g", carbs: "6g", fat: "15g", note: "Snack" },
      { food: "Grilled Fish with Rice", portion: "350g", calories: "420", protein: "38g", carbs: "40g", fat: "12g", note: "Dinner" },
    ],
  },
];

interface UsageRecord {
  id: number;
  memberName: string;
  date: string;
  adherence: number;
  avgCalories: string;
  feedback: string;
}

const usageData: UsageRecord[] = [
  { id: 1, memberName: "John Smith", date: "Dec 30, 2024", adherence: 95, avgCalories: "1780 kcal", feedback: "Great plan!" },
  { id: 2, memberName: "Sarah Johnson", date: "Dec 29, 2024", adherence: 88, avgCalories: "1850 kcal", feedback: "Easy to follow" },
  { id: 3, memberName: "Mike Wilson", date: "Dec 28, 2024", adherence: 72, avgCalories: "2100 kcal", feedback: "Struggled on weekends" },
];

const usageColumns: Column<UsageRecord>[] = [
  { key: "memberName", label: "Member", priority: "always", render: (value: string) => <span className="font-medium">{value}</span> },
  { key: "date", label: "Date", priority: "always" },
  { 
    key: "adherence", 
    label: "Adherence", 
    priority: "md",
    render: (value: number) => (
      <span className={value >= 90 ? "text-success" : value >= 70 ? "text-warning" : "text-destructive"}>
        {value}%
      </span>
    )
  },
  { key: "avgCalories", label: "Avg Calories", priority: "md" },
  { key: "feedback", label: "Feedback", priority: "lg", render: (value: string) => value || <span className="text-muted-foreground">-</span> },
];

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
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

function MealRow({ 
  meal, 
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
        <td className="p-2"><GripVertical className="w-4 h-4 text-muted-foreground/30" /></td>
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
      <td className="p-2 font-medium text-card-foreground">{meal.food}</td>
      <td className="p-2 text-sm">{meal.portion}</td>
      <td className="p-2 text-sm">{meal.calories}</td>
      <td className="p-2 text-sm hidden md:table-cell">{meal.protein}</td>
      <td className="p-2 text-sm hidden lg:table-cell">{meal.carbs}</td>
      <td className="p-2 text-sm hidden lg:table-cell">{meal.fat}</td>
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

export default function NutritionTemplateDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State for details editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: templateData.name,
    category: templateData.category,
    goal: templateData.goal,
    duration: templateData.duration,
    targetCalories: templateData.targetCalories,
    description: templateData.description,
    protein: templateData.protein,
    carbs: templateData.carbs,
    fat: templateData.fat,
    waterIntake: templateData.waterIntake,
  });

  // State for meals (array of days with names and meals)
  const [meals, setMeals] = useState<NutritionDay[]>(initialMeals);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // First day expanded by default
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number } | null>(null);
  const [originalMeal, setOriginalMeal] = useState<MealDetails | null>(null);
  const [editingDayName, setEditingDayName] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{ dayIndex: number; fromIndex: number; overIndex: number } | null>(null);

  const handleMealDragStart = (dayIndex: number, index: number) => {
    setDragState({ dayIndex, fromIndex: index, overIndex: index });
  };

  const handleMealDragOver = (dayIndex: number, e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState && dragState.dayIndex === dayIndex) {
      setDragState(prev => prev ? { ...prev, overIndex: index } : null);
    }
  };

  const handleMealDragEnd = (dayIndex: number) => {
    if (dragState && dragState.dayIndex === dayIndex && dragState.fromIndex !== dragState.overIndex) {
      setMeals(prev => {
        const updated = [...prev];
        const dayMeals = [...updated[dayIndex].meals];
        const [moved] = dayMeals.splice(dragState.fromIndex, 1);
        dayMeals.splice(dragState.overIndex, 0, moved);
        updated[dayIndex] = { ...updated[dayIndex], meals: dayMeals };
        return updated;
      });
      toast({ title: "Meal reordered" });
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
      goal: templateData.goal,
      duration: templateData.duration,
      targetCalories: templateData.targetCalories,
      description: templateData.description,
      protein: templateData.protein,
      carbs: templateData.carbs,
      fat: templateData.fat,
      waterIntake: templateData.waterIntake,
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
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newDayName = dayNames[meals.length % 7] || `Day ${meals.length + 1}`;
    const newDay: NutritionDay = { name: newDayName, meals: [] };
    setMeals(prev => [...prev, newDay]);
    setExpandedDays(prev => [...prev, meals.length]);
    toast({ title: "Day Added", description: `${newDayName} has been created` });
  };

  const removeDay = (dayIndex: number) => {
    if (meals.length <= 1) {
      toast({ title: "Cannot Remove", description: "At least one day is required", variant: "destructive" });
      return;
    }
    const dayName = meals[dayIndex].name;
    setMeals(prev => prev.filter((_, i) => i !== dayIndex));
    setExpandedDays(prev => prev.filter(d => d !== dayIndex).map(d => d > dayIndex ? d - 1 : d));
    toast({ title: "Day Removed", description: `${dayName} has been deleted` });
  };

  const updateDayName = (dayIndex: number, newName: string) => {
    setMeals(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], name: newName };
      return updated;
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
    setMeals(prev => {
      const updated = [...prev];
      updated[dayIndex] = { 
        ...updated[dayIndex], 
        meals: [...updated[dayIndex].meals, newMeal] 
      };
      return updated;
    });
    setEditingMeal({ dayIndex, mealIndex: meals[dayIndex].meals.length });
    setOriginalMeal(newMeal);
  };

  const updateMeal = (dayIndex: number, mealIndex: number, updated: MealDetails) => {
    setMeals(prev => {
      const newMeals = [...prev];
      newMeals[dayIndex] = {
        ...newMeals[dayIndex],
        meals: [...newMeals[dayIndex].meals]
      };
      newMeals[dayIndex].meals[mealIndex] = updated;
      return newMeals;
    });
  };

  const deleteMeal = (dayIndex: number, mealIndex: number) => {
    setMeals(prev => {
      const newMeals = [...prev];
      newMeals[dayIndex] = {
        ...newMeals[dayIndex],
        meals: newMeals[dayIndex].meals.filter((_, i) => i !== mealIndex)
      };
      return newMeals;
    });
    toast({ title: "Meal Removed" });
  };

  const startEditMeal = (dayIndex: number, mealIndex: number) => {
    setEditingMeal({ dayIndex, mealIndex });
    setOriginalMeal({ ...meals[dayIndex].meals[mealIndex] });
  };

  const cancelEditMeal = () => {
    if (editingMeal && originalMeal) {
      // If it was a new empty meal, remove it
      if (!originalMeal.food) {
        setMeals(prev => {
          const newMeals = [...prev];
          newMeals[editingMeal.dayIndex] = {
            ...newMeals[editingMeal.dayIndex],
            meals: newMeals[editingMeal.dayIndex].meals.filter(
              (_, i) => i !== editingMeal.mealIndex
            )
          };
          return newMeals;
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

  const saveAllMeals = () => {
    const mealsArrayOfArrays = meals.map(day => day.meals);
    
    const fullModel = {
      ...templateData,
      ...formData,
      dayNames: meals.map(day => day.name),
      meals: mealsArrayOfArrays,
    };
    console.log("=== FULL NUTRITION MODEL ===");
    console.log(JSON.stringify(fullModel, null, 2));
    toast({ title: "Meals Saved", description: "Check console for full model data" });
  };

  const getTotalMeals = () => meals.reduce((sum, day) => sum + day.meals.length, 0);

  // Sample client data
  const [selectedClient] = useState({
    name: "John Smith",
    memberId: "MEM-001",
    phone: "+1 234 567 890",
    email: "john.smith@email.com",
    membership: "Premium",
    branch: "Downtown",
  });

  const generatePDF = () => {
    toast({ title: "PDF Generated", description: "Nutrition plan has been downloaded" });
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
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue />
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
          <Label className="text-xs text-muted-foreground">Goal</Label>
          <Select
            value={formData.goal}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, goal: value }))}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight_loss">Weight Loss</SelectItem>
              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="athletic">Athletic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Duration</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Target Calories</Label>
          <Input
            value={formData.targetCalories}
            onChange={(e) => setFormData(prev => ({ ...prev, targetCalories: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Water Intake</Label>
          <Input
            value={formData.waterIntake}
            onChange={(e) => setFormData(prev => ({ ...prev, waterIntake: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          disabled={!isEditing}
          rows={3}
        />
      </div>

      <SectionHeader title="Macronutrients" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Protein (daily)</Label>
          <Input
            value={formData.protein}
            onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Carbohydrates (daily)</Label>
          <Input
            value={formData.carbs}
            onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Fat (daily)</Label>
          <Input
            value={formData.fat}
            onChange={(e) => setFormData(prev => ({ ...prev, fat: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
      </div>

      <SectionHeader title="Template Stats" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-card-foreground">{templateData.usageCount}</p>
          <p className="text-xs text-muted-foreground">Times Used</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-card-foreground">{meals.length}</p>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-card-foreground">{getTotalMeals()}</p>
          <p className="text-xs text-muted-foreground">Total Meals</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <StatusBadge 
            status={templateData.status === "active" ? "success" : "warning"} 
            label={templateData.status} 
          />
          <p className="text-xs text-muted-foreground mt-1">Status</p>
        </div>
      </div>
    </div>
  );

  // Meals Tab
  const MealsTab = (
    <div className="space-y-6">
      <SectionHeader 
        title="Meal Plan"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generatePDF}>
              <FileDown className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={saveAllMeals}>
              <Save className="w-4 h-4 mr-1" />
              Save All
            </Button>
            <Button size="sm" onClick={addDay}>
              <Plus className="w-4 h-4 mr-1" />
              Add Day
            </Button>
          </div>
        }
      />

      {/* Client Info Card */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-card-foreground">{selectedClient.name}</p>
            <p className="text-sm text-muted-foreground">{selectedClient.memberId} • {selectedClient.membership}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-card-foreground">{selectedClient.email}</p>
            <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
          </div>
        </div>
      </div>

      {/* Days Accordion */}
      <div className="space-y-3">
        {meals.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {/* Day Header */}
            <div 
              className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                expandedDays.includes(dayIndex) ? "bg-primary/5" : "hover:bg-muted/50"
              )}
              onClick={() => toggleDay(dayIndex)}
            >
              <div className="flex items-center gap-3">
                {expandedDays.includes(dayIndex) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                {editingDayName === dayIndex ? (
                  <Input
                    value={day.name}
                    onChange={(e) => updateDayName(dayIndex, e.target.value)}
                    onBlur={() => setEditingDayName(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingDayName(null)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-40"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="font-medium text-card-foreground cursor-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDayName(dayIndex);
                    }}
                  >
                    {day.name}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  ({day.meals.length} meals)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    addMeal(dayIndex);
                    if (!expandedDays.includes(dayIndex)) {
                      setExpandedDays(prev => [...prev, dayIndex]);
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDay(dayIndex);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Day Content */}
            {expandedDays.includes(dayIndex) && (
              <div className="px-4 pb-4">
                {day.meals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No meals added yet</p>
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
                  <div className="overflow-x-auto -mx-4">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="p-2 w-8"></th>
                          <th className="p-2 text-center w-10">#</th>
                          <th className="p-2 text-left">Food</th>
                          <th className="p-2 text-left">Portion</th>
                          <th className="p-2 text-left">Kcal</th>
                          <th className="p-2 text-left hidden md:table-cell">Protein</th>
                          <th className="p-2 text-left hidden lg:table-cell">Carbs</th>
                          <th className="p-2 text-left hidden lg:table-cell">Fat</th>
                          <th className="p-2 text-left hidden xl:table-cell">Note</th>
                          <th className="p-2 text-center w-20">Actions</th>
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
                            onDragStart={(idx) => handleMealDragStart(dayIndex, idx)}
                            onDragOver={(e, idx) => handleMealDragOver(dayIndex, e, idx)}
                            onDragEnd={() => handleMealDragEnd(dayIndex)}
                            isDragging={dragState?.dayIndex === dayIndex && dragState?.fromIndex === mealIndex}
                            isDragOver={dragState?.dayIndex === dayIndex && dragState?.overIndex === mealIndex}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
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
    <div className="space-y-6">
      <SectionHeader title="Usage History" />
      <ResponsiveTable<UsageRecord>
        data={usageData}
        columns={usageColumns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  const tabs: DetailTab[] = [
    { id: "details", label: "Details", icon: <Apple className="w-4 h-4" />, content: DetailsTab },
    { id: "meals", label: "Meals", icon: <Utensils className="w-4 h-4" />, content: MealsTab },
    { id: "usage", label: "Usage", icon: <BarChart3 className="w-4 h-4" />, content: UsageTab },
  ];

  return (
    <DetailPageTemplate
      title={formData.name}
      subtitle={`${formData.category} • ${formData.goal.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}`}
      backPath="/master-data/meals"
      tabs={tabs}
      defaultTab="details"
      avatar={
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Apple className="w-8 h-8 text-primary" />
        </div>
      }
    />
  );
}
