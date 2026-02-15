import { useState, useMemo, useRef } from "react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateProgressPDF } from "@/lib/pdf-utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Dumbbell,
  Flame,
  Plus,
  Activity,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Calendar as CalendarIcon,
  FileText,
  Palette,
  ImagePlus,
  X,
  Camera,
} from "lucide-react";

// Default color options for fields
const colorOptions = [
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Red", value: "#ef4444" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Cyan", value: "#06b6d4" },
];

// Measurement field configuration
interface MeasurementFieldConfig {
  key: string;
  label: string;
  unit: string;
  defaultColor: string;
  icon: React.ReactNode;
}

const defaultMeasurementFields: MeasurementFieldConfig[] = [
  { key: "weight", label: "Weight", unit: "kg", defaultColor: "#22c55e", icon: <Scale className="w-4 h-4" /> },
  { key: "bodyFat", label: "Body Fat", unit: "%", defaultColor: "#f97316", icon: <Flame className="w-4 h-4" /> },
  { key: "muscleMass", label: "Muscle Mass", unit: "kg", defaultColor: "#3b82f6", icon: <Dumbbell className="w-4 h-4" /> },
  { key: "chest", label: "Chest", unit: "cm", defaultColor: "#a855f7", icon: <Ruler className="w-4 h-4" /> },
  { key: "waist", label: "Waist", unit: "cm", defaultColor: "#ec4899", icon: <Ruler className="w-4 h-4" /> },
  { key: "hips", label: "Hips", unit: "cm", defaultColor: "#14b8a6", icon: <Ruler className="w-4 h-4" /> },
  { key: "arms", label: "Arms", unit: "cm", defaultColor: "#6366f1", icon: <Ruler className="w-4 h-4" /> },
  { key: "thighs", label: "Thighs", unit: "cm", defaultColor: "#eab308", icon: <Ruler className="w-4 h-4" /> },
];

// Body measurements history
interface MeasurementRecord {
  id: string;
  date: Date;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
  notes: string;
  photos: { id: string; url: string; label: string }[];
}

