import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, AlertCircle, Calendar, Filter, Users, ZoomIn, ZoomOut, RotateCcw, X, Clock, Ban, Percent, Timer, Sparkles, Target, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AsyncSelect, AsyncSelectOption } from "@/components/ui/async-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { format, subDays, eachDayOfInterval, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

// Mock data for classes
const mockClasses = [
  { id: "yoga-101", name: "Yoga Basics", instructor: "Emma Wilson" },
  { id: "yoga-adv", name: "Advanced Yoga", instructor: "Emma Wilson" },
  { id: "hiit-101", name: "HIIT Beginner", instructor: "James Brown" },
  { id: "hiit-pro", name: "HIIT Pro", instructor: "James Brown" },
  { id: "spinning-am", name: "Morning Spin", instructor: "Lisa Park" },
  { id: "spinning-pm", name: "Evening Spin", instructor: "Lisa Park" },
  { id: "pilates-core", name: "Pilates Core", instructor: "Anna Lee" },
  { id: "pilates-flex", name: "Pilates Flexibility", instructor: "Anna Lee" },
  { id: "crossfit-wod", name: "CrossFit WOD", instructor: "Mike Chen" },
  { id: "zumba-party", name: "Zumba Party", instructor: "Sarah Johnson" },
];

// Mock data for memberships
const mockMemberships = [
  { id: "premium-monthly", name: "Premium Monthly", price: "$99/mo" },
  { id: "premium-annual", name: "Premium Annual", price: "$999/yr" },
  { id: "standard-monthly", name: "Standard Monthly", price: "$59/mo" },
  { id: "standard-annual", name: "Standard Annual", price: "$599/yr" },
  { id: "basic-monthly", name: "Basic Monthly", price: "$29/mo" },
  { id: "basic-annual", name: "Basic Annual", price: "$299/yr" },
  { id: "student-monthly", name: "Student Plan", price: "$19/mo" },
  { id: "family-plan", name: "Family Plan (4)", price: "$149/mo" },
  { id: "corporate", name: "Corporate Membership", price: "Custom" },
  { id: "daypass-bundle", name: "Day Pass Bundle (10)", price: "$150" },
];

// Mock API for searching classes
const searchClasses = async (query: string): Promise<AsyncSelectOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  const filtered = mockClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor.toLowerCase().includes(query.toLowerCase())
  );
  return filtered.map((c) => ({
    value: c.id,
    label: c.name,
    subtitle: `Instructor: ${c.instructor}`,
  }));
};

// Mock API for searching memberships
const searchMemberships = async (query: string): Promise<AsyncSelectOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
  const filtered = mockMemberships.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.price.toLowerCase().includes(query.toLowerCase())
  );
  return filtered.map((m) => ({
    value: m.id,
    label: m.name,
    subtitle: m.price,
  }));
};

