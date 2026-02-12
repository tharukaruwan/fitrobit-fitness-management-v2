import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DurationValue {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

interface DurationInputProps {
  value: DurationValue;
  onChange: (value: DurationValue) => void;
  error?: string;
  className?: string;
}

export function DurationInput({ value, onChange, error, className }: DurationInputProps) {
  const handleChange = (field: keyof typeof value, inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    
    // Validation rules
    let validatedValue = numValue;
    
    switch (field) {
      case "years":
        validatedValue = Math.min(Math.max(numValue, 0), 10); // 0-10 years
        break;
      case "months":
        validatedValue = Math.min(Math.max(numValue, 0), 11); // 0-11 months
        break;
      case "weeks":
        validatedValue = Math.min(Math.max(numValue, 0), 4); // 0-4 weeks (within a month)
        break;
      case "days":
        validatedValue = Math.min(Math.max(numValue, 0), 6); // 0-6 days (within a week)
        break;
    }

    onChange({ ...value, [field]: validatedValue });
  };

  const getTotalDays = () => {
    return (value.years * 365) + (value.months * 30) + (value.weeks * 7) + value.days;
  };

  const getDisplayText = () => {
    const parts: string[] = [];
    if (value.years > 0) parts.push(`${value.years} year${value.years > 1 ? 's' : ''}`);
    if (value.months > 0) parts.push(`${value.months} month${value.months > 1 ? 's' : ''}`);
    if (value.weeks > 0) parts.push(`${value.weeks} week${value.weeks > 1 ? 's' : ''}`);
    if (value.days > 0) parts.push(`${value.days} day${value.days > 1 ? 's' : ''}`);
    
    if (parts.length === 0) return "0 days";
    return parts.join(", ");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">Duration *</Label>
      
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="years" className="text-xs text-muted-foreground">Years</Label>
          <Input
            id="years"
            type="number"
            min={0}
            max={10}
            value={value.years}
            onChange={(e) => handleChange("years", e.target.value)}
            className="text-center"
            placeholder="0"
          />
          <p className="text-[10px] text-muted-foreground text-center">0-10</p>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="months" className="text-xs text-muted-foreground">Months</Label>
          <Input
            id="months"
            type="number"
            min={0}
            max={11}
            value={value.months}
            onChange={(e) => handleChange("months", e.target.value)}
            className="text-center"
            placeholder="0"
          />
          <p className="text-[10px] text-muted-foreground text-center">0-11</p>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="weeks" className="text-xs text-muted-foreground">Weeks</Label>
          <Input
            id="weeks"
            type="number"
            min={0}
            max={4}
            value={value.weeks}
            onChange={(e) => handleChange("weeks", e.target.value)}
            className="text-center"
            placeholder="0"
          />
          <p className="text-[10px] text-muted-foreground text-center">0-4</p>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="days" className="text-xs text-muted-foreground">Days</Label>
          <Input
            id="days"
            type="number"
            min={0}
            max={6}
            value={value.days}
            onChange={(e) => handleChange("days", e.target.value)}
            className="text-center"
            placeholder="0"
          />
          <p className="text-[10px] text-muted-foreground text-center">0-6</p>
        </div>
      </div>

      {/* Display summary */}
      <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
        <span className="text-muted-foreground">Total: </span>
        <span className="font-medium text-foreground">{getDisplayText()}</span>
        <span className="text-muted-foreground ml-1">({getTotalDays()} days)</span>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