const initialMeasurements: MeasurementRecord[] = [
  { id: "m1", date: new Date(2025, 0, 15), weight: 75, bodyFat: 15, muscleMass: 43, chest: 102, waist: 82, hips: 96, arms: 38, thighs: 58, notes: "Feeling strong", photos: [
    { id: "p1", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=400&fit=crop", label: "Front" },
    { id: "p2", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop", label: "Side" },
  ] },
  { id: "m2", date: new Date(2024, 11, 15), weight: 76, bodyFat: 16, muscleMass: 42, chest: 101, waist: 84, hips: 97, arms: 37, thighs: 57, notes: "", photos: [] },
  { id: "m3", date: new Date(2024, 10, 15), weight: 77, bodyFat: 17, muscleMass: 41, chest: 100, waist: 85, hips: 97, arms: 36, thighs: 56, notes: "Started new program", photos: [
    { id: "p3", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=400&fit=crop", label: "Front" },
  ] },
  { id: "m4", date: new Date(2024, 9, 15), weight: 78, bodyFat: 18, muscleMass: 40, chest: 99, waist: 86, hips: 98, arms: 35, thighs: 55, notes: "", photos: [] },
  { id: "m5", date: new Date(2024, 8, 15), weight: 80, bodyFat: 20, muscleMass: 39, chest: 98, waist: 88, hips: 99, arms: 34, thighs: 54, notes: "Initial assessment", photos: [] },
  { id: "m6", date: new Date(2024, 7, 15), weight: 82, bodyFat: 22, muscleMass: 38, chest: 97, waist: 90, hips: 100, arms: 33, thighs: 53, notes: "", photos: [] },
  { id: "m7", date: new Date(2024, 6, 15), weight: 83, bodyFat: 23, muscleMass: 37, chest: 96, waist: 91, hips: 100, arms: 32, thighs: 52, notes: "Pre-program baseline", photos: [] },
  { id: "m8", date: new Date(2024, 5, 15), weight: 84, bodyFat: 24, muscleMass: 36, chest: 95, waist: 92, hips: 101, arms: 31, thighs: 51, notes: "", photos: [] },
  { id: "m9", date: new Date(2024, 4, 15), weight: 85, bodyFat: 25, muscleMass: 35, chest: 94, waist: 93, hips: 101, arms: 31, thighs: 50, notes: "First measurement", photos: [] },
  { id: "m10", date: new Date(2024, 3, 15), weight: 86, bodyFat: 26, muscleMass: 34, chest: 93, waist: 94, hips: 102, arms: 30, thighs: 49, notes: "", photos: [] },
  { id: "m11", date: new Date(2024, 2, 15), weight: 87, bodyFat: 27, muscleMass: 33, chest: 92, waist: 95, hips: 102, arms: 30, thighs: 48, notes: "Started gym", photos: [] },
  { id: "m12", date: new Date(2024, 1, 15), weight: 88, bodyFat: 28, muscleMass: 32, chest: 91, waist: 96, hips: 103, arms: 29, thighs: 47, notes: "", photos: [] },
];

interface EmployeeProgressTabProps {
  memberId: string;
  memberName: string;
}

export function EmployeeProgressTab({ memberId, memberName }: EmployeeProgressTabProps) {
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 180));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Measurement data
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(initialMeasurements);
  
  // Field colors state
  const [fieldColors, setFieldColors] = useState<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    defaultMeasurementFields.forEach((field) => {
      colors[field.key] = field.defaultColor;
    });
    return colors;
  });
  
  // Visibility toggles for chart lines
  const [visibleFields, setVisibleFields] = useState<Set<string>>(
    new Set(["weight", "bodyFat", "muscleMass"])
  );
  
  // Highlighted rows
  const [highlightedRows, setHighlightedRows] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Selected photo for fullscreen
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; label: string; date: Date } | null>(null);
  
  // Measurement form photos
  const [newMeasurementPhotos, setNewMeasurementPhotos] = useState<{ id: string; url: string; label: string; file?: File }[]>([]);
  const measurementPhotoInputRef = useRef<HTMLInputElement>(null);
  
  // Add measurement sheet
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    notes: "",
  });
  
  // Get color for a field
  const getFieldColor = (key: string) => fieldColors[key] || "#888888";
  
  // Update field color
  const updateFieldColor = (key: string, color: string) => {
    setFieldColors((prev) => ({ ...prev, [key]: color }));
  };

  // Filter measurements by date range
  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) =>
      isWithinInterval(m.date, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      })
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [measurements, startDate, endDate]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return [...filteredMeasurements]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((m) => ({
        date: format(m.date, "MMM d"),
        weight: m.weight,
        bodyFat: m.bodyFat,
        muscleMass: m.muscleMass,
        chest: m.chest,
        waist: m.waist,
        hips: m.hips,
        arms: m.arms,
        thighs: m.thighs,
      }));
  }, [filteredMeasurements]);

  // Calculate progress changes
  const latestMeasurement = filteredMeasurements[0];
  const previousMeasurement = filteredMeasurements[1];
  
  const getChange = (field: keyof MeasurementRecord) => {
    if (!latestMeasurement || !previousMeasurement) return 0;
    return (latestMeasurement[field] as number) - (previousMeasurement[field] as number);
  };

  const weightChange = getChange("weight");
  const bodyFatChange = getChange("bodyFat");
  const muscleChange = getChange("muscleMass");

  // Total change from oldest to newest in range
  const oldestMeasurement = filteredMeasurements[filteredMeasurements.length - 1];
  const totalWeightChange = latestMeasurement && oldestMeasurement 
    ? latestMeasurement.weight - oldestMeasurement.weight 
    : 0;

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  const toggleHighlight = (id: string) => {
    setHighlightedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
    setHighlightedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast({ title: "Measurement Deleted", description: "The measurement record has been removed" });
  };

  const handleAddMeasurement = () => {
    const newRecord: MeasurementRecord = {
      id: `m${Date.now()}`,
      date: new Date(),
      weight: parseFloat(newMeasurement.weight) || 0,
      bodyFat: parseFloat(newMeasurement.bodyFat) || 0,
      muscleMass: parseFloat(newMeasurement.muscleMass) || 0,
      chest: parseFloat(newMeasurement.chest) || 0,
      waist: parseFloat(newMeasurement.waist) || 0,
      hips: parseFloat(newMeasurement.hips) || 0,
      arms: parseFloat(newMeasurement.arms) || 0,
      thighs: parseFloat(newMeasurement.thighs) || 0,
      notes: newMeasurement.notes,
      photos: newMeasurementPhotos.map(p => ({ id: p.id, url: p.url, label: p.label })),
    };
    
    setMeasurements((prev) => [newRecord, ...prev]);
    setNewMeasurement({
      weight: "",
      bodyFat: "",
      muscleMass: "",
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
      notes: "",
    });
    setNewMeasurementPhotos([]);
    setShowAddSheet(false);
    toast({ title: "Measurement Added", description: "New body measurements recorded successfully" });
  };

  // Photo upload handler for measurement form
  const handleMeasurementPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setNewMeasurementPhotos((prev) => [...prev, {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url,
        label: "Progress",
        file,
      }]);
    });
    
    e.target.value = "";
  };

  const handleDeleteMeasurementPhoto = (measurementId: string, photoId: string) => {
    setMeasurements((prev) => prev.map((m) => 
      m.id === measurementId 
        ? { ...m, photos: m.photos.filter((p) => p.id !== photoId) }
        : m
    ));
    toast({ title: "Photo Removed" });
  };

  // All photos from all measurements for PDF
  const allPhotos = useMemo(() => {
    return filteredMeasurements.flatMap((m) => 
      m.photos.map((p) => ({ ...p, date: m.date, measurementDate: format(m.date, "MMM d, yyyy") }))
    );
  }, [filteredMeasurements]);

  // Table columns definition
  const measurementColumns: Column<MeasurementRecord>[] = [
    {
      key: "date",
      label: "Date",
      priority: "always",
      render: (value: Date) => format(value, "MMM d, yyyy"),
    },
    {
      key: "weight",
      label: "Weight",
      priority: "always",
      render: (value: number) => (
        <span className={cn(visibleFields.has("weight") ? "font-medium" : "text-muted-foreground")}>
          {value} kg
        </span>
      ),
    },
    {
      key: "bodyFat",
      label: "Body Fat",
      priority: "md",
      render: (value: number) => (
        <span className={cn(visibleFields.has("bodyFat") ? "font-medium" : "text-muted-foreground")}>
          {value}%
        </span>
      ),
    },
    {
      key: "muscleMass",
      label: "Muscle",
      priority: "md",
      render: (value: number) => (
        <span className={cn(visibleFields.has("muscleMass") ? "font-medium" : "text-muted-foreground")}>
          {value} kg
        </span>
      ),
    },
    {
      key: "chest",
      label: "Chest",
      priority: "lg",
      render: (value: number) => `${value} cm`,
    },
    {
      key: "waist",
      label: "Waist",
      priority: "lg",
      render: (value: number) => `${value} cm`,
    },
    {
      key: "hips",
      label: "Hips",
      priority: "xl",
      render: (value: number) => `${value} cm`,
    },
    {
      key: "arms",
      label: "Arms",
      priority: "xl",
      render: (value: number) => `${value} cm`,
    },
    {
      key: "thighs",
      label: "Thighs",
      priority: "xl",
      render: (value: number) => `${value} cm`,
    },
    {
      key: "notes",
      label: "Notes",
      priority: "lg",
      render: (value: string) => value || "-",
    },
  ];

  // Row actions
  const measurementRowActions: RowAction<MeasurementRecord>[] = [
    {
      icon: Trash2,
      label: "Delete",
      onClick: (item) => handleDeleteMeasurement(item.id),
      variant: "danger",
    },
  ];

  // Paginated measurements
  const paginatedMeasurements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMeasurements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMeasurements, currentPage, itemsPerPage]);

  // Reset page when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // Date picker helpers
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // PDF Export function with chart capture
  const handleExportPDF = async () => {
    toast({ title: "Generating PDF...", description: "Please wait while the report is being created" });
    
    let chartImageData: string | undefined;
    
    // Capture chart as image
    if (chartRef.current && chartData.length > 0) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
        });
        chartImageData = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Failed to capture chart:", err);
     }
    }
    
    // Convert photos to base64 for PDF
    const photoDataUrls: string[] = [];
    for (const photo of allPhotos.slice(0, 6)) {
      try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        photoDataUrls.push(dataUrl);
      } catch {
        // Skip photos that fail to load
      }
    }
    
    const pdfMeasurements = filteredMeasurements.map((m) => ({
      date: format(m.date, "MMM d, yyyy"),
      weight: m.weight,
      bodyFat: m.bodyFat,
      muscleMass: m.muscleMass,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      arms: m.arms,
      thighs: m.thighs,
    }));

    const summary = latestMeasurement && oldestMeasurement ? {
      weightChange: latestMeasurement.weight - oldestMeasurement.weight,
      bodyFatChange: latestMeasurement.bodyFat - oldestMeasurement.bodyFat,
      muscleMassChange: latestMeasurement.muscleMass - oldestMeasurement.muscleMass,
      waistChange: latestMeasurement.waist - oldestMeasurement.waist,
    } : undefined;

    const pdf = generateProgressPDF({
      memberName: memberName,
      memberId: memberId,
      startDate: format(startDate, "MMM d, yyyy"),
      endDate: format(endDate, "MMM d, yyyy"),
      measurements: pdfMeasurements,
      summary,
      chartImage: chartImageData,
      progressPhotos: photoDataUrls.length > 0 ? photoDataUrls : undefined,
    });

    pdf.save(`${memberName.replace(/\s+/g, "_")}_progress_report.pdf`);
    toast({ title: "PDF Downloaded", description: "Progress report has been generated" });
  };

  return (
    <div className="space-y-6">
      {/* Header with date range fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">Track member's fitness journey and improvements</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportPDF} disabled={filteredMeasurements.length === 0}>
              <FileText className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">PDF Report</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button size="sm" onClick={() => setShowAddSheet(true)}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Add Measurement</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
        
        {/* Date Range Fields */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] h-10 pl-3 text-left font-normal justify-start",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {startDate ? format(startDate, "MMM d, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex items-center gap-2 p-3 border-b">
                  <Select
                    value={startDate.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(startDate);
                      newDate.setMonth(parseInt(value));
                      setStartDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-sm rounded-[0.625rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(startDate);
                      newDate.setFullYear(parseInt(value));
                      setStartDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-sm rounded-[0.625rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  month={startDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] h-10 pl-3 text-left font-normal justify-start",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {endDate ? format(endDate, "MMM d, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex items-center gap-2 p-3 border-b">
                  <Select
                    value={endDate.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(endDate);
                      newDate.setMonth(parseInt(value));
                      setEndDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-sm rounded-[0.625rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={endDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(endDate);
                      newDate.setFullYear(parseInt(value));
                      setEndDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-8 text-sm rounded-[0.625rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  month={endDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      {latestMeasurement && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  weightChange < 0 ? "text-success" : weightChange > 0 ? "text-warning" : "text-muted-foreground"
                )}>
                  {weightChange !== 0 && (weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />)}
                  {weightChange !== 0 && `${Math.abs(weightChange)} kg`}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold">{latestMeasurement.weight} kg</p>
              <p className="text-xs text-muted-foreground">Current Weight</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  bodyFatChange < 0 ? "text-success" : bodyFatChange > 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {bodyFatChange !== 0 && (bodyFatChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />)}
                  {bodyFatChange !== 0 && `${Math.abs(bodyFatChange)}%`}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold">{latestMeasurement.bodyFat}%</p>
              <p className="text-xs text-muted-foreground">Body Fat</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-success" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  muscleChange > 0 ? "text-success" : muscleChange < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {muscleChange !== 0 && (muscleChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                  {muscleChange !== 0 && `${Math.abs(muscleChange)} kg`}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold">{latestMeasurement.muscleMass} kg</p>
              <p className="text-xs text-muted-foreground">Muscle Mass</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  totalWeightChange < 0 ? "text-success" : totalWeightChange > 0 ? "text-warning" : "text-muted-foreground"
                )}>
                  {totalWeightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {totalWeightChange !== 0 ? (totalWeightChange < 0 ? "Lost" : "Gained") : "No Change"}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold">{totalWeightChange > 0 ? "+" : ""}{totalWeightChange} kg</p>
              <p className="text-xs text-muted-foreground">Total Weight Change</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Measurement Visibility Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Body Measurements Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Field toggles with color picker */}
          <div className="flex flex-wrap gap-2">
            {defaultMeasurementFields.map((field) => (
              <div key={field.key} className="flex items-center gap-1">
                <button
                  onClick={() => toggleFieldVisibility(field.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-l-full text-xs font-medium transition-all border border-r-0",
                    visibleFields.has(field.key)
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: visibleFields.has(field.key) ? getFieldColor(field.key) : "#888888" }}
                  />
                  {field.label}
                  {visibleFields.has(field.key) ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-r-full border transition-all",
                        visibleFields.has(field.key)
                          ? "bg-primary/10 border-primary/30"
                          : "bg-muted/50 border-transparent hover:bg-muted"
                      )}
                      title="Change color"
                    >
                      <Palette className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="grid grid-cols-5 gap-1.5">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updateFieldColor(field.key, color.value)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                            getFieldColor(field.key) === color.value
                              ? "border-foreground ring-2 ring-primary/30"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>

          {/* Chart with ref for PDF capture */}
          <div ref={chartRef} className="h-[300px] bg-background p-2 rounded-lg">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  {defaultMeasurementFields.map((field) =>
                    visibleFields.has(field.key) ? (
                      <Line
                        key={field.key}
                        type="monotone"
                        dataKey={field.key}
                        name={`${field.label} (${field.unit})`}
                        stroke={getFieldColor(field.key)}
                        strokeWidth={2}
                        dot={{ fill: getFieldColor(field.key), strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No measurements in selected date range
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Photos - grouped by measurement */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMeasurements.some((m) => m.photos.length > 0) ? (
            <div className="space-y-4">
              {filteredMeasurements.filter((m) => m.photos.length > 0).map((measurement) => (
                <div key={measurement.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {format(measurement.date, "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {measurement.weight}kg • {measurement.bodyFat}% BF
                    </span>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {measurement.photos.map((photo) => (
                        <div key={photo.id} className="group relative shrink-0 w-24 h-32 sm:w-28 sm:h-36 rounded-lg overflow-hidden border border-border/50 bg-muted">
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedPhoto({ url: photo.url, label: `${photo.label} — ${format(measurement.date, "MMM d, yyyy")}`, date: measurement.date })}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4">
                            <p className="text-[10px] text-white truncate">{photo.label}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMeasurementPhoto(measurement.id, photo.id); }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No progress photos yet</p>
              <p className="text-xs mt-1">Add photos when recording measurements</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo fullscreen modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
          style={{ animation: 'fade-in 0.2s ease-out forwards' }}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.label}
              className="w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain mx-auto"
            />
            <p className="text-center text-white/80 mt-3 text-sm font-medium">{selectedPhoto.label}</p>
            <p className="text-center text-white/50 text-xs mt-1">{format(selectedPhoto.date, "MMMM d, yyyy")}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Measurement Table */}
      <div>
        <SectionHeader title="Measurement History" />
        <ResponsiveTable
          data={paginatedMeasurements}
          columns={measurementColumns}
          keyExtractor={(item) => item.id}
          rowActions={measurementRowActions}
          customActions={(item) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleHighlight(item.id)}
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  highlightedRows.has(item.id) ? "fill-warning text-warning" : "text-muted-foreground"
                )}
              />
            </Button>
          )}
          pagination={{
            currentPage,
            totalPages: Math.ceil(filteredMeasurements.length / itemsPerPage),
            totalItems: filteredMeasurements.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Add Measurement Sheet */}
      <QuickAddSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add New Measurement"
        description="Record body measurements for tracking progress"
        onSubmit={handleAddMeasurement}
        submitLabel="Save Measurement"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-weight">Weight (kg)</Label>
            <Input
              id="new-weight"
              type="number"
              step="0.1"
              placeholder="75"
              value={newMeasurement.weight}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, weight: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-bodyFat">Body Fat (%)</Label>
            <Input
              id="new-bodyFat"
              type="number"
              step="0.1"
              placeholder="15"
              value={newMeasurement.bodyFat}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, bodyFat: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-muscleMass">Muscle Mass (kg)</Label>
            <Input
              id="new-muscleMass"
              type="number"
              step="0.1"
              placeholder="40"
              value={newMeasurement.muscleMass}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, muscleMass: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-chest">Chest (cm)</Label>
            <Input
              id="new-chest"
              type="number"
              step="0.1"
              placeholder="100"
              value={newMeasurement.chest}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, chest: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-waist">Waist (cm)</Label>
            <Input
              id="new-waist"
              type="number"
              step="0.1"
              placeholder="82"
              value={newMeasurement.waist}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, waist: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-hips">Hips (cm)</Label>
            <Input
              id="new-hips"
              type="number"
              step="0.1"
              placeholder="96"
              value={newMeasurement.hips}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, hips: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-arms">Arms (cm)</Label>
            <Input
              id="new-arms"
              type="number"
              step="0.1"
              placeholder="38"
              value={newMeasurement.arms}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, arms: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-thighs">Thighs (cm)</Label>
            <Input
              id="new-thighs"
              type="number"
              step="0.1"
              placeholder="55"
              value={newMeasurement.thighs}
              onChange={(e) => setNewMeasurement((prev) => ({ ...prev, thighs: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-notes">Notes (optional)</Label>
          <Input
            id="new-notes"
            placeholder="Any notes about this measurement..."
            value={newMeasurement.notes}
            onChange={(e) => setNewMeasurement((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
        
        {/* Progress Photos */}
        <div className="space-y-2">
          <Label>Progress Photos (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {newMeasurementPhotos.map((photo) => (
              <div key={photo.id} className="relative w-16 h-20 rounded-lg overflow-hidden border border-border/50 bg-muted">
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewMeasurementPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-destructive"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => measurementPhotoInputRef.current?.click()}
              className="w-16 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-[9px]">Add</span>
            </button>
          </div>
          <input
            ref={measurementPhotoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleMeasurementPhotoUpload}
          />
        </div>
      </QuickAddSheet>
    </div>
  );
}