// Mock breakdown detail items
const generateBreakdownDetails = (category: string, amount: number) => {
  const names = [
    "John Smith", "Emma Wilson", "James Brown", "Sarah Johnson", "Mike Chen",
    "Lisa Park", "Anna Lee", "David Kim", "Jessica Taylor", "Robert Garcia"
  ];
  const membershipTypes = ["Premium Monthly", "Standard Annual", "Basic Monthly", "Family Plan"];
  const classNames = ["Yoga Basics", "HIIT Pro", "Morning Spin", "Pilates Core"];
  
  const itemCount = Math.floor(Math.random() * 4) + 2;
  const items: Array<{ id: string; name: string; type: string; amount: number; date: string; reason?: string }> = [];
  let remaining = amount;
  
  for (let i = 0; i < itemCount; i++) {
    const isLast = i === itemCount - 1;
    const itemAmount = isLast ? remaining : Math.round(remaining * (0.2 + Math.random() * 0.4));
    remaining -= itemAmount;
    
    const reasons: Record<string, string[]> = {
      pendingPayments: ["Invoice sent, awaiting payment", "Payment reminder sent", "Processing bank transfer"],
      cancellations: ["Relocated to different city", "Financial constraints", "Health reasons", "Switched to competitor"],
      discounts: ["Loyalty discount (10%)", "Referral bonus", "Promotional offer", "Corporate discount"],
      latePayments: ["Payment delayed - bank issue", "Disputed charge", "Partial payment received"],
    };
    
    items.push({
      id: `${category}-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      type: Math.random() > 0.5 
        ? membershipTypes[Math.floor(Math.random() * membershipTypes.length)]
        : classNames[Math.floor(Math.random() * classNames.length)],
      amount: itemAmount,
      date: format(subDays(new Date(), Math.floor(Math.random() * 7)), "MMM dd, yyyy"),
      reason: reasons[category]?.[Math.floor(Math.random() * (reasons[category]?.length || 1))],
    });
  }
  
  return items;
};

// Sample data generator
const generateRevenueData = (filter: string, subFilter?: string, gender?: string) => {
  const today = new Date();
  const startDate = subDays(today, 30);
  const days = eachDayOfInterval({ start: startDate, end: today });

  return days.map((date) => {
    let baseExpected = 2500 + Math.random() * 1500;
    let baseReceived = baseExpected * (0.7 + Math.random() * 0.35);

    // Adjust based on filter
    if (filter === "memberships") {
      baseExpected *= 0.6;
      baseReceived *= 0.65;
      if (subFilter) {
        baseExpected *= 0.25;
        baseReceived *= 0.25;
      }
    } else if (filter === "classes") {
      baseExpected *= 0.25;
      baseReceived *= 0.2;
      if (subFilter) {
        baseExpected *= 0.15;
        baseReceived *= 0.15;
      }
    } else if (filter === "receipts") {
      baseExpected *= 0.15;
      baseReceived *= 0.15;
    }

    // Adjust based on gender filter
    if (gender === "male") {
      baseExpected *= 0.55;
      baseReceived *= 0.55;
    } else if (gender === "female") {
      baseExpected *= 0.45;
      baseReceived *= 0.45;
    }

    const difference = baseExpected - baseReceived;
    const pendingPayments = difference * 0.4;
    const cancellations = difference * 0.25;
    const discounts = difference * 0.2;
    const latePayments = difference * 0.15;

    return {
      date: format(date, "MMM dd"),
      fullDate: format(date, "yyyy-MM-dd"),
      expected: Math.round(baseExpected),
      received: Math.round(baseReceived),
      difference: Math.round(difference),
      breakdown: {
        pendingPayments: Math.round(pendingPayments),
        cancellations: Math.round(cancellations),
        discounts: Math.round(discounts),
        latePayments: Math.round(latePayments),
      },
    };
  });
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  formatCurrency: (amount: number) => string;
}

const CustomChartTooltip = ({ active, payload, label, formatCurrency }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const expected = payload.find((p) => p.dataKey === "expected")?.value || 0;
  const received = payload.find((p) => p.dataKey === "received")?.value || 0;
  const difference = expected - received;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
      <p className="font-semibold text-card-foreground mb-2">{label}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Expected:</span>
          <span className="font-medium text-primary">{formatCurrency(expected)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Received:</span>
          <span className="font-medium text-success">{formatCurrency(received)}</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Difference:</span>
            <span className={`font-medium ${difference > 0 ? "text-destructive" : "text-success"}`}>
              {difference > 0 ? "-" : "+"}{formatCurrency(Math.abs(difference))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RevenueAnalytics() {
  const navigate = useNavigate();
  const { formatCurrency, formatCompact, symbol } = useCurrency();
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [indicatorPosition, setIndicatorPosition] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [breakdownCategory, setBreakdownCategory] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const chartWidth = useMemo(() => {
    const baseWidth = 100;
    return `${baseWidth * zoomLevel}%`;
  }, [zoomLevel]);

  const rawData = useMemo(
    () => generateRevenueData(revenueFilter, subFilter, genderFilter === "all" ? undefined : genderFilter),
    [revenueFilter, subFilter, genderFilter]
  );

  // Aggregate data based on granularity
  const data = useMemo(() => {
    if (granularity === "daily") return rawData;

    const aggregateData = (items: typeof rawData) => ({
      expected: items.reduce((sum, d) => sum + d.expected, 0),
      received: items.reduce((sum, d) => sum + d.received, 0),
      difference: items.reduce((sum, d) => sum + d.difference, 0),
      breakdown: {
        pendingPayments: items.reduce((sum, d) => sum + d.breakdown.pendingPayments, 0),
        cancellations: items.reduce((sum, d) => sum + d.breakdown.cancellations, 0),
        discounts: items.reduce((sum, d) => sum + d.breakdown.discounts, 0),
        latePayments: items.reduce((sum, d) => sum + d.breakdown.latePayments, 0),
      },
    });

    if (granularity === "weekly") {
      const weeks: Record<string, typeof rawData> = {};
      rawData.forEach(d => {
        const weekStart = format(startOfWeek(parseISO(d.fullDate), { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weeks[weekStart]) weeks[weekStart] = [];
        weeks[weekStart].push(d);
      });
      return Object.entries(weeks).map(([weekStart, items]) => {
        const agg = aggregateData(items);
        const weekEnd = format(endOfWeek(parseISO(weekStart), { weekStartsOn: 1 }), "MMM dd");
        return {
          date: `${format(parseISO(weekStart), "MMM dd")} - ${weekEnd}`,
          fullDate: weekStart,
          ...agg,
        };
      });
    }

    if (granularity === "monthly") {
      const months: Record<string, typeof rawData> = {};
      rawData.forEach(d => {
        const monthKey = format(parseISO(d.fullDate), "yyyy-MM");
        if (!months[monthKey]) months[monthKey] = [];
        months[monthKey].push(d);
      });
      return Object.entries(months).map(([monthKey, items]) => {
        const agg = aggregateData(items);
        return {
          date: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
          fullDate: `${monthKey}-01`,
          ...agg,
        };
      });
    }

    return rawData;
  }, [rawData, granularity]);

  const selectedData = useMemo(() => {
    if (!selectedDate) return null;
    return data.find((d) => d.fullDate === selectedDate);
  }, [data, selectedDate]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, curr) => ({
        expected: acc.expected + curr.expected,
        received: acc.received + curr.received,
        difference: acc.difference + curr.difference,
      }),
      { expected: 0, received: 0, difference: 0 }
    );
  }, [data]);

  const handleChartClick = (e: any) => {
    if (hasDragged) return; // Don't open modal if user dragged
    if (e && e.activePayload && e.activePayload.length > 0) {
      const clickedData = e.activePayload[0].payload;
      setSelectedDate(clickedData.fullDate);
      setIndicatorPosition(e.activeTooltipIndex);
      setIsDetailModalOpen(true);
    }
  };

  // Generate prediction data based on current trends
  const getPrediction = useMemo(() => {
    if (!selectedData) return null;
    const collectionRate = (selectedData.received / selectedData.expected) * 100;
    const nextDayPredicted = Math.round(selectedData.expected * (0.95 + Math.random() * 0.15));
    const weekPredicted = Math.round(nextDayPredicted * 7 * (0.9 + Math.random() * 0.1));
    
    return {
      collectionRate,
      nextDayPredicted,
      weekPredicted,
      trend: collectionRate >= 85 ? "positive" : collectionRate >= 70 ? "neutral" : "negative",
      insight: collectionRate >= 85 
        ? "Collection rate is excellent. Keep up the good work!"
        : collectionRate >= 70 
          ? "Collection rate is moderate. Consider following up on pending payments."
          : "Collection rate needs attention. Review cancellation reasons and payment delays.",
    };
  }, [selectedData]);

  const handleRevenueFilterChange = (value: string) => {
    setRevenueFilter(value);
    setSubFilter(""); // Reset sub-filter when main filter changes
  };

  const handleClassSearch = useCallback(async (query: string) => {
    return searchClasses(query);
  }, []);

  const handleMembershipSearch = useCallback(async (query: string) => {
    return searchMemberships(query);
  }, []);

  const getFilterLabel = () => {
    if (subFilter) {
      if (revenueFilter === "classes") {
        const classItem = mockClasses.find((c) => c.id === subFilter);
        return classItem?.name || "Selected Class";
      }
      if (revenueFilter === "memberships") {
        const membershipItem = mockMemberships.find((m) => m.id === subFilter);
        return membershipItem?.name || "Selected Membership";
      }
    }
    switch (revenueFilter) {
      case "memberships":
        return "All Memberships";
      case "classes":
        return "All Classes";
      case "receipts":
        return "Receipts";
      default:
        return "All Sources";
    }
  };

  const getGenderLabel = () => {
    switch (genderFilter) {
      case "male":
        return " (Male)";
      case "female":
        return " (Female)";
      default:
        return "";
    }
  };

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
              Advanced Revenue Prediction
            </h1>
            <p className="text-sm text-muted-foreground">
              Analyze expected vs actual revenue
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          Last 30 Days
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Expected Revenue</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {formatCurrency(totals.expected)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Received Revenue</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {formatCurrency(totals.received)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Revenue Gap</p>
              <p className="text-lg sm:text-xl font-bold text-destructive">
                -{formatCurrency(totals.difference)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {/* Revenue Source Filter */}
            <div className="space-y-1.5 min-w-[160px] flex-1 sm:flex-none">
              <label className="text-xs text-muted-foreground">Revenue Source</label>
              <Select value={revenueFilter} onValueChange={handleRevenueFilterChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Revenue Source" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="memberships">Memberships</SelectItem>
                  <SelectItem value="classes">Classes</SelectItem>
                  <SelectItem value="receipts">Receipts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sub-filter: Classes (async) */}
            {revenueFilter === "classes" && (
              <div className="space-y-1.5 min-w-[180px] flex-1 sm:flex-none">
                <label className="text-xs text-muted-foreground">Select Class</label>
                <AsyncSelect
                  placeholder="Search classes..."
                  value={subFilter}
                  onChange={setSubFilter}
                  onSearch={handleClassSearch}
                  className="w-full"
                />
              </div>
            )}

            {/* Sub-filter: Memberships (async) */}
            {revenueFilter === "memberships" && (
              <div className="space-y-1.5 min-w-[180px] flex-1 sm:flex-none">
                <label className="text-xs text-muted-foreground">Select Membership</label>
                <AsyncSelect
                  placeholder="Search memberships..."
                  value={subFilter}
                  onChange={setSubFilter}
                  onSearch={handleMembershipSearch}
                  className="w-full"
                />
              </div>
            )}

            {/* Gender Filter */}
            <div className="space-y-1.5 min-w-[140px] flex-1 sm:flex-none">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Gender
              </label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Revenue Trend - {getFilterLabel()}{getGenderLabel()}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground mr-2">
              Click on chart to see date details
            </p>
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-1 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div 
          ref={chartContainerRef}
          className={`h-[300px] sm:h-[350px] overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div style={{ width: chartWidth, minWidth: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                onClick={handleChartClick}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval={zoomLevel >= 2 ? 0 : "preserveStartEnd"}
                />
                <YAxis
                  tickFormatter={(value) => formatCompact(value)}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={55}
                />
                <Tooltip content={<CustomChartTooltip formatCurrency={formatCurrency} />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  formatter={(value) => (
                    <span className="text-sm text-foreground capitalize">{value}</span>
                  )}
                />
                {selectedDate && indicatorPosition !== null && (
                  <ReferenceLine
                    x={data[indicatorPosition]?.date}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  name="Expected"
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(var(--success))" }}
                  name="Received"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* X-Axis Frequency Controls */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-border mt-4">
          <span className="text-xs text-muted-foreground mr-2">X-Axis Interval:</span>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(["daily", "weekly", "monthly"] as const).map((g) => (
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
      </Card>

      {/* Date Details */}
      {selectedData && (
        <Card className="p-4 sm:p-6 border-primary/30 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Revenue Breakdown
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedData.fullDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Expected</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {formatCurrency(selectedData.expected)}
                  </p>
                </div>
                <div className="bg-success/5 rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Received</p>
                  <p className="text-xl sm:text-2xl font-bold text-success">
                    {formatCurrency(selectedData.received)}
                  </p>
                </div>
              </div>
              <div className="bg-destructive/5 rounded-xl p-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Difference</p>
                <p className="text-xl sm:text-2xl font-bold text-destructive">
                  -{formatCurrency(selectedData.difference)}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Reasons for Difference</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-sm text-foreground">Pending Payments</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedData.breakdown.pendingPayments)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-sm text-foreground">Cancellations</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedData.breakdown.cancellations)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">Discounts Applied</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedData.breakdown.discounts)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-sm text-foreground">Late Payments</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedData.breakdown.latePayments)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Revenue Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={(open) => { setIsDetailModalOpen(open); if (!open) setBreakdownCategory(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Revenue Details - {selectedData?.date}
            </DialogTitle>
          </DialogHeader>
          
          {selectedData && getPrediction && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Expected Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedData.expected)}</p>
                </Card>
                <Card className="p-4 bg-success/10 border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Received Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-success">{formatCurrency(selectedData.received)}</p>
                </Card>
              </div>

              {/* Collection Rate */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Collection Rate</span>
                  <Badge variant={getPrediction.trend === "positive" ? "default" : getPrediction.trend === "neutral" ? "secondary" : "destructive"}>
                    {getPrediction.collectionRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={getPrediction.collectionRate} className="h-3" />
                <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {getPrediction.insight}
                </p>
              </Card>

              {/* Reasons for Difference */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    {breakdownCategory ? (
                      <>
                        {breakdownCategory === "pendingPayments" && "Pending Payments"}
                        {breakdownCategory === "cancellations" && "Cancellations"}
                        {breakdownCategory === "discounts" && "Discounts Applied"}
                        {breakdownCategory === "latePayments" && "Late Payments"}
                        {" Details"}
                      </>
                    ) : (
                      <>Revenue Gap Breakdown ({formatCurrency(selectedData.difference)})</>
                    )}
                  </h3>
                  {breakdownCategory && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setBreakdownCategory(null)}
                      className="text-muted-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>
                
                {!breakdownCategory ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setBreakdownCategory("pendingPayments")}
                      className="w-full flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">Pending Payments</p>
                          <p className="text-xs text-muted-foreground">Invoices awaiting payment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-orange-500">
                          {formatCurrency(selectedData.breakdown.pendingPayments)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setBreakdownCategory("cancellations")}
                      className="w-full flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Ban className="h-5 w-5 text-destructive" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">Cancellations</p>
                          <p className="text-xs text-muted-foreground">Membership & class cancellations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-destructive">
                          {formatCurrency(selectedData.breakdown.cancellations)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setBreakdownCategory("discounts")}
                      className="w-full flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Percent className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">Discounts Applied</p>
                          <p className="text-xs text-muted-foreground">Promotional & loyalty discounts</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(selectedData.breakdown.discounts)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setBreakdownCategory("latePayments")}
                      className="w-full flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Timer className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">Late Payments</p>
                          <p className="text-xs text-muted-foreground">Overdue from previous periods</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {formatCurrency(selectedData.breakdown.latePayments)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generateBreakdownDetails(
                      breakdownCategory,
                      breakdownCategory === "pendingPayments" ? selectedData.breakdown.pendingPayments :
                      breakdownCategory === "cancellations" ? selectedData.breakdown.cancellations :
                      breakdownCategory === "discounts" ? selectedData.breakdown.discounts :
                      selectedData.breakdown.latePayments
                    ).map((item) => (
                      <div key={item.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.type}</p>
                              {item.reason && (
                                <p className="text-xs text-muted-foreground mt-1 italic">"{item.reason}"</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            breakdownCategory === "pendingPayments" ? "text-orange-500" :
                            breakdownCategory === "cancellations" ? "text-destructive" :
                            breakdownCategory === "discounts" ? "text-primary" :
                            "text-muted-foreground"
                          }`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Predictions */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Revenue Predictions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Next Day Forecast</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(getPrediction.nextDayPredicted)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(addDays(parseISO(selectedData.fullDate), 1), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">7-Day Forecast</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(getPrediction.weekPredicted)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Next week total</p>
                  </div>
                </div>
              </Card>

              {/* Trend Indicator */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50">
                {getPrediction.trend === "positive" ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : getPrediction.trend === "neutral" ? (
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {getPrediction.trend === "positive" 
                    ? "Strong performance - Above target" 
                    : getPrediction.trend === "neutral" 
                      ? "Moderate performance - On track"
                      : "Needs attention - Below target"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
