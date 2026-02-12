import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function QuickAddSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
  className,
}: QuickAddSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full sm:max-w-lg !p-0 !gap-0 will-change-transform transform-gpu",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 sm:px-6 py-4 border-b border-border shrink-0">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 px-4 sm:px-6 py-4 pb-6">
              {children}
            </div>
          </ScrollArea>

          {onSubmit && (
            <div className="px-4 sm:px-6 py-4 border-t border-border shrink-0 bg-background">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : submitLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
