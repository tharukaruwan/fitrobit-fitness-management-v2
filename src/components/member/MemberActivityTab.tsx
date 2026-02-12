import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Moon,
  Footprints,
  FileText,
  Plus,
  CalendarIcon,
  Clock,
  Star,
  Trash2,
  Image,
  Upload,
  Eye,
  Download,
} from "lucide-react";

interface MemberActivityTabProps {
  memberId: string;
  memberName: string;
}

// Sleep record interface
interface SleepRecord {
  id: string;
  date: Date;
  bedTime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
  isHighlighted?: boolean;
}

// Step count record interface
interface StepCountRecord {
  id: string;
  date: Date;
  steps: number;
  distance: number; // in km
  calories: number;
  activeMinutes: number;
  goal: number;
  notes?: string;
  isHighlighted?: boolean;
}

// Other activity record interface
interface OtherActivityRecord {
  id: string;
  date: Date;
  time: string;
  title: string;
  description?: string;
  category: string;
  attachmentType?: "image" | "document" | "none";
  attachmentUrl?: string;
  attachmentName?: string;
  isHighlighted?: boolean;
}

// Sample data for sleep records
const initialSleepRecords: SleepRecord[] = [
  { id: "sleep-1", date: new Date(2025, 0, 30), bedTime: "22:30", wakeTime: "06:30", duration: 8, quality: "excellent", notes: "Deep sleep, no interruptions" },
  { id: "sleep-2", date: new Date(2025, 0, 29), bedTime: "23:00", wakeTime: "06:00", duration: 7, quality: "good" },
  { id: "sleep-3", date: new Date(2025, 0, 28), bedTime: "00:30", wakeTime: "07:00", duration: 6.5, quality: "fair", notes: "Late night, woke up tired" },
  { id: "sleep-4", date: new Date(2025, 0, 27), bedTime: "22:00", wakeTime: "06:00", duration: 8, quality: "excellent" },
  { id: "sleep-5", date: new Date(2025, 0, 26), bedTime: "23:30", wakeTime: "05:30", duration: 6, quality: "poor", notes: "Insomnia, couldn't fall asleep" },
  { id: "sleep-6", date: new Date(2025, 0, 25), bedTime: "22:15", wakeTime: "06:15", duration: 8, quality: "good" },
  { id: "sleep-7", date: new Date(2025, 0, 24), bedTime: "21:45", wakeTime: "05:45", duration: 8, quality: "excellent", isHighlighted: true },
  { id: "sleep-8", date: new Date(2025, 0, 23), bedTime: "23:00", wakeTime: "06:30", duration: 7.5, quality: "good" },
];

// Sample data for step count records
const initialStepCountRecords: StepCountRecord[] = [
  { id: "steps-1", date: new Date(2025, 0, 30), steps: 12500, distance: 9.2, calories: 420, activeMinutes: 85, goal: 10000 },
  { id: "steps-2", date: new Date(2025, 0, 29), steps: 8900, distance: 6.5, calories: 310, activeMinutes: 62, goal: 10000 },
  { id: "steps-3", date: new Date(2025, 0, 28), steps: 15200, distance: 11.1, calories: 530, activeMinutes: 105, goal: 10000, notes: "Morning hike", isHighlighted: true },
  { id: "steps-4", date: new Date(2025, 0, 27), steps: 7600, distance: 5.6, calories: 265, activeMinutes: 53, goal: 10000 },
  { id: "steps-5", date: new Date(2025, 0, 26), steps: 10200, distance: 7.5, calories: 355, activeMinutes: 71, goal: 10000 },
  { id: "steps-6", date: new Date(2025, 0, 25), steps: 9800, distance: 7.2, calories: 340, activeMinutes: 68, goal: 10000 },
  { id: "steps-7", date: new Date(2025, 0, 24), steps: 11400, distance: 8.4, calories: 395, activeMinutes: 79, goal: 10000 },
  { id: "steps-8", date: new Date(2025, 0, 23), steps: 6500, distance: 4.8, calories: 225, activeMinutes: 45, goal: 10000, notes: "Rest day" },
];

