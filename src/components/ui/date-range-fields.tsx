import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const defaultYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

interface DateRangeFieldsProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  className?: string;
  disableFuture?: boolean;
  years?: number[];
}

export function DateRangeFields({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  disableFuture = true,
  years = defaultYears,
}: DateRangeFieldsProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      {/* Start Date */}
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
                  onStartDateChange(newDate);
                }}
              >
                <SelectTrigger className="w-[120px] h-8 text-sm rounded-[0.625rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={startDate.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(startDate);
                  newDate.setFullYear(parseInt(value));
                  onStartDateChange(newDate);
                }}
              >
                <SelectTrigger className="w-[90px] h-8 text-sm rounded-[0.625rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && onStartDateChange(date)}
              month={startDate}
              disabled={disableFuture ? (date) => date > new Date() : undefined}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
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
                  onEndDateChange(newDate);
                }}
              >
                <SelectTrigger className="w-[120px] h-8 text-sm rounded-[0.625rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={endDate.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(endDate);
                  newDate.setFullYear(parseInt(value));
                  onEndDateChange(newDate);
                }}
              >
                <SelectTrigger className="w-[90px] h-8 text-sm rounded-[0.625rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && onEndDateChange(date)}
              month={endDate}
              disabled={disableFuture ? (date) => date > new Date() : undefined}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
