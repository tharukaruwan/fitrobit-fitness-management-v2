import * as React from "react";
import { format, differenceInDays, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  maxDays?: number;
  minDays?: number;
  className?: string;
}

const presets = [
  { label: "7d", fullLabel: "Last 7 days", days: 7 },
  { label: "14d", fullLabel: "Last 14 days", days: 14 },
  { label: "30d", fullLabel: "Last 30 days", days: 30 },
  { label: "90d", fullLabel: "Last 90 days", days: 90 },
];

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  maxDays = 365,
  minDays = 1,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempStartDate, setTempStartDate] = React.useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = React.useState<Date>(endDate);
  const [selectingStart, setSelectingStart] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const dateRangeDays = React.useMemo(() => {
    return Math.max(1, differenceInDays(tempEndDate, tempStartDate) + 1);
  }, [tempStartDate, tempEndDate]);

  const validateDates = React.useCallback((start: Date, end: Date) => {
    const days = differenceInDays(end, start) + 1;
    
    if (start > end) {
      return "Start date must be before end date";
    }
    if (days > maxDays) {
      return `Date range cannot exceed ${maxDays} days`;
    }
    if (days < minDays) {
      return `Date range must be at least ${minDays} day(s)`;
    }
    if (end > new Date()) {
      return "End date cannot be in the future";
    }
    return null;
  }, [maxDays, minDays]);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const validationError = validateDates(date, tempEndDate);
    if (validationError && date > tempEndDate) {
      // Auto-adjust end date if start is after current end
      setTempStartDate(date);
      setTempEndDate(date);
      setError(null);
    } else {
      setTempStartDate(date);
      setError(validateDates(date, tempEndDate));
    }
    setSelectingStart(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setTempEndDate(date);
    setError(validateDates(tempStartDate, date));
    setSelectingStart(true);
  };

  const handleApply = () => {
    const validationError = validateDates(tempStartDate, tempEndDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    onStartDateChange(tempStartDate);
    onEndDateChange(tempEndDate);
    setIsOpen(false);
    setError(null);
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    setTempStartDate(start);
    setTempEndDate(end);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setError(null);
      setSelectingStart(true);
    }
    setIsOpen(open);
  };

  const displayDays = React.useMemo(() => {
    return Math.max(1, differenceInDays(endDate, startDate) + 1);
  }, [startDate, endDate]);

  return (
    <div className={cn("flex items-center gap-1 sm:gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-8 sm:h-9 px-2 sm:px-3",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{format(startDate, "MMM d")}</span>
            <ChevronRight className="h-3 w-3 mx-0.5 sm:mx-1 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{format(endDate, "MMM d")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="end" sideOffset={4}>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.days}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs h-7 px-2 sm:px-3",
                    dateRangeDays === preset.days && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handlePreset(preset.days)}
                >
                  <span className="sm:hidden">{preset.label}</span>
                  <span className="hidden sm:inline">{preset.fullLabel}</span>
                </Button>
              ))}
            </div>

            {/* Selection indicator */}
            <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
              <button
                onClick={() => setSelectingStart(true)}
                className={cn(
                  "flex-1 text-center p-1.5 sm:p-2 rounded-md transition-all min-w-0",
                  selectingStart 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 sm:ring-offset-2" 
                    : "bg-background hover:bg-muted"
                )}
              >
                <p className={cn(
                  "text-[10px] sm:text-xs mb-0.5 sm:mb-1",
                  selectingStart ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>Start</p>
                <p className="font-semibold text-xs sm:text-sm truncate">{format(tempStartDate, "MMM d")}</p>
              </button>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              <button
                onClick={() => setSelectingStart(false)}
                className={cn(
                  "flex-1 text-center p-1.5 sm:p-2 rounded-md transition-all min-w-0",
                  !selectingStart 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 sm:ring-offset-2" 
                    : "bg-background hover:bg-muted"
                )}
              >
                <p className={cn(
                  "text-[10px] sm:text-xs mb-0.5 sm:mb-1",
                  !selectingStart ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>End</p>
                <p className="font-semibold text-xs sm:text-sm truncate">{format(tempEndDate, "MMM d")}</p>
              </button>
            </div>

            {/* Calendar */}
            <div className="flex justify-center overflow-x-auto">
              <Calendar
                mode="single"
                selected={selectingStart ? tempStartDate : tempEndDate}
                onSelect={selectingStart ? handleStartDateSelect : handleEndDateSelect}
                initialFocus
                className={cn("p-2 sm:p-3 pointer-events-auto")}
                disabled={(date) => date > new Date()}
                modifiers={{
                  range_start: tempStartDate,
                  range_end: tempEndDate,
                  range_middle: (date) => date > tempStartDate && date < tempEndDate,
                }}
                modifiersClassNames={{
                  range_start: "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
                  range_end: "bg-primary text-primary-foreground rounded-r-md rounded-l-none",
                  range_middle: "bg-primary/20 rounded-none",
                }}
              />
            </div>

            {/* Range info & Error */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Range:</span>
                <Badge variant="secondary" className="font-medium text-xs">
                  {dateRangeDays} {dateRangeDays === 1 ? "day" : "days"}
                </Badge>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-md text-xs sm:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="line-clamp-2">{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs sm:text-sm" onClick={handleApply} disabled={!!error}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Badge variant="outline" className="font-medium whitespace-nowrap text-xs h-6 sm:h-7 px-1.5 sm:px-2">
        {displayDays}d
      </Badge>
    </div>
  );
}