// Sample data for other activity records
const initialOtherRecords: OtherActivityRecord[] = [
  { id: "other-1", date: new Date(2025, 0, 30), time: "08:00", title: "Blood Pressure Reading", description: "120/80 mmHg - Normal", category: "Health Check" },
  { id: "other-2", date: new Date(2025, 0, 29), time: "14:30", title: "Supplement Photo", description: "New protein supplement started", category: "Supplements", attachmentType: "image", attachmentUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200", attachmentName: "protein.jpg" },
  { id: "other-3", date: new Date(2025, 0, 28), time: "10:00", title: "Doctor's Note", description: "Cleared for heavy lifting", category: "Medical", attachmentType: "document", attachmentName: "clearance.pdf" },
  { id: "other-4", date: new Date(2025, 0, 27), time: "19:00", title: "Hydration Log", description: "3.5L water intake", category: "Nutrition" },
  { id: "other-5", date: new Date(2025, 0, 26), time: "07:00", title: "Morning Stretching", description: "15 min yoga routine", category: "Wellness", isHighlighted: true },
  { id: "other-6", date: new Date(2025, 0, 25), time: "16:00", title: "Heart Rate Log", description: "Resting HR: 58 bpm", category: "Health Check" },
];

const sleepQualityColors: Record<string, string> = {
  poor: "text-destructive",
  fair: "text-warning",
  good: "text-primary",
  excellent: "text-green-500",
};

export function MemberActivityTab({ memberId, memberName }: MemberActivityTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("sleep");
  
  // Sleep state
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>(initialSleepRecords);
  const [sleepPage, setCurrentSleepPage] = useState(1);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [newSleepDate, setNewSleepDate] = useState<Date>(new Date());
  const [newSleepBedTime, setNewSleepBedTime] = useState("22:00");
  const [newSleepWakeTime, setNewSleepWakeTime] = useState("06:00");
  const [newSleepQuality, setNewSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [newSleepNotes, setNewSleepNotes] = useState("");

  // Step count state
  const [stepCountRecords, setStepCountRecords] = useState<StepCountRecord[]>(initialStepCountRecords);
  const [stepPage, setCurrentStepPage] = useState(1);
  const [showAddSteps, setShowAddSteps] = useState(false);
  const [newStepsDate, setNewStepsDate] = useState<Date>(new Date());
  const [newSteps, setNewSteps] = useState("");
  const [newDistance, setNewDistance] = useState("");
  const [newCalories, setNewCalories] = useState("");
  const [newActiveMinutes, setNewActiveMinutes] = useState("");
  const [newStepsGoal, setNewStepsGoal] = useState("10000");
  const [newStepsNotes, setNewStepsNotes] = useState("");

  // Other activity state
  const [otherRecords, setOtherRecords] = useState<OtherActivityRecord[]>(initialOtherRecords);
  const [otherPage, setCurrentOtherPage] = useState(1);
  const [showAddOther, setShowAddOther] = useState(false);
  const [newOtherDate, setNewOtherDate] = useState<Date>(new Date());
  const [newOtherTime, setNewOtherTime] = useState("12:00");
  const [newOtherTitle, setNewOtherTitle] = useState("");
  const [newOtherDescription, setNewOtherDescription] = useState("");
  const [newOtherCategory, setNewOtherCategory] = useState("Health Check");
  const [newOtherAttachmentType, setNewOtherAttachmentType] = useState<"image" | "document" | "none">("none");

  const itemsPerPage = 5;

  // Calculate sleep duration
  const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedTime.split(":").map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Next day
    }
    
    return Math.round((wakeMinutes - bedMinutes) / 60 * 10) / 10;
  };

  // Sleep handlers
  const handleAddSleep = () => {
    const duration = calculateSleepDuration(newSleepBedTime, newSleepWakeTime);
    const newRecord: SleepRecord = {
      id: `sleep-${Date.now()}`,
      date: newSleepDate,
      bedTime: newSleepBedTime,
      wakeTime: newSleepWakeTime,
      duration,
      quality: newSleepQuality,
      notes: newSleepNotes || undefined,
    };
    setSleepRecords(prev => [newRecord, ...prev]);
    setShowAddSleep(false);
    resetSleepForm();
    toast({ title: "Sleep Record Added", description: `${duration}h of sleep logged for ${format(newSleepDate, "MMM d, yyyy")}` });
  };

  const resetSleepForm = () => {
    setNewSleepDate(new Date());
    setNewSleepBedTime("22:00");
    setNewSleepWakeTime("06:00");
    setNewSleepQuality("good");
    setNewSleepNotes("");
  };

  const handleDeleteSleep = (id: string) => {
    setSleepRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "Record Deleted", description: "Sleep record removed." });
  };

  const handleToggleSleepHighlight = (id: string) => {
    setSleepRecords(prev => prev.map(r => r.id === id ? { ...r, isHighlighted: !r.isHighlighted } : r));
  };

  // Step count handlers
  const handleAddSteps = () => {
    const newRecord: StepCountRecord = {
      id: `steps-${Date.now()}`,
      date: newStepsDate,
      steps: parseInt(newSteps) || 0,
      distance: parseFloat(newDistance) || 0,
      calories: parseInt(newCalories) || 0,
      activeMinutes: parseInt(newActiveMinutes) || 0,
      goal: parseInt(newStepsGoal) || 10000,
      notes: newStepsNotes || undefined,
    };
    setStepCountRecords(prev => [newRecord, ...prev]);
    setShowAddSteps(false);
    resetStepsForm();
    toast({ title: "Step Count Added", description: `${newRecord.steps.toLocaleString()} steps logged for ${format(newStepsDate, "MMM d, yyyy")}` });
  };

  const resetStepsForm = () => {
    setNewStepsDate(new Date());
    setNewSteps("");
    setNewDistance("");
    setNewCalories("");
    setNewActiveMinutes("");
    setNewStepsGoal("10000");
    setNewStepsNotes("");
  };

  const handleDeleteSteps = (id: string) => {
    setStepCountRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "Record Deleted", description: "Step count record removed." });
  };

  const handleToggleStepsHighlight = (id: string) => {
    setStepCountRecords(prev => prev.map(r => r.id === id ? { ...r, isHighlighted: !r.isHighlighted } : r));
  };

  // Other activity handlers
  const handleAddOther = () => {
    const newRecord: OtherActivityRecord = {
      id: `other-${Date.now()}`,
      date: newOtherDate,
      time: newOtherTime,
      title: newOtherTitle,
      description: newOtherDescription || undefined,
      category: newOtherCategory,
      attachmentType: newOtherAttachmentType,
    };
    setOtherRecords(prev => [newRecord, ...prev]);
    setShowAddOther(false);
    resetOtherForm();
    toast({ title: "Activity Added", description: `"${newOtherTitle}" logged for ${format(newOtherDate, "MMM d, yyyy")}` });
  };

  const resetOtherForm = () => {
    setNewOtherDate(new Date());
    setNewOtherTime("12:00");
    setNewOtherTitle("");
    setNewOtherDescription("");
    setNewOtherCategory("Health Check");
    setNewOtherAttachmentType("none");
  };

  const handleDeleteOther = (id: string) => {
    setOtherRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "Record Deleted", description: "Activity record removed." });
  };

  const handleToggleOtherHighlight = (id: string) => {
    setOtherRecords(prev => prev.map(r => r.id === id ? { ...r, isHighlighted: !r.isHighlighted } : r));
  };

  // Paginated data
  const paginatedSleep = useMemo(() => {
    const start = (sleepPage - 1) * itemsPerPage;
    return sleepRecords.slice(start, start + itemsPerPage);
  }, [sleepRecords, sleepPage]);

  const paginatedSteps = useMemo(() => {
    const start = (stepPage - 1) * itemsPerPage;
    return stepCountRecords.slice(start, start + itemsPerPage);
  }, [stepCountRecords, stepPage]);

  const paginatedOther = useMemo(() => {
    const start = (otherPage - 1) * itemsPerPage;
    return otherRecords.slice(start, start + itemsPerPage);
  }, [otherRecords, otherPage]);

  // Column definitions
  const sleepColumns: Column<SleepRecord>[] = [
    { 
      key: "date", 
      label: "Date", 
      priority: "always", 
      render: (val: Date, row) => (
        <span className={cn(row.isHighlighted && "font-semibold text-primary")}>
          {format(val, "MMM d, yyyy")}
        </span>
      )
    },
    { key: "bedTime", label: "Bed Time", priority: "md" },
    { key: "wakeTime", label: "Wake Time", priority: "md" },
    { 
      key: "duration", 
      label: "Duration", 
      priority: "always", 
      render: (val: number) => <span className="font-medium">{val}h</span>
    },
    { 
      key: "quality", 
      label: "Quality", 
      priority: "always", 
      render: (val: string) => (
        <span className={cn("capitalize font-medium", sleepQualityColors[val])}>
          {val}
        </span>
      )
    },
    { key: "notes", label: "Notes", priority: "lg", render: (val?: string) => val || "-" },
  ];

  const stepColumns: Column<StepCountRecord>[] = [
    { 
      key: "date", 
      label: "Date", 
      priority: "always", 
      render: (val: Date, row) => (
        <span className={cn(row.isHighlighted && "font-semibold text-primary")}>
          {format(val, "MMM d, yyyy")}
        </span>
      )
    },
    { 
      key: "steps", 
      label: "Steps", 
      priority: "always", 
      render: (val: number, row) => (
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", val >= row.goal ? "text-green-500" : "text-foreground")}>
            {val.toLocaleString()}
          </span>
          {val >= row.goal && <span className="text-xs text-green-500">✓</span>}
        </div>
      )
    },
    { key: "distance", label: "Distance", priority: "md", render: (val: number) => `${val} km` },
    { key: "calories", label: "Calories", priority: "lg", render: (val: number) => `${val} kcal` },
    { key: "activeMinutes", label: "Active", priority: "md", render: (val: number) => `${val} min` },
    { key: "notes", label: "Notes", priority: "xl", render: (val?: string) => val || "-" },
  ];

  const otherColumns: Column<OtherActivityRecord>[] = [
    { 
      key: "date", 
      label: "Date", 
      priority: "always", 
      render: (val: Date, row) => (
        <span className={cn(row.isHighlighted && "font-semibold text-primary")}>
          {format(val, "MMM d, yyyy")}
        </span>
      )
    },
    { key: "time", label: "Time", priority: "md" },
    { 
      key: "title", 
      label: "Title", 
      priority: "always", 
      render: (val: string) => <span className="font-medium">{val}</span>
    },
    { key: "category", label: "Category", priority: "md" },
    { key: "description", label: "Description", priority: "lg", render: (val?: string) => val || "-" },
    { 
      key: "attachmentType", 
      label: "Attachment", 
      priority: "md", 
      render: (val: "image" | "document" | "none" | undefined, row) => {
        if (!val || val === "none") return "-";
        return (
          <div className="flex items-center gap-1">
            {val === "image" ? <Image className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
            <span className="text-xs text-muted-foreground">{row.attachmentName || val}</span>
          </div>
        );
      }
    },
  ];

  // Row actions
  const sleepRowActions: RowAction<SleepRecord>[] = [
    { icon: Trash2, label: "Delete", onClick: (row) => handleDeleteSleep(row.id), variant: "danger" },
  ];

  const stepsRowActions: RowAction<StepCountRecord>[] = [
    { icon: Trash2, label: "Delete", onClick: (row) => handleDeleteSteps(row.id), variant: "danger" },
  ];

  const otherRowActions: RowAction<OtherActivityRecord>[] = [
    { icon: Trash2, label: "Delete", onClick: (row) => handleDeleteOther(row.id), variant: "danger" },
  ];

  // Date picker component
  const DatePickerField = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: Date; 
    onChange: (date: Date) => void;
  }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(value, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex gap-2 p-3 border-b">
              <Select
                value={value.getMonth().toString()}
                onValueChange={(v) => {
                  const newDate = new Date(value);
                  newDate.setMonth(parseInt(v));
                  onChange(newDate);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={value.getFullYear().toString()}
                onValueChange={(v) => {
                  const newDate = new Date(value);
                  newDate.setFullYear(parseInt(v));
                  onChange(newDate);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => date && onChange(date)}
              month={value}
              onMonthChange={onChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Sleep</span>
          </TabsTrigger>
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Footprints className="w-4 h-4" />
            <span className="hidden sm:inline">Step Count</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Other</span>
          </TabsTrigger>
        </TabsList>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <SectionHeader 
                title="Sleep Tracking" 
                action={
                  <Button size="sm" onClick={() => setShowAddSleep(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Record
                  </Button>
                }
              />
              
              <div className="mt-4">
                <ResponsiveTable
                  data={paginatedSleep}
                  columns={sleepColumns}
                  keyExtractor={(item) => item.id}
                  rowActions={sleepRowActions}
                  customActions={(row) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleSleepHighlight(row.id)}
                    >
                      <Star className={cn("h-4 w-4", row.isHighlighted ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                  )}
                  pagination={{
                    currentPage: sleepPage,
                    totalPages: Math.ceil(sleepRecords.length / itemsPerPage),
                    totalItems: sleepRecords.length,
                    itemsPerPage,
                    onPageChange: setCurrentSleepPage,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step Count Tab */}
        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <SectionHeader 
                title="Step Count Tracking" 
                action={
                  <Button size="sm" onClick={() => setShowAddSteps(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Record
                  </Button>
                }
              />
              
              <div className="mt-4">
                <ResponsiveTable
                  data={paginatedSteps}
                  columns={stepColumns}
                  keyExtractor={(item) => item.id}
                  rowActions={stepsRowActions}
                  customActions={(row) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleStepsHighlight(row.id)}
                    >
                      <Star className={cn("h-4 w-4", row.isHighlighted ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                  )}
                  pagination={{
                    currentPage: stepPage,
                    totalPages: Math.ceil(stepCountRecords.length / itemsPerPage),
                    totalItems: stepCountRecords.length,
                    itemsPerPage,
                    onPageChange: setCurrentStepPage,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <SectionHeader 
                title="Other Activities" 
                action={
                  <Button size="sm" onClick={() => setShowAddOther(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Record
                  </Button>
                }
              />
              
              <div className="mt-4">
                <ResponsiveTable
                  data={paginatedOther}
                  columns={otherColumns}
                  keyExtractor={(item) => item.id}
                  rowActions={otherRowActions}
                  customActions={(row) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleOtherHighlight(row.id)}
                    >
                      <Star className={cn("h-4 w-4", row.isHighlighted ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                  )}
                  pagination={{
                    currentPage: otherPage,
                    totalPages: Math.ceil(otherRecords.length / itemsPerPage),
                    totalItems: otherRecords.length,
                    itemsPerPage,
                    onPageChange: setCurrentOtherPage,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Sleep Sheet */}
      <QuickAddSheet
        open={showAddSleep}
        onOpenChange={setShowAddSleep}
        title="Add Sleep Record"
        description="Log your sleep data for tracking"
        onSubmit={handleAddSleep}
        submitLabel="Add Record"
      >
        <DatePickerField label="Date" value={newSleepDate} onChange={setNewSleepDate} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bed Time</Label>
            <Input
              type="time"
              value={newSleepBedTime}
              onChange={(e) => setNewSleepBedTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Wake Time</Label>
            <Input
              type="time"
              value={newSleepWakeTime}
              onChange={(e) => setNewSleepWakeTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sleep Quality</Label>
          <Select value={newSleepQuality} onValueChange={(v: any) => setNewSleepQuality(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Any notes about your sleep..."
            value={newSleepNotes}
            onChange={(e) => setNewSleepNotes(e.target.value)}
          />
        </div>
      </QuickAddSheet>

      {/* Add Steps Sheet */}
      <QuickAddSheet
        open={showAddSteps}
        onOpenChange={setShowAddSteps}
        title="Add Step Count"
        description="Log your daily step count and activity"
        onSubmit={handleAddSteps}
        submitLabel="Add Record"
      >
        <DatePickerField label="Date" value={newStepsDate} onChange={setNewStepsDate} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Steps</Label>
            <Input
              type="number"
              placeholder="e.g., 10000"
              value={newSteps}
              onChange={(e) => setNewSteps(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Goal</Label>
            <Input
              type="number"
              placeholder="e.g., 10000"
              value={newStepsGoal}
              onChange={(e) => setNewStepsGoal(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Distance (km)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g., 7.5"
              value={newDistance}
              onChange={(e) => setNewDistance(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Calories</Label>
            <Input
              type="number"
              placeholder="e.g., 350"
              value={newCalories}
              onChange={(e) => setNewCalories(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Active Minutes</Label>
          <Input
            type="number"
            placeholder="e.g., 60"
            value={newActiveMinutes}
            onChange={(e) => setNewActiveMinutes(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Any notes about your activity..."
            value={newStepsNotes}
            onChange={(e) => setNewStepsNotes(e.target.value)}
          />
        </div>
      </QuickAddSheet>

      {/* Add Other Activity Sheet */}
      <QuickAddSheet
        open={showAddOther}
        onOpenChange={setShowAddOther}
        title="Add Activity Record"
        description="Log any other health or fitness activity"
        onSubmit={handleAddOther}
        submitLabel="Add Record"
      >
        <DatePickerField label="Date" value={newOtherDate} onChange={setNewOtherDate} />
        
        <div className="space-y-2">
          <Label>Time</Label>
          <Input
            type="time"
            value={newOtherTime}
            onChange={(e) => setNewOtherTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="e.g., Blood Pressure Reading"
            value={newOtherTitle}
            onChange={(e) => setNewOtherTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={newOtherCategory} onValueChange={setNewOtherCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Health Check">Health Check</SelectItem>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="Nutrition">Nutrition</SelectItem>
              <SelectItem value="Supplements">Supplements</SelectItem>
              <SelectItem value="Wellness">Wellness</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Attachment Type</Label>
          <Select value={newOtherAttachmentType} onValueChange={(v: any) => setNewOtherAttachmentType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Attachment</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {newOtherAttachmentType !== "none" && (
          <div className="space-y-2">
            <Label>Upload {newOtherAttachmentType === "image" ? "Image" : "Document"}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {newOtherAttachmentType === "image" ? "PNG, JPG up to 10MB" : "PDF, DOC up to 10MB"}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Description (Optional)</Label>
          <Textarea
            placeholder="Add any details..."
            value={newOtherDescription}
            onChange={(e) => setNewOtherDescription(e.target.value)}
          />
        </div>
      </QuickAddSheet>
    </div>
  );
}
