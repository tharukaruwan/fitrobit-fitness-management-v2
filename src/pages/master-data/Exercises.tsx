import { useState } from "react";
import { Plus, Dumbbell, Play, ImagePlus, Video, Link2, X, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
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

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  instructions: string;
  media: MediaItem[];
}

const categories = ["Strength", "Cardio", "Flexibility", "Balance", "Plyometric", "Bodyweight"];
const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Full Body"];
const equipmentOptions = ["Barbell", "Dumbbell", "Kettlebell", "Cable Machine", "Resistance Band", "Bodyweight", "Machine", "None"];
const difficulties: Exercise["difficulty"][] = ["Beginner", "Intermediate", "Advanced"];

const initialExercises: Exercise[] = [
  {
    id: "1", name: "Barbell Bench Press", category: "Strength", muscleGroup: "Chest", equipment: "Barbell",
    difficulty: "Intermediate", description: "A compound pushing exercise targeting the chest, shoulders, and triceps.",
    instructions: "Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower to chest, then press up.",
    media: [
      { id: "m1", type: "youtube", url: "https://www.youtube.com/watch?v=rT7DgCr-3pg", thumbnail: "https://img.youtube.com/vi/rT7DgCr-3pg/mqdefault.jpg", label: "Bench Press Form" },
    ],
  },
  {
    id: "2", name: "Pull-Up", category: "Bodyweight", muscleGroup: "Back", equipment: "Bodyweight",
    difficulty: "Intermediate", description: "An upper body compound exercise targeting the lats and biceps.",
    instructions: "Hang from a bar with palms facing away, pull yourself up until chin clears the bar.",
    media: [
      { id: "m2", type: "youtube", url: "https://www.youtube.com/watch?v=eGo4IYlbE5g", thumbnail: "https://img.youtube.com/vi/eGo4IYlbE5g/mqdefault.jpg", label: "Pull-Up Tutorial" },
    ],
  },
  {
    id: "3", name: "Goblet Squat", category: "Strength", muscleGroup: "Legs", equipment: "Kettlebell",
    difficulty: "Beginner", description: "A squat variation holding a weight close to the chest.",
    instructions: "Hold a kettlebell at chest height, squat down keeping chest upright, then stand.",
    media: [
      { id: "m3", type: "youtube", url: "https://www.youtube.com/watch?v=MeIiIdhvXT4", thumbnail: "https://img.youtube.com/vi/MeIiIdhvXT4/mqdefault.jpg", label: "Goblet Squat Guide" },
    ],
  },
];

