import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AsyncSelect, AsyncSelectOption } from "./async-select";

interface FilterOption {
  value: string;
  label: string;
}

interface BaseFilter {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface SyncFilter extends BaseFilter {
  type?: "sync";
  options: FilterOption[];
}

interface AsyncFilter extends BaseFilter {
  type: "async";
  onSearch: (query: string) => Promise<AsyncSelectOption[]>;
}

export type FilterConfig = SyncFilter | AsyncFilter;

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  actions,
  className,
}: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const hasActiveFilters = filters.some((f) => f.value !== "all" && f.value !== "");

  const renderFilter = (filter: FilterConfig, isMobile = false) => {
    if (filter.type === "async") {
      return (
        <AsyncSelect
          key={filter.key}
          placeholder={filter.label}
          value={filter.value}
          onChange={filter.onChange}
          onSearch={filter.onSearch}
          className={isMobile ? "w-full" : "min-w-[160px]"}
        />
      );
    }

    return (
      <select
        key={filter.key}
        value={filter.value}
        onChange={(e) => filter.onChange(e.target.value)}
        className={cn(
          "px-3 py-2.5 rounded-xl text-sm border transition-all appearance-none cursor-pointer bg-card focus:outline-none focus:ring-2 focus:ring-primary/30",
          filter.value !== "all" && filter.value !== ""
            ? "border-primary/50 text-primary bg-primary/5"
            : "border-border/50 text-card-foreground",
          isMobile ? "w-full" : ""
        )}
      >
        <option value="all">{filter.label}</option>
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={cn(
              "md:hidden p-2.5 rounded-xl border transition-colors",
              showMobileFilters || hasActiveFilters
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border/50 text-muted-foreground"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-2">
          {filters.map((filter) => renderFilter(filter))}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Mobile Filters Dropdown */}
      {showMobileFilters && filters.length > 0 && (
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 animate-fade-in">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="text-xs text-muted-foreground mb-1.5 block">{filter.label}</label>
              {renderFilter(filter, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
