import { useState } from "react";
import { Plus, Ruler, Scale, Dumbbell, Flame, Eye, Trash2, ImagePlus, Video, Link2, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type MediaType = "image" | "video" | "youtube" | "vimeo";

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  label: string;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  category: "body_composition" | "circumference" | "performance" | "vitals";
  unit: string;
  description: string;
  icon: string;
  media: MediaItem[];
  status: "active" | "inactive";
}

const categoryConfig = {
  body_composition: { label: "Body Composition", color: "bg-primary/10 text-primary border-primary/20" },
  circumference: { label: "Circumference", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  performance: { label: "Performance", color: "bg-warning/10 text-warning border-warning/20" },
  vitals: { label: "Vitals", color: "bg-success/10 text-success border-success/20" },
};

const initialTemplates: MeasurementTemplate[] = [
  {
    id: "mt1", name: "Weight", category: "body_composition", unit: "kg", description: "Total body weight measurement", icon: "scale",
    media: [
      { id: "med1", type: "image", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop", label: "Proper scale position" },
      { id: "med2", type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=200&fit=crop", label: "How to measure weight correctly" },
    ],
    status: "active",
  },
  {
    id: "mt2", name: "Body Fat %", category: "body_composition", unit: "%", description: "Body fat percentage using calipers or BIA", icon: "flame",
    media: [
      { id: "med3", type: "image", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=200&fit=crop", label: "Caliper measurement guide" },
    ],
    status: "active",
  },
  {
    id: "mt3", name: "Muscle Mass", category: "body_composition", unit: "kg", description: "Lean muscle mass measurement", icon: "dumbbell",
    media: [],
    status: "active",
  },
  {
    id: "mt4", name: "Chest", category: "circumference", unit: "cm", description: "Chest circumference at the widest point", icon: "ruler",
    media: [
      { id: "med4", type: "vimeo", url: "https://vimeo.com/123456789", thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop", label: "Chest measurement technique" },
    ],
    status: "active",
  },
  { id: "mt5", name: "Waist", category: "circumference", unit: "cm", description: "Waist circumference at navel level", icon: "ruler", media: [], status: "active" },
  { id: "mt6", name: "Hips", category: "circumference", unit: "cm", description: "Hip circumference at the widest point", icon: "ruler", media: [], status: "active" },
  { id: "mt7", name: "Arms (Biceps)", category: "circumference", unit: "cm", description: "Upper arm circumference flexed", icon: "ruler", media: [], status: "active" },
  { id: "mt8", name: "Thighs", category: "circumference", unit: "cm", description: "Upper thigh circumference", icon: "ruler", media: [], status: "active" },
  { id: "mt9", name: "1RM Bench Press", category: "performance", unit: "kg", description: "One rep max bench press", icon: "dumbbell", media: [], status: "active" },
  { id: "mt10", name: "Resting Heart Rate", category: "vitals", unit: "bpm", description: "Resting heart rate measurement", icon: "scale", media: [], status: "inactive" },
];

function getVideoId(url: string, type: "youtube" | "vimeo"): string | null {
  if (type === "youtube") {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

function getEmbedUrl(url: string, type: "youtube" | "vimeo"): string | null {
  const id = getVideoId(url, type);
  if (!id) return null;
  if (type === "youtube") return `https://www.youtube.com/embed/${id}`;
  if (type === "vimeo") return `https://player.vimeo.com/video/${id}`;
  return null;
}

const iconMap: Record<string, React.ReactNode> = {
  scale: <Scale className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  dumbbell: <Dumbbell className="w-5 h-5" />,
  ruler: <Ruler className="w-5 h-5" />,
};

export default function Measurements() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MeasurementTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [viewItem, setViewItem] = useState<MeasurementTemplate | null>(null);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);

  // Add form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "body_composition" as MeasurementTemplate["category"],
    unit: "",
    description: "",
    icon: "ruler",
  });
  const [newMedia, setNewMedia] = useState<MediaItem[]>([]);
  const [mediaLink, setMediaLink] = useState("");
  const [mediaLinkLabel, setMediaLinkLabel] = useState("");
  const mediaFileInputRef = useState<HTMLInputElement | null>(null);

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.unit) {
      toast({ title: "Missing Fields", description: "Name and unit are required", variant: "destructive" });
      return;
    }
    const template: MeasurementTemplate = {
      id: `mt${Date.now()}`,
      ...newTemplate,
      media: newMedia,
      status: "active",
    };
    setTemplates((prev) => [template, ...prev]);
    setNewTemplate({ name: "", category: "body_composition", unit: "", description: "", icon: "ruler" });
    setNewMedia([]);
    setShowAddSheet(false);
    toast({ title: "Measurement Added", description: `${template.name} has been created` });
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Deleted", description: "Measurement template removed" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setNewMedia((prev) => [...prev, {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        url,
        label: file.name.replace(/\.[^/.]+$/, ""),
      }]);
    });
    e.target.value = "";
  };

  const handleAddVideoLink = () => {
    if (!mediaLink) return;
    const isYoutube = mediaLink.includes("youtube.com") || mediaLink.includes("youtu.be");
    const isVimeo = mediaLink.includes("vimeo.com");

    if (!isYoutube && !isVimeo) {
      toast({ title: "Invalid Link", description: "Please enter a valid YouTube or Vimeo URL", variant: "destructive" });
      return;
    }

    const type: MediaType = isYoutube ? "youtube" : "vimeo";
    const videoId = getVideoId(mediaLink, type);

    setNewMedia((prev) => [...prev, {
      id: `media-${Date.now()}`,
      type,
      url: mediaLink,
      thumbnail: isYoutube && videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined,
      label: mediaLinkLabel || (isYoutube ? "YouTube Video" : "Vimeo Video"),
    }]);
    setMediaLink("");
    setMediaLinkLabel("");
    toast({ title: "Video Linked" });
  };

  const columns: Column<MeasurementTemplate>[] = [
    {
      key: "name",
      label: "Measurement",
      priority: "always",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {iconMap[item.icon] || <Ruler className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      priority: "md",
      render: (value: string) => {
        const cat = categoryConfig[value as keyof typeof categoryConfig];
        return <Badge variant="outline" className={cn("text-xs", cat?.color)}>{cat?.label}</Badge>;
      },
    },
    {
      key: "unit",
      label: "Unit",
      priority: "always",
      render: (value: string) => <span className="text-sm font-medium">{value}</span>,
    },
    {
      key: "media",
      label: "Media",
      priority: "md",
      render: (value: MediaItem[]) => (
        <div className="flex items-center gap-1">
          {value.length > 0 ? (
            <>
              <span className="text-xs text-muted-foreground">{value.length} file{value.length > 1 ? "s" : ""}</span>
              <div className="flex -space-x-1">
                {value.slice(0, 3).map((m) => (
                  <div key={m.id} className="w-6 h-6 rounded border border-background bg-muted flex items-center justify-center">
                    {m.type === "image" ? <ImagePlus className="w-3 h-3 text-muted-foreground" /> :
                     m.type === "video" ? <Video className="w-3 h-3 text-muted-foreground" /> :
                     <Play className="w-3 h-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      priority: "lg",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"} className="text-xs">
          {value === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const rowActions: RowAction<MeasurementTemplate>[] = [
    { icon: Eye, label: "View", onClick: (item) => setViewItem(item) },
    { icon: Trash2, label: "Delete", onClick: (item) => handleDelete(item.id), variant: "danger" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Measurements</h2>
          <p className="text-sm text-muted-foreground">Define measurement types with reference media</p>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Measurement</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = templates.filter((t) => t.category === key && t.status === "active").length;
          return (
            <Card key={key} className="bg-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search measurements..."
        filters={[
          {
            key: "category",
            label: "Category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "all", label: "All Categories" },
              ...Object.entries(categoryConfig).map(([key, config]) => ({
                value: key,
                label: config.label,
              })),
            ],
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
        onRowClick={(item) => setViewItem(item)}
      />

      {/* View Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {viewItem && (iconMap[viewItem.icon] || <Ruler className="w-5 h-5" />)}
              </div>
              <div>
                <p>{viewItem?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{viewItem?.unit} • {viewItem && categoryConfig[viewItem.category]?.label}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{viewItem.description}</p>

              {viewItem.media.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Reference Media</Label>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-2">
                      {viewItem.media.map((m) => (
                        <div
                          key={m.id}
                          className="shrink-0 w-40 rounded-lg overflow-hidden border border-border/50 bg-muted cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                          onClick={() => setPlayingMedia(m)}
                        >
                          <div className="relative aspect-video">
                            {m.type === "image" ? (
                              <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                            ) : m.type === "video" ? (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Play className="w-8 h-8 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="relative w-full h-full">
                                {m.thumbnail ? (
                                  <img src={m.thumbnail} alt={m.label} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Play className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs truncate">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{m.type === "youtube" ? "YouTube" : m.type === "vimeo" ? "Vimeo" : m.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Player Modal */}
      {playingMedia && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setPlayingMedia(null)}
        >
          <button
            onClick={() => setPlayingMedia(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
            {playingMedia.type === "image" ? (
              <img src={playingMedia.url} alt={playingMedia.label} className="w-full max-h-[80vh] rounded-2xl object-contain mx-auto" />
            ) : playingMedia.type === "video" ? (
              <video src={playingMedia.url} controls autoPlay className="w-full max-h-[80vh] rounded-2xl mx-auto" />
            ) : (
              <div className="aspect-video w-full rounded-2xl overflow-hidden">
                <iframe
                  src={getEmbedUrl(playingMedia.url, playingMedia.type as "youtube" | "vimeo") || ""}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <p className="text-center text-white/80 mt-3 text-sm font-medium">{playingMedia.label}</p>
          </div>
        </div>
      )}

      {/* Add Sheet */}
      <QuickAddSheet
        open={showAddSheet}
        onOpenChange={(open) => {
          setShowAddSheet(open);
          if (!open) { setNewMedia([]); setMediaLink(""); setMediaLinkLabel(""); }
        }}
        title="Add Measurement Type"
        description="Define a new measurement with reference media"
        onSubmit={handleAddTemplate}
        submitLabel="Create Measurement"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Name *</Label>
            <Input placeholder="e.g. Chest Circumference" value={newTemplate.name} onChange={(e) => setNewTemplate((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate((p) => ({ ...p, category: v as MeasurementTemplate["category"] }))}>
              <SelectTrigger className="rounded-[0.625rem]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit *</Label>
            <Input placeholder="e.g. cm, kg, %" value={newTemplate.unit} onChange={(e) => setNewTemplate((p) => ({ ...p, unit: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={newTemplate.icon} onValueChange={(v) => setNewTemplate((p) => ({ ...p, icon: v }))}>
              <SelectTrigger className="rounded-[0.625rem]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ruler">📏 Ruler</SelectItem>
                <SelectItem value="scale">⚖️ Scale</SelectItem>
                <SelectItem value="dumbbell">🏋️ Dumbbell</SelectItem>
                <SelectItem value="flame">🔥 Flame</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description</Label>
            <Textarea placeholder="How to take this measurement..." value={newTemplate.description} onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium">Reference Media</Label>

          {/* Existing media */}
          {newMedia.length > 0 && (
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {newMedia.map((m) => (
                  <div key={m.id} className="relative shrink-0 w-24 h-20 rounded-lg overflow-hidden border border-border/50 bg-muted">
                    {m.type === "image" ? (
                      <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                    ) : m.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center"><Video className="w-5 h-5 text-muted-foreground" /></div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Play className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">{m.type === "youtube" ? "YouTube" : "Vimeo"}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setNewMedia((prev) => prev.filter((p) => p.id !== m.id))}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-destructive"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {/* Upload buttons */}
          <div className="flex flex-wrap gap-2">
            <div>
              <input type="file" accept="image/*" multiple className="hidden" id="media-image-input" onChange={(e) => handleFileUpload(e, "image")} />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("media-image-input")?.click()}>
                <ImagePlus className="w-4 h-4 mr-1" /> Images
              </Button>
            </div>
            <div>
              <input type="file" accept="video/*" multiple className="hidden" id="media-video-input" onChange={(e) => handleFileUpload(e, "video")} />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("media-video-input")?.click()}>
                <Video className="w-4 h-4 mr-1" /> Videos
              </Button>
            </div>
          </div>

          {/* YouTube / Vimeo Link */}
          <div className="space-y-2 bg-muted/30 rounded-lg p-3 border border-border/30">
            <Label className="text-xs text-muted-foreground">Link YouTube or Vimeo Video</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/watch?v=... or vimeo.com/..."
                value={mediaLink}
                onChange={(e) => setMediaLink(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddVideoLink} disabled={!mediaLink}>
                <Link2 className="w-4 h-4" />
              </Button>
            </div>
            {mediaLink && (
              <Input
                placeholder="Video label (optional)"
                value={mediaLinkLabel}
                onChange={(e) => setMediaLinkLabel(e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
