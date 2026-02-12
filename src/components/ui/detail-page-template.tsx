import * as React from "react";
import { ArrowLeft, Camera, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DetailTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface DetailPageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface DetailPageTemplateProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  badge?: React.ReactNode;
  tabs: DetailTab[];
  defaultTab?: string;
  headerActions?: DetailPageHeaderAction[];
  backPath?: string;
  className?: string;
  onAvatarChange?: (file: File) => void;
}

export function DetailPageTemplate({
  title,
  subtitle,
  avatar,
  badge,
  tabs,
  defaultTab,
  headerActions,
  backPath,
  className,
  onAvatarChange,
}: DetailPageTemplateProps) {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [showCameraModal, setShowCameraModal] = React.useState(false);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError("Unable to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
    setTimeout(() => startCamera(), 100);
  };

  const handleCloseCamera = () => {
    stopCamera();
    setShowCameraModal(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob && onAvatarChange) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            onAvatarChange(file);
            handleCloseCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  // Cleanup stream on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className={cn("space-y-4 animate-fade-in", className)}>
      {/* Camera Modal */}
      <Dialog open={showCameraModal} onOpenChange={(open) => !open && handleCloseCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {cameraError ? (
              <div className="text-center py-8 text-destructive">{cameraError}</div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleCloseCamera}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              {!cameraError && (
                <Button onClick={capturePhoto}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header Section with Integrated Navigation */}
      <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full space-y-4">
        <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
          {/* Top Section: Back Button + Profile + Actions */}
          <div className="p-4 md:p-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar with upload/camera options */}
              {avatar && (
                <div className="shrink-0 relative">
                  {avatar}
                  {onAvatarChange && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="absolute -bottom-1 -right-1 flex gap-1">
                        <button
                          onClick={handleFileUpload}
                          className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                          title="Upload image"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleOpenCamera}
                          className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                          title="Take photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-card-foreground truncate">
                    {title}
                  </h1>
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Header Actions - Icons only on mobile */}
              {headerActions && headerActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  {headerActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="sm"
                      onClick={action.onClick}
                      className="shrink-0"
                    >
                      {action.icon}
                      <span className="hidden sm:inline ml-1.5">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Icon Grid Navigation - Integrated in Card */}
          <div className="p-3 sm:p-4 bg-muted/20">
            <TabsList className="grid gap-2 bg-transparent h-auto p-0" style={{ 
              gridTemplateColumns: `repeat(auto-fill, minmax(${tabs.length > 8 ? '70px' : '80px'}, 1fr))` 
            }}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-transparent bg-card p-2.5 sm:p-3 text-muted-foreground transition-all hover:bg-accent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm h-auto min-h-[60px] sm:min-h-[72px]"
                >
                  {tab.icon && (
                    <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">{tab.icon}</span>
                  )}
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight line-clamp-1">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="p-3 sm:p-4 md:p-6 mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

/* Info Grid Component for displaying key-value pairs */
export interface InfoItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function InfoGrid({ items, columns = 2, className }: InfoGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-muted/30 rounded-lg p-4 border border-border/30"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <div className="text-sm font-medium text-card-foreground">
            {item.value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Section Header for tab content sections */
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
      {action}
    </div>
  );
}
