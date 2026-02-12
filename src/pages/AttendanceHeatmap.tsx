import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight,
  Zap,
  Activity,
  Target,
  Sparkles,
  User,
  Timer,
  Flame,
  Building2,
  Settings2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GripVertical,
  AlertCircle,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangeFields } from "@/components/ui/date-range-fields";
import { format, subDays, startOfWeek, endOfWeek, addDays as dateFnsAddDays, differenceInDays, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

// Time slots for the heatmap (gym hours)
const timeSlots = [
  "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Branch configuration
interface BranchConfig {
  id: string;
  name: string;
  capacity: number;
  peakThreshold: number;
}

const branches: BranchConfig[] = [
  { id: "all", name: "All Branches", capacity: 200, peakThreshold: 75 },
  { id: "main", name: "Main Street", capacity: 80, peakThreshold: 75 },
  { id: "downtown", name: "Downtown Center", capacity: 100, peakThreshold: 70 },
  { id: "west", name: "West End", capacity: 60, peakThreshold: 80 },
];

// Mock data generator for attendance - now generates data for specific dates
const generateDateRangeData = (startDate: Date, endDate: Date, branchId: string, capacity: number) => {
  const data: Array<{
    dateTime: string;
    date: Date;
    time: string;
    count: number;
    capacity: number;
    peakLevel: "low" | "medium" | "high" | "peak";
    avgDuration: number;
    uniqueMembers: number;
    classesRunning: number;
    equipment: { available: number; total: number };
    staffCount: number;
    waitlist: number;
    newMembers: number;
    regularMembers: number;
    topActivities: Array<{ name: string; count: number }>;
    demographics: { male: number; female: number; other: number };
    ageGroups: Record<string, number>;
    membersPresent: Array<{ id: string; name: string; activity: string; checkIn: string; memberType: string }>;
  }> = [];

  const branchMultiplier = branchId === "all" ? 2.5 : branchId === "downtown" ? 1.2 : branchId === "west" ? 0.7 : 1;
  const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

  datesInRange.forEach((date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    timeSlots.forEach((time) => {
      const hour = parseInt(time.split(":")[0]);
      
      // Simulate realistic gym patterns
      let baseCount = 15;
      
      // Morning rush (6-9 AM)
      if (hour >= 6 && hour <= 8) baseCount = 45 + Math.floor(Math.random() * 20);
      // Mid-morning lull (9-11 AM)
      else if (hour >= 9 && hour <= 10) baseCount = 25 + Math.floor(Math.random() * 15);
      // Lunch rush (12-2 PM)
      else if (hour >= 12 && hour <= 13) baseCount = 35 + Math.floor(Math.random() * 15);
      // Afternoon lull (2-4 PM)
      else if (hour >= 14 && hour <= 15) baseCount = 20 + Math.floor(Math.random() * 10);
      // Evening rush (5-8 PM) - highest
      else if (hour >= 17 && hour <= 19) baseCount = 55 + Math.floor(Math.random() * 25);
      // Late evening (8-9 PM)
      else if (hour >= 20) baseCount = 30 + Math.floor(Math.random() * 15);
      // Early morning (5-6 AM)
      else if (hour === 5) baseCount = 15 + Math.floor(Math.random() * 10);
      // Default
      else baseCount = 20 + Math.floor(Math.random() * 15);

      // Weekend adjustments
      if (isWeekend) {
        if (hour >= 9 && hour <= 12) baseCount *= 1.2;
        else if (hour >= 17 && hour <= 19) baseCount *= 0.7;
      }

      const count = Math.floor(baseCount * branchMultiplier);
      const occupancyRate = (count / capacity) * 100;

      let peakLevel: "low" | "medium" | "high" | "peak";
      if (occupancyRate < 30) peakLevel = "low";
      else if (occupancyRate < 50) peakLevel = "medium";
      else if (occupancyRate < 75) peakLevel = "high";
      else peakLevel = "peak";

      const maleRatio = 0.45 + Math.random() * 0.2;
      const femaleRatio = 0.95 - maleRatio;
      const otherRatio = 0.05;

      const memberNames = [
        "John Smith", "Emma Wilson", "James Brown", "Sarah Johnson", "Mike Chen",
        "Lisa Park", "Anna Lee", "David Kim", "Jessica Taylor", "Robert Garcia"
      ];
      const activities = ["Strength Training", "Cardio", "HIIT Class", "Yoga", "Spinning", "Swimming"];
      const memberTypes = ["Premium", "Standard", "Basic", "Day Pass"];

      const membersPresent = Array.from({ length: Math.min(count, 8) }, (_, i) => ({
        id: `member-${format(date, "yyyy-MM-dd")}-${hour}-${i}`,
        name: memberNames[Math.floor(Math.random() * memberNames.length)],
        activity: activities[Math.floor(Math.random() * activities.length)],
        checkIn: `${hour}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        memberType: memberTypes[Math.floor(Math.random() * memberTypes.length)]
      }));

      data.push({
        dateTime: `${format(date, "MMM d")} ${time}`,
        date,
        time,
        count,
        capacity,
        peakLevel,
        avgDuration: 45 + Math.floor(Math.random() * 45),
        uniqueMembers: Math.floor(count * (0.85 + Math.random() * 0.15)),
        classesRunning: Math.floor(Math.random() * 4),
        equipment: { available: Math.floor(30 - count * 0.3), total: 30 },
        staffCount: Math.floor(3 + Math.random() * 3),
        waitlist: peakLevel === "peak" ? Math.floor(Math.random() * 5) : 0,
        newMembers: Math.floor(Math.random() * 3),
        regularMembers: Math.floor(count * 0.7),
        topActivities: [
          { name: "Strength Training", count: Math.floor(count * 0.35) },
          { name: "Cardio", count: Math.floor(count * 0.25) },
          { name: activities[Math.floor(Math.random() * activities.length)], count: Math.floor(count * 0.2) },
        ],
        demographics: {
          male: Math.floor(count * maleRatio),
          female: Math.floor(count * femaleRatio),
          other: Math.floor(count * otherRatio)
        },
        ageGroups: {
          "18-25": Math.floor(count * 0.25),
          "26-35": Math.floor(count * 0.35),
          "36-45": Math.floor(count * 0.2),
          "46-55": Math.floor(count * 0.12),
          "55+": Math.floor(count * 0.08)
        },
        membersPresent
      });
    });
  });

  return data;
};

// Custom tooltip for chart
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { time: string; count: number; peakLevel: string; isPeak: boolean };
  }>;
  label?: string;
  capacity: number;
  peakThreshold: number;
}

const CustomChartTooltip = ({ active, payload, label, capacity, peakThreshold }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const occupancy = Math.round((data.count / capacity) * 100);
  const isPeak = occupancy >= peakThreshold;
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-lg min-w-[180px]">
      <p className="font-semibold text-card-foreground mb-2">{label}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Members:</span>
          <span className="font-medium text-primary">{data.count}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="font-medium text-foreground">{capacity}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Occupancy:</span>
          <span className={`font-medium ${occupancy >= peakThreshold ? "text-destructive" : occupancy >= 50 ? "text-warning" : "text-success"}`}>
            {occupancy}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={isPeak ? "destructive" : "secondary"} className="text-xs">
            {isPeak ? "Peak" : "Normal"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default function AttendanceHeatmap() {
  const navigate = useNavigate();
  
  // Date range state
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [selectedCell, setSelectedCell] = useState<{ day: string; time: string } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailView, setDetailView] = useState<"overview" | "members" | "activities" | "demographics">("overview");
  
  // Branch & capacity settings
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [customCapacity, setCustomCapacity] = useState(80);
  const [peakThreshold, setPeakThreshold] = useState(75);
  const [granularity, setGranularity] = useState<"hourly" | "daily" | "weekly">("hourly");
  
  // Zoom & drag state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Get current branch config
  const currentBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranch) || branches[0],
    [selectedBranch]
  );

  // Update capacity when branch changes
  const handleBranchChange = useCallback((branchId: string) => {
    setSelectedBranch(branchId);
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setCustomCapacity(branch.capacity);
      setPeakThreshold(branch.peakThreshold);
    }
  }, []);

  // Calculate date range info
  const dateRangeDays = useMemo(() => {
    return Math.max(1, differenceInDays(endDate, startDate) + 1);
  }, [startDate, endDate]);

  // Generate raw chart data for date range
  const rawChartData = useMemo(() => {
    return generateDateRangeData(startDate, endDate, selectedBranch, customCapacity);
  }, [startDate, endDate, selectedBranch, customCapacity]);

  // Aggregate data based on granularity
  const chartData = useMemo(() => {
    if (granularity === "hourly") return rawChartData;

    const aggregateData = (items: typeof rawChartData) => {
      const totalCount = items.reduce((sum, d) => sum + d.count, 0);
      const avgCount = Math.round(totalCount / items.length);
      const maxItem = items.reduce((max, d) => d.count > max.count ? d : max, items[0]);
      
      return {
        count: avgCount,
        capacity: items[0]?.capacity || customCapacity,
        peakLevel: maxItem?.peakLevel || "low" as const,
        avgDuration: Math.round(items.reduce((sum, d) => sum + d.avgDuration, 0) / items.length),
        uniqueMembers: items.reduce((sum, d) => sum + d.uniqueMembers, 0),
        classesRunning: items.reduce((sum, d) => sum + d.classesRunning, 0),
        equipment: items[0]?.equipment || { available: 0, total: 0 },
        staffCount: Math.round(items.reduce((sum, d) => sum + d.staffCount, 0) / items.length),
        waitlist: items.reduce((sum, d) => sum + d.waitlist, 0),
        newMembers: items.reduce((sum, d) => sum + d.newMembers, 0),
        regularMembers: items.reduce((sum, d) => sum + d.regularMembers, 0),
        topActivities: items[0]?.topActivities || [],
        demographics: {
          male: items.reduce((sum, d) => sum + d.demographics.male, 0),
          female: items.reduce((sum, d) => sum + d.demographics.female, 0),
          other: items.reduce((sum, d) => sum + d.demographics.other, 0),
        },
        ageGroups: items[0]?.ageGroups || {},
        membersPresent: items[0]?.membersPresent || [],
      };
    };

    if (granularity === "daily") {
      const days: Record<string, typeof rawChartData> = {};
      rawChartData.forEach(d => {
        const dayKey = format(d.date, "yyyy-MM-dd");
        if (!days[dayKey]) days[dayKey] = [];
        days[dayKey].push(d);
      });
      return Object.entries(days).map(([dayKey, items]) => {
        const agg = aggregateData(items);
        return {
          dateTime: format(parseISO(dayKey), "MMM d"),
          date: parseISO(dayKey),
          time: "All Day",
          ...agg,
        };
      });
    }

    if (granularity === "weekly") {
      const weeks: Record<string, typeof rawChartData> = {};
      rawChartData.forEach(d => {
        const weekStart = format(startOfWeek(d.date, { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weeks[weekStart]) weeks[weekStart] = [];
        weeks[weekStart].push(d);
      });
      return Object.entries(weeks).map(([weekStart, items]) => {
        const agg = aggregateData(items);
        const weekEnd = format(endOfWeek(parseISO(weekStart), { weekStartsOn: 1 }), "MMM d");
        return {
          dateTime: `${format(parseISO(weekStart), "MMM d")} - ${weekEnd}`,
          date: parseISO(weekStart),
          time: "Week",
          ...agg,
        };
      });
    }

    return rawChartData;
  }, [rawChartData, granularity, customCapacity]);

  // Get selected data for modal
  const selectedData = useMemo(() => {
    if (!selectedCell) return null;
    return chartData.find(d => d.dateTime === selectedCell.day) || null;
  }, [selectedCell, chartData]);

  // Chart data with peak info
  const chartDataWithPeaks = useMemo(() => {
    const peakCount = Math.round(customCapacity * (peakThreshold / 100));
    return chartData.map(d => ({
      ...d,
      isPeak: d.count >= peakCount
    }));
  }, [chartData, customCapacity, peakThreshold]);

  // Identify peak and low points based on user-defined threshold
  const peakPoints = useMemo(() => {
    const threshold = Math.round(customCapacity * (peakThreshold / 100));
    return chartDataWithPeaks.filter(d => d.count >= threshold);
  }, [chartDataWithPeaks, customCapacity, peakThreshold]);

  const lowPoints = useMemo(() => {
    const threshold = Math.round(customCapacity * 0.3);
    return chartDataWithPeaks.filter(d => d.count > 0 && d.count <= threshold);
  }, [chartDataWithPeaks, customCapacity]);

  // Overcrowding and under-utilization analysis
  const utilizationAnalysis = useMemo(() => {
    const overcrowded = chartDataWithPeaks.filter(d => d.count > customCapacity);
    const underutilized = chartDataWithPeaks.filter(d => d.count < customCapacity * 0.25);
    const ideal = chartDataWithPeaks.filter(d => d.count >= customCapacity * 0.5 && d.count <= customCapacity * 0.85);
    
    return {
      overcrowded,
      underutilized,
      ideal,
      avgOccupancy: Math.round(chartDataWithPeaks.reduce((sum, d) => sum + d.count, 0) / chartDataWithPeaks.length / customCapacity * 100)
    };
  }, [chartDataWithPeaks, customCapacity]);

  // Zoom & drag handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chartContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.clientX);
    setScrollStartX(chartContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !chartContainerRef.current) return;
    const deltaX = Math.abs(e.clientX - dragStartX);
    if (deltaX > 5) {
      setHasDragged(true);
      e.preventDefault();
      chartContainerRef.current.scrollLeft = scrollStartX - (e.clientX - dragStartX);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!chartContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(e.touches[0].clientX);
    setScrollStartX(chartContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !chartContainerRef.current) return;
    const deltaX = Math.abs(e.touches[0].clientX - dragStartX);
    if (deltaX > 5) {
      setHasDragged(true);
      chartContainerRef.current.scrollLeft = scrollStartX - (e.touches[0].clientX - dragStartX);
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const chartWidth = useMemo(() => `${100 * zoomLevel}%`, [zoomLevel]);

  const handleChartClick = useCallback((e: any) => {
    if (hasDragged) return;
    if (e && e.activePayload && e.activePayload.length > 0) {
      const clickedData = e.activePayload[0].payload;
      setSelectedCell({ day: clickedData.dateTime, time: clickedData.time });
      setDetailView("overview");
      setIsDetailModalOpen(true);
    }
  }, [hasDragged]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    let totalVisits = 0;
    let peakTime = { dateTime: "", time: "", count: 0 };
    let lowTime = { dateTime: "", time: "", count: Infinity };
    let totalDuration = 0;

    chartData.forEach((data) => {
      totalVisits += data.count;
      totalDuration += data.avgDuration;
      if (data.count > peakTime.count) {
        peakTime = { dateTime: data.dateTime, time: data.time, count: data.count };
      }
      if (data.count < lowTime.count && data.count > 0) {
        lowTime = { dateTime: data.dateTime, time: data.time, count: data.count };
      }
    });

    return {
      totalVisits,
      avgPerHour: Math.round(totalVisits / chartData.length),
      peakTime,
      lowTime,
      avgDuration: Math.round(totalDuration / chartData.length)
    };
  }, [chartData]);

  const handleCellClick = useCallback((dateTime: string, time: string) => {
    setSelectedCell({ day: dateTime, time });
    setDetailView("overview");
    setIsDetailModalOpen(true);
  }, []);

  const getFullDay = (shortDay: string) => {
    const index = days.indexOf(shortDay);
    return fullDays[index] || shortDay;
  };

  const getOccupancyInsight = (data: NonNullable<typeof selectedData>) => {
    const occupancy = (data.count / customCapacity) * 100;
    if (occupancy >= 100) return { text: "Over capacity - Immediate action needed", type: "error" };
    if (occupancy >= peakThreshold) return { text: "At peak - Consider redirecting members", type: "error" };
    if (occupancy >= 50) return { text: "Good utilization - Optimal operations", type: "success" };
    if (occupancy >= 25) return { text: "Light traffic - Ideal for personal training", type: "info" };
    return { text: "Under-utilized - Consider promotions for this slot", type: "muted" };
  };

  const peakThresholdCount = Math.round(customCapacity * (peakThreshold / 100));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Attendance Heatmap
            </h1>
            <p className="text-sm text-muted-foreground">
              Analyze peak times and optimize gym capacity
            </p>
          </div>
        </div>
        <DateRangeFields
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>


      {/* Branch & Capacity Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Configuration</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Branch Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Branch
              </Label>
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity Setting */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Max Capacity
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={customCapacity}
                  onChange={(e) => setCustomCapacity(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full"
                  min={10}
                  max={500}
                />
              </div>
            </div>

            {/* Peak Threshold */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                Peak Threshold: {peakThreshold}%
              </Label>
              <Slider
                value={[peakThreshold]}
                onValueChange={(v) => setPeakThreshold(v[0])}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Utilization Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <span className="text-xs text-muted-foreground">
                Overcrowded: <span className="font-medium text-foreground">{utilizationAnalysis.overcrowded.length} slots</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success/80" />
              <span className="text-xs text-muted-foreground">
                Ideal: <span className="font-medium text-foreground">{utilizationAnalysis.ideal.length} slots</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <span className="text-xs text-muted-foreground">
                Peak: <span className="font-medium text-foreground">{peakPoints.length} slots</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">
                Under-used: <span className="font-medium text-foreground">{utilizationAnalysis.underutilized.length} slots</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Visits</p>
              <p className="text-lg font-bold text-foreground">{stats.totalVisits.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Occupancy</p>
              <p className="text-lg font-bold text-foreground">{utilizationAnalysis.avgOccupancy}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Time</p>
              <p className="text-lg font-bold text-foreground">{stats.peakTime.dateTime}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent">
              <Timer className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
              <p className="text-lg font-bold text-foreground">{stats.avgDuration} min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Chart with Zoom Controls */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 w-fit mb-4 ml-auto">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium px-2 min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetZoom}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          {zoomLevel > 1 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 pl-2">
              <GripVertical className="h-3 w-3" />
              Drag to scroll
            </span>
          )}
        </div>

        {/* Chart */}
        <div 
          ref={chartContainerRef}
          className={`h-[350px] sm:h-[400px] overflow-x-auto ${isDragging ? "cursor-grabbing" : zoomLevel > 1 ? "cursor-grab" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ width: chartWidth, minWidth: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartDataWithPeaks}
                onClick={handleChartClick}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="dateTime"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval={dateRangeDays > 3 ? Math.floor(chartDataWithPeaks.length / 20) : 0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={40}
                  domain={[0, Math.max(customCapacity * 1.2, Math.max(...chartDataWithPeaks.map(d => d.count)) * 1.1)]}
                  label={{ value: 'Members', angle: -90, position: 'insideLeft', fontSize: 11, className: 'fill-muted-foreground' }}
                />
                <Tooltip content={<CustomChartTooltip capacity={customCapacity} peakThreshold={peakThreshold} />} />
                
                {/* Peak threshold line */}
                <ReferenceLine 
                  y={peakThresholdCount} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={{ value: `Peak (${peakThreshold}%)`, position: 'right', fontSize: 10, fill: 'hsl(var(--destructive))' }}
                />
                
                {/* Capacity line */}
                <ReferenceLine 
                  y={customCapacity} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{ value: `Max (${customCapacity})`, position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />

                {/* Ideal range indicator */}
                <ReferenceLine 
                  y={customCapacity * 0.5} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="8 4"
                  strokeOpacity={0.5}
                  label={{ value: 'Ideal (50%)', position: 'right', fontSize: 9, fill: 'hsl(var(--success))' }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorAttendance)"
                  activeDot={{ r: 8, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />

                {/* Peak markers */}
                {peakPoints.slice(0, 20).map((point, index) => (
                  <ReferenceDot
                    key={`peak-${index}`}
                    x={point.dateTime}
                    y={point.count}
                    r={5}
                    fill="hsl(var(--destructive))"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* X-Axis Frequency Controls */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-border mt-4">
          <span className="text-xs text-muted-foreground mr-2">X-Axis Interval:</span>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(["hourly", "daily", "weekly"] as const).map((g) => (
              <Button
                key={g}
                variant={granularity === g ? "default" : "ghost"}
                size="sm"
                onClick={() => setGranularity(g)}
                className={cn(
                  "h-7 px-3 text-xs capitalize",
                  granularity === g && "shadow-sm"
                )}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Peak Time Indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          {peakPoints.slice(0, 5).map((point, index) => (
            <Badge 
              key={`peak-badge-${index}`} 
              variant="destructive" 
              className="cursor-pointer hover:bg-destructive/90"
              onClick={() => handleCellClick(point.dateTime, point.time)}
            >
              <Flame className="h-3 w-3 mr-1" />
              {point.dateTime} ({Math.round(point.count / customCapacity * 100)}%)
            </Badge>
          ))}
          {lowPoints.slice(0, 3).map((point, index) => (
            <Badge 
              key={`low-badge-${index}`} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleCellClick(point.dateTime, point.time)}
            >
              <Zap className="h-3 w-3 mr-1" />
              {point.dateTime} ({Math.round(point.count / customCapacity * 100)}%)
            </Badge>
          ))}
        </div>

        {/* Peak Time Summary */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Morning Rush</span>
            </div>
            <p className="text-lg font-bold text-foreground">6:00 - 8:00</p>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(chartDataWithPeaks.filter(d => parseInt(d.time) >= 6 && parseInt(d.time) <= 8).reduce((acc, d) => acc + d.count, 0) / Math.max(1, chartDataWithPeaks.filter(d => parseInt(d.time) >= 6 && parseInt(d.time) <= 8).length))} members
            </p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning">Lunch Rush</span>
            </div>
            <p className="text-lg font-bold text-foreground">12:00 - 13:00</p>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(chartDataWithPeaks.filter(d => parseInt(d.time) >= 12 && parseInt(d.time) <= 13).reduce((acc, d) => acc + d.count, 0) / Math.max(1, chartDataWithPeaks.filter(d => parseInt(d.time) >= 12 && parseInt(d.time) <= 13).length))} members
            </p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Evening Rush</span>
            </div>
            <p className="text-lg font-bold text-foreground">17:00 - 19:00</p>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(chartDataWithPeaks.filter(d => parseInt(d.time) >= 17 && parseInt(d.time) <= 19).reduce((acc, d) => acc + d.count, 0) / Math.max(1, chartDataWithPeaks.filter(d => parseInt(d.time) >= 17 && parseInt(d.time) <= 19).length))} members
            </p>
          </div>
        </div>
      </Card>

      {/* Gym Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Overcrowding Risk</h3>
          </div>
          <p className="text-2xl font-bold text-destructive">{utilizationAnalysis.overcrowded.length}</p>
          <p className="text-xs text-muted-foreground mt-1">time slots over capacity</p>
          {utilizationAnalysis.overcrowded.length > 0 && (
            <p className="text-xs text-destructive mt-2 font-medium">
              Revenue opportunity: Add classes or pricing incentives
            </p>
          )}
        </Card>

        <Card className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Under-Utilization</h3>
          </div>
          <p className="text-2xl font-bold text-warning">{utilizationAnalysis.underutilized.length}</p>
          <p className="text-xs text-muted-foreground mt-1">time slots below 25%</p>
          {utilizationAnalysis.underutilized.length > 0 && (
            <p className="text-xs text-warning mt-2 font-medium">
              Consider off-peak promotions or maintenance windows
            </p>
          )}
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-success" />
            <h3 className="text-sm font-semibold text-foreground">Optimal Slots</h3>
          </div>
          <p className="text-2xl font-bold text-success">{utilizationAnalysis.ideal.length}</p>
          <p className="text-xs text-muted-foreground mt-1">slots in ideal range (50-85%)</p>
          <p className="text-xs text-success mt-2 font-medium">
            Best for member experience & operations
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Revenue Potential</h3>
          </div>
          <p className="text-2xl font-bold text-primary">
            {Math.round((utilizationAnalysis.avgOccupancy / peakThreshold) * 100)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">of peak capacity utilized</p>
          <p className="text-xs text-primary mt-2 font-medium">
            {utilizationAnalysis.avgOccupancy < 50 ? "Room for growth with targeted marketing" : "Healthy utilization pattern"}
          </p>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Peak Hours (High Traffic)
          </h3>
          <div className="space-y-3">
            {peakPoints.slice(0, 4).map((data, index) => (
              <button
                key={`peak-${index}`}
                onClick={() => handleCellClick(data.dateTime, data.time)}
                className="w-full flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-destructive" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{data.dateTime}</p>
                    <p className="text-xs text-muted-foreground">{Math.round((data.count / customCapacity) * 100)}% capacity</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-destructive">{data.count}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
            {peakPoints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No peak hours in selected range</p>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-success" />
            Off-Peak Hours (Low Traffic)
          </h3>
          <div className="space-y-3">
            {lowPoints.slice(0, 4).map((data, index) => (
              <button
                key={`low-${index}`}
                onClick={() => handleCellClick(data.dateTime, data.time)}
                className="w-full flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 hover:bg-success/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{data.dateTime}</p>
                    <p className="text-xs text-muted-foreground">Great for personal training</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-success">{data.count}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
            {lowPoints.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No off-peak hours in selected range</p>
            )}
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={(open) => { setIsDetailModalOpen(open); if (!open) setSelectedCell(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {selectedCell ? `${selectedCell.day} at ${selectedCell.time}` : "Time Slot Details"}
              {selectedBranch !== "all" && (
                <Badge variant="outline" className="ml-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  {currentBranch.name}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedData && (
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "overview", label: "Overview", icon: Activity },
                  { key: "members", label: "Members Present", icon: Users },
                  { key: "activities", label: "Activities", icon: Flame },
                  { key: "demographics", label: "Demographics", icon: Target },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={detailView === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDetailView(key as typeof detailView)}
                    className="gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Overview Tab */}
              {detailView === "overview" && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Current Count</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">{selectedData.count}</p>
                      <p className="text-xs text-muted-foreground mt-1">out of {customCapacity} capacity</p>
                    </Card>
                    <Card className="p-4 bg-success/10 border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-success" />
                        <span className="text-sm text-muted-foreground">Avg Duration</span>
                      </div>
                      <p className="text-2xl font-bold text-success">{selectedData.avgDuration} min</p>
                      <p className="text-xs text-muted-foreground mt-1">average stay time</p>
                    </Card>
                  </div>

                  {/* Occupancy Rate */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">Occupancy Rate</span>
                      <Badge variant={(selectedData.count / customCapacity * 100) >= peakThreshold ? "destructive" : (selectedData.count / customCapacity * 100) >= 50 ? "default" : "secondary"}>
                        {Math.round((selectedData.count / customCapacity) * 100)}%
                      </Badge>
                    </div>
                    <Progress value={(selectedData.count / customCapacity) * 100} className="h-3" />
                    <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {getOccupancyInsight(selectedData).text}
                    </p>
                  </Card>

                  {/* Resource Status */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Resource Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Equipment Available</p>
                        <p className="text-lg font-semibold text-foreground">
                          {selectedData.equipment.available}/{selectedData.equipment.total}
                        </p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Staff On Duty</p>
                        <p className="text-lg font-semibold text-foreground">{selectedData.staffCount}</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Classes Running</p>
                        <p className="text-lg font-semibold text-foreground">{selectedData.classesRunning}</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Waitlist</p>
                        <p className={`text-lg font-semibold ${selectedData.waitlist > 0 ? "text-destructive" : "text-foreground"}`}>
                          {selectedData.waitlist}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Predictions */}
                  <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Predictions & Recommendations
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Expected Next Hour</p>
                        <p className="text-lg font-bold text-foreground">
                          {Math.round(selectedData.count * (0.8 + Math.random() * 0.4))} members
                        </p>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Recommended Staff</p>
                        <p className="text-lg font-bold text-foreground">
                          {Math.max(selectedData.staffCount, Math.ceil(selectedData.count / 20))} staff members
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Members Tab */}
              {detailView === "members" && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Members Present ({selectedData.count})
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedData.newMembers} New</Badge>
                      <Badge variant="secondary">{selectedData.regularMembers} Regulars</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {selectedData.membersPresent.map((member) => (
                      <div key={member.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.activity}</p>
                              <p className="text-xs text-muted-foreground mt-1">Check-in: {member.checkIn}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{member.memberType}</Badge>
                        </div>
                      </div>
                    ))}
                    {selectedData.count > selectedData.membersPresent.length && (
                      <p className="text-center text-xs text-muted-foreground py-2">
                        +{selectedData.count - selectedData.membersPresent.length} more members
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Activities Tab */}
              {detailView === "activities" && (
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    Top Activities
                  </h3>
                  <div className="space-y-3">
                    {selectedData.topActivities.map((activity, index) => (
                      <div key={activity.name} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-foreground">{activity.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{activity.count} members</span>
                        </div>
                        <Progress value={(activity.count / selectedData.count) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((activity.count / selectedData.count) * 100)}% of members
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedData.classesRunning > 0 && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        {selectedData.classesRunning} class{selectedData.classesRunning > 1 ? "es" : ""} currently running
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contributing to increased floor activity
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Demographics Tab */}
              {detailView === "demographics" && (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Gender Distribution
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-blue-500">{selectedData.demographics.male}</p>
                        <p className="text-xs text-muted-foreground">Male</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((selectedData.demographics.male / selectedData.count) * 100)}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-pink-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-pink-500">{selectedData.demographics.female}</p>
                        <p className="text-xs text-muted-foreground">Female</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((selectedData.demographics.female / selectedData.count) * 100)}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-purple-500">{selectedData.demographics.other}</p>
                        <p className="text-xs text-muted-foreground">Other</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((selectedData.demographics.other / selectedData.count) * 100)}%
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Age Distribution
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(selectedData.ageGroups).map(([group, count]) => (
                        <div key={group} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-16">{group}</span>
                          <div className="flex-1">
                            <Progress value={(count / selectedData.count) * 100} className="h-2" />
                          </div>
                          <span className="text-sm font-medium text-foreground w-16 text-right">
                            {count} ({Math.round((count / selectedData.count) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Trend Indicator */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50">
                {(selectedData.count / customCapacity * 100) >= peakThreshold ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (selectedData.count / customCapacity * 100) >= 50 ? (
                  <Activity className="h-5 w-5 text-warning" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-success" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {(selectedData.count / customCapacity * 100) >= peakThreshold
                    ? "Peak hours - Maximum capacity management needed"
                    : (selectedData.count / customCapacity * 100) >= 50
                      ? "Moderate traffic - Normal operations"
                      : "Low traffic - Opportunity for maintenance or promotions"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