function getVideoId(url: string, type: "youtube" | "vimeo"): string | null {
  if (type === "youtube") {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function getEmbedUrl(url: string, type: "youtube" | "vimeo"): string | null {
  const id = getVideoId(url, type);
  if (!id) return null;
  return type === "youtube" ? `https://www.youtube.com/embed/${id}` : `https://player.vimeo.com/video/${id}`;
}

const difficultyColor: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Intermediate: "bg-amber-500/10 text-amber-600 border-amber-200",
  Advanced: "bg-red-500/10 text-red-600 border-red-200",
};

export default function Exercises() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [mediaPlayerItem, setMediaPlayerItem] = useState<MediaItem | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", category: "", muscleGroup: "", equipment: "", difficulty: "" as string, description: "", instructions: "" });
  const [formMedia, setFormMedia] = useState<MediaItem[]>([]);
  const [mediaLink, setMediaLink] = useState("");
  const [mediaLinkLabel, setMediaLinkLabel] = useState("");

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || e.category === filterCategory;
    const matchMuscle = filterMuscle === "all" || e.muscleGroup === filterMuscle;
    return matchSearch && matchCat && matchMuscle;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setFormMedia((prev) => [...prev, { id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, url, label: file.name.replace(/\.[^/.]+$/, "") }]);
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
    setFormMedia((prev) => [...prev, {
      id: `media-${Date.now()}`,
      type,
      url: mediaLink,
      thumbnail: isYoutube && videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined,
      label: mediaLinkLabel || (isYoutube ? "YouTube Video" : "Vimeo Video"),
    }]);
    setMediaLink("");
    setMediaLinkLabel("");
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.muscleGroup) {
      toast({ title: "Missing fields", description: "Name, category, and muscle group are required.", variant: "destructive" });
      return;
    }
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      ...form,
      difficulty: (form.difficulty || "Beginner") as Exercise["difficulty"],
      media: formMedia,
    };
    setExercises((prev) => [newExercise, ...prev]);
    setShowAddSheet(false);
    setForm({ name: "", category: "", muscleGroup: "", equipment: "", difficulty: "", description: "", instructions: "" });
    setFormMedia([]);
    toast({ title: "Exercise added" });
  };

  const handleDelete = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Exercise deleted" });
  };

  const columns: Column<Exercise>[] = [
    {
      key: "name", label: "Exercise", priority: "always",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">{item.muscleGroup} • {item.equipment}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category", label: "Category", priority: "md",
      render: (value: string) => <Badge variant="outline" className="text-xs">{value}</Badge>,
    },
    {
      key: "muscleGroup", label: "Muscle Group", priority: "lg",
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      key: "difficulty", label: "Difficulty", priority: "always",
      render: (value: string) => <Badge variant="outline" className={cn("text-xs", difficultyColor[value])}>{value}</Badge>,
    },
    {
      key: "media", label: "Media", priority: "md",
      render: (value: MediaItem[]) => (
        value.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{value.length} file{value.length > 1 ? "s" : ""}</span>
            <div className="flex -space-x-1">
              {value.slice(0, 3).map((m) => (
                <div key={m.id} className="w-6 h-6 rounded border border-background bg-muted flex items-center justify-center">
                  {m.type === "image" ? <ImagePlus className="w-3 h-3 text-muted-foreground" /> : <Play className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>
      ),
    },
  ];

  const rowActions: RowAction<Exercise>[] = [
    { icon: Eye, label: "View", onClick: (item) => setViewExercise(item) },
    { icon: Trash2, label: "Delete", onClick: (item) => handleDelete(item.id), variant: "danger" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Exercises</h2>
          <p className="text-sm text-muted-foreground">Manage your exercise library</p>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Exercise</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search exercises..."
        filters={[
          {
            key: "category", label: "Category", value: filterCategory, onChange: setFilterCategory,
            options: [{ value: "all", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))],
          },
          {
            key: "muscle", label: "Muscle Group", value: filterMuscle, onChange: setFilterMuscle,
            options: [{ value: "all", label: "All Muscle Groups" }, ...muscleGroups.map((m) => ({ value: m, label: m }))],
          },
        ]}
      />

      <ResponsiveTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        rowActions={rowActions}
        onRowClick={(item) => setViewExercise(item)}
      />

      {/* Add Exercise Sheet */}
      <QuickAddSheet open={showAddSheet} onOpenChange={setShowAddSheet} title="Add Exercise" onSubmit={handleSave} submitLabel="Save Exercise">
        <div className="space-y-4">
          <div>
            <Label>Exercise Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Barbell Squat" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Muscle Group *</Label>
              <Select value={form.muscleGroup} onValueChange={(v) => setForm((f) => ({ ...f, muscleGroup: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{muscleGroups.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Equipment</Label>
              <Select value={form.equipment} onValueChange={(v) => setForm((f) => ({ ...f, equipment: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{equipmentOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description..." rows={2} />
          </div>
          <div>
            <Label>Instructions</Label>
            <Textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="Step-by-step..." rows={3} />
          </div>

          {/* Media Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="text-sm font-medium">Media</Label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.multiple = true; i.onchange = (e) => handleFileUpload(e as any, "image"); i.click(); }}>
                <ImagePlus className="w-3.5 h-3.5" /> Image
              </Button>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "video/*"; i.multiple = true; i.onchange = (e) => handleFileUpload(e as any, "video"); i.click(); }}>
                <Video className="w-3.5 h-3.5" /> Video
              </Button>
            </div>
            <div className="flex gap-2">
              <Input placeholder="YouTube or Vimeo URL..." value={mediaLink} onChange={(e) => setMediaLink(e.target.value)} className="text-sm" />
              <Button type="button" variant="outline" size="sm" onClick={handleAddVideoLink}><Link2 className="w-3.5 h-3.5" /></Button>
            </div>
            {formMedia.length > 0 && (
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {formMedia.map((m) => (
                    <div key={m.id} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                      ) : m.thumbnail ? (
                        <img src={m.thumbnail} alt={m.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Play className="w-6 h-6 text-primary" /></div>
                      )}
                      <button onClick={() => setFormMedia((prev) => prev.filter((x) => x.id !== m.id))} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </div>
      </QuickAddSheet>

      {/* View Exercise Dialog */}
      <Dialog open={!!viewExercise} onOpenChange={(open) => !open && setViewExercise(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  {viewExercise.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{viewExercise.category}</Badge>
                  <Badge variant="outline">{viewExercise.muscleGroup}</Badge>
                  {viewExercise.equipment && <Badge variant="secondary">{viewExercise.equipment}</Badge>}
                  <Badge variant="outline" className={difficultyColor[viewExercise.difficulty]}>{viewExercise.difficulty}</Badge>
                </div>
                {viewExercise.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{viewExercise.description}</p>
                  </div>
                )}
                {viewExercise.instructions && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Instructions</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{viewExercise.instructions}</p>
                  </div>
                )}
                {viewExercise.media.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Media</Label>
                    <ScrollArea className="w-full mt-2">
                      <div className="flex gap-2 pb-2">
                        {viewExercise.media.map((m) => (
                          <div key={m.id} className="relative shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-border bg-muted cursor-pointer" onClick={() => setMediaPlayerItem(m)}>
                            {m.type === "image" ? (
                              <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                            ) : m.thumbnail ? (
                              <img src={m.thumbnail} alt={m.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <Play className="w-8 h-8 text-primary" />
                                <span className="text-[10px] text-muted-foreground">{m.type}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Player Modal */}
      <Dialog open={!!mediaPlayerItem} onOpenChange={(open) => !open && setMediaPlayerItem(null)}>
        <DialogContent className="max-w-2xl">
          {mediaPlayerItem && (
            mediaPlayerItem.type === "image" ? (
              <img src={mediaPlayerItem.url} alt={mediaPlayerItem.label} className="w-full rounded-lg" />
            ) : mediaPlayerItem.type === "video" ? (
              <video src={mediaPlayerItem.url} controls className="w-full rounded-lg" />
            ) : (
              <div className="aspect-video">
                <iframe src={getEmbedUrl(mediaPlayerItem.url, mediaPlayerItem.type as "youtube" | "vimeo") || mediaPlayerItem.url} className="w-full h-full rounded-lg" allowFullScreen allow="autoplay; encrypted-media" />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
