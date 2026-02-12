import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ImagePreview({ src, alt, className, size = "sm" }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showQuickPreview, setShowQuickPreview] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewId = React.useId();
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const calculatePosition = React.useCallback(() => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768;
    const previewWidth = isMobile ? Math.min(viewportWidth - 32, 280) : 280;
    const previewHeight = isMobile ? previewWidth + 40 : 300;
    
    let left = rect.left + rect.width / 2;
    let top = rect.bottom + 12;
    
    // Adjust horizontal position if too close to edges
    if (left + previewWidth / 2 > viewportWidth - 16) {
      left = viewportWidth - previewWidth / 2 - 16;
    }
    if (left - previewWidth / 2 < 16) {
      left = previewWidth / 2 + 16;
    }
    
    // If preview would go below viewport, show above the image
    if (top + previewHeight > viewportHeight - 16) {
      top = rect.top - previewHeight - 12;
    }
    
    // For mobile, center it more
    if (isMobile) {
      left = viewportWidth / 2;
      // Position in upper third of screen for better visibility
      if (top + previewHeight > viewportHeight - 100) {
        top = Math.max(80, rect.top - previewHeight - 12);
      }
    }
    
    return { top, left };
  }, []);

  // Desktop hover handlers
  const handleMouseEnter = React.useCallback(() => {
    const position = calculatePosition();
    if (position) {
      setPosition(position);
      setShowQuickPreview(true);
    }
  }, [calculatePosition]);

  const handleMouseLeave = React.useCallback(() => {
    setShowQuickPreview(false);
    setPosition(null);
  }, []);

  // Mobile/tablet touch handlers
  const handleTouchStart = React.useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      // Long press opens full modal
      setShowQuickPreview(false);
      setIsOpen(true);
    }, 500);
  }, []);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTap = React.useCallback((e: React.MouseEvent) => {
    // On mobile, single tap toggles quick preview
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      
      if (showQuickPreview) {
        setShowQuickPreview(false);
        setPosition(null);
      } else {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
          setShowQuickPreview(true);
        }
      }
    } else {
      // Desktop: click opens full modal
      setShowQuickPreview(false);
      setIsOpen(true);
    }
  }, [showQuickPreview, calculatePosition]);

  // Close quick preview when clicking outside
  React.useEffect(() => {
    if (!showQuickPreview) return;
    
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowQuickPreview(false);
        setPosition(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showQuickPreview]);

  // Recalculate position on scroll
  React.useEffect(() => {
    if (!showQuickPreview) return;
    
    const handleScroll = () => {
      const pos = calculatePosition();
      if (pos) {
        setPosition(pos);
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [showQuickPreview, calculatePosition]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={handleTap}
          className={cn(
            "relative overflow-hidden rounded-full ring-2 ring-border/50 transition-all duration-200 hover:ring-primary/50 hover:scale-110",
            sizeClasses[size],
            className
          )}
        >
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        </button>
      </div>

      {/* Quick preview - works on all devices via portal */}
      {showQuickPreview && position && typeof document !== 'undefined' && createPortal(
        <div 
          key={previewId}
          className="fixed z-[9999]"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
            animation: 'preview-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Tap on preview opens full modal on mobile
            const isTouchDevice = window.matchMedia('(hover: none)').matches;
            if (isTouchDevice) {
              setShowQuickPreview(false);
              setIsOpen(true);
            }
          }}
        >
          <div 
            className="relative bg-background p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-border/50"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <img
              src={src}
              alt={alt}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg sm:rounded-xl object-cover"
            />
            <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-lg sm:rounded-b-xl p-3 sm:p-4 pt-6 sm:pt-8">
              <p className="text-xs sm:text-sm text-white font-medium truncate">{alt}</p>
            </div>
            {/* Mobile hint */}
            <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
              Tap to expand • Hold for full view
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen modal - works on all devices */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
          style={{ animation: 'fade-in 0.2s ease-out forwards' }}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="w-full max-w-lg mx-auto"
            style={{ animation: 'preview-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white/80 mt-3 text-sm font-medium px-4 truncate">{alt}</p>
          </div>
        </div>
      )}

      {/* Inject keyframes for animations */}
      <style>{`
        @keyframes preview-pop-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.9) translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1) translateY(0);
          }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
