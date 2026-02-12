import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LucideIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  priority: "always" | "md" | "lg" | "xl";
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface RowAction<T> {
  icon: LucideIcon;
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "primary" | "danger";
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
  isLoading?: boolean;
  rowActions?: RowAction<T>[];
  customActions?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  pagination,
  isLoading,
  rowActions,
  customActions,
}: ResponsiveTableProps<T>) {
  const getPriorityClass = (priority: Column<T>["priority"]) => {
    switch (priority) {
      case "always":
        return "";
      case "md":
        return "hidden md:table-cell";
      case "lg":
        return "hidden lg:table-cell";
      case "xl":
        return "hidden xl:table-cell";
      default:
        return "";
    }
  };

  const getValue = (item: T, key: string): any => {
    const keys = key.split(".");
    let value: any = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, totalItems, itemsPerPage, onPageChange } = pagination;
    
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const effectiveTotalPages = Math.max(1, totalPages);

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (effectiveTotalPages <= maxVisiblePages) {
        for (let i = 1; i <= effectiveTotalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push("...");
          pages.push(effectiveTotalPages);
        } else if (currentPage >= effectiveTotalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = effectiveTotalPages - 3; i <= effectiveTotalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push("...");
          pages.push(effectiveTotalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-card-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-card-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-card-foreground">{totalItems}</span> results
        </p>

        {effectiveTotalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && onPageChange(page)}
                  disabled={page === "..." || page === currentPage}
                  className={cn(
                    "min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors",
                    page === currentPage
                      ? "bg-primary text-primary-foreground"
                      : page === "..."
                      ? "cursor-default"
                      : "hover:bg-muted cursor-pointer"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <span className="sm:hidden text-sm text-muted-foreground px-2">
              {currentPage} / {effectiveTotalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= effectiveTotalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    getPriorityClass(col.priority),
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
              {(rowActions && rowActions.length > 0) || customActions ? (
                <th className="px-2 py-3 w-auto" />
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (rowActions?.length ? 1 : 0)} className="py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions?.length ? 1 : 0)} className="py-12 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors hover:bg-accent/30",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => {
                    const value = getValue(item, String(col.key));
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-4 py-3 text-sm text-card-foreground",
                          getPriorityClass(col.priority),
                          col.className
                        )}
                      >
                        {col.render ? col.render(value, item) : value}
                      </td>
                    );
                  })}
                  {((rowActions && rowActions.length > 0) || customActions) && (
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {customActions && customActions(item)}
                        {rowActions && rowActions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                              {rowActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                  <DropdownMenuItem
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(item);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 cursor-pointer",
                                      action.variant === "danger" && "text-destructive focus:text-destructive",
                                      action.variant === "primary" && "text-primary focus:text-primary"
                                    )}
                                  >
                                    <Icon className="w-4 h-4" />
                                    <span>{action.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}
