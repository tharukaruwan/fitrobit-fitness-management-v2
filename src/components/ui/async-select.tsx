import * as React from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AsyncSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface AsyncSelectProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<AsyncSelectOption[]>;
  className?: string;
  debounceMs?: number;
}

export function AsyncSelect({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  className,
  debounceMs = 300,
}: AsyncSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<AsyncSelectOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(query);
        setOptions(results);
      } catch (error) {
        console.error("Search failed:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, isOpen, onSearch, debounceMs]);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update selected label when value changes
  React.useEffect(() => {
    if (!value) {
      setSelectedLabel("");
    }
  }, [value]);

  const handleSelect = (option: AsyncSelectOption) => {
    onChange(option.value);
    setSelectedLabel(option.label);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSelectedLabel("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all w-full bg-card focus:outline-none focus:ring-2 focus:ring-primary/30",
          value
            ? "border-primary/50 text-primary bg-primary/5"
            : "border-border/50 text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="p-2 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {options.length === 0 && !isLoading && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {query ? "No results found" : "Start typing to search"}
              </div>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors flex flex-col",
                  option.value === value && "bg-primary/10 text-primary"
                )}
              >
                <span className="font-medium">{option.label}</span>
                {option.subtitle && (
                  <span className="text-xs text-muted-foreground">{option.subtitle}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
