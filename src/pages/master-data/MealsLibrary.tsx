import { useState } from "react";
import { Plus, Apple, Play, ImagePlus, Video, Link2, X, Trash2, Eye } from "lucide-react";
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

type MediaType = "image" | "video" | "youtube" | "vimeo";

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  label: string;
}

interface Meal {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  description: string;
  ingredients: string;
  media: MediaItem[];
}

const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout", "Supplement", "Beverage"];

const initialMeals: Meal[] = [
  { id: "1", name: "Grilled Chicken Breast", category: "Lunch", calories: 284, protein: 53, carbs: 0, fat: 6, servingSize: "200g", description: "Lean protein source, seasoned and grilled.", ingredients: "Chicken breast, olive oil, salt, pepper, garlic powder", media: [
    { id: "m1", type: "youtube", url: "https://www.youtube.com/watch?v=xGSEMBY_GMs", thumbnail: "https://img.youtube.com/vi/xGSEMBY_GMs/mqdefault.jpg", label: "Grilled Chicken Recipe" },
  ] },
  { id: "2", name: "Oatmeal with Banana", category: "Breakfast", calories: 350, protein: 12, carbs: 60, fat: 8, servingSize: "1 bowl", description: "Slow-release energy breakfast with fruit.", ingredients: "Rolled oats, banana, milk, honey, cinnamon", media: [] },
  { id: "3", name: "Protein Shake", category: "Post-Workout", calories: 220, protein: 30, carbs: 15, fat: 5, servingSize: "300ml", description: "Quick post-workout recovery drink.", ingredients: "Whey protein, banana, almond milk, peanut butter", media: [
    { id: "m3", type: "youtube", url: "https://www.youtube.com/watch?v=jbfEGnQ7fMU", thumbnail: "https://img.youtube.com/vi/jbfEGnQ7fMU/mqdefault.jpg", label: "Protein Shake Recipe" },
  ] },
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

export default function MealsLibrary() {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [viewMeal, setViewMeal] = useState<Meal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [mediaPlayerItem, setMediaPlayerItem] = useState<MediaItem | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", category: "", calories: "", protein: "", carbs: "", fat: "", servingSize: "", description: "", ingredients: "" });
  const [formMedia, setFormMedia] = useState<MediaItem[]>([]);
  const [mediaLink, setMediaLink] = useState("");

  const filtered = meals.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || m.category === filterCategory;
    return matchSearch && matchCat;
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
      id: `media-${Date.now()}`, type, url: mediaLink,
      thumbnail: isYoutube && videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined,
      label: isYoutube ? "YouTube Video" : "Vimeo Video",
    }]);
    setMediaLink("");
  };

  const handleSave = () => {
    if (!form.name || !form.category) {
      toast({ title: "Missing fields", description: "Name and category are required.", variant: "destructive" });
      return;
    }
    const newMeal: Meal = {
      id: `meal-${Date.now()}`, name: form.name, category: form.category,
      calories: Number(form.calories) || 0, protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0,
      servingSize: form.servingSize, description: form.description, ingredients: form.ingredients, media: formMedia,
    };
    setMeals((prev) => [newMeal, ...prev]);
    setShowAddSheet(false);
    setForm({ name: "", category: "", calories: "", protein: "", carbs: "", fat: "", servingSize: "", description: "", ingredients: "" });
    setFormMedia([]);
    toast({ title: "Meal added" });
  };

  const handleDelete = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Meal deleted" });
  };

  const columns: Column<Meal>[] = [
    {
      key: "name", label: "Meal", priority: "always",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Apple className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">{item.category} • {item.servingSize}</p>
          </div>
        </div>
      ),
    },
    {
      key: "calories", label: "Calories", priority: "always",
      render: (value: number) => <span className="text-sm font-medium">{value} kcal</span>,
    },
    {
      key: "protein", label: "Protein", priority: "md",
      render: (value: number) => <span className="text-sm">{value}g</span>,
    },
    {
      key: "carbs", label: "Carbs", priority: "lg",
      render: (value: number) => <span className="text-sm">{value}g</span>,
    },
    {
      key: "fat", label: "Fat", priority: "lg",
      render: (value: number) => <span className="text-sm">{value}g</span>,
    },
    {
      key: "media", label: "Media", priority: "md",
      render: (value: MediaItem[]) => (
        value.length > 0 ? (
          <span className="text-xs text-muted-foreground">{value.length} file{value.length > 1 ? "s" : ""}</span>
        ) : <span className="text-xs text-muted-foreground">—</span>
      ),
    },
  ];

  const rowActions: RowAction<Meal>[] = [
    { icon: Eye, label: "View", onClick: (item) => setViewMeal(item) },
    { icon: Trash2, label: "Delete", onClick: (item) => handleDelete(item.id), variant: "danger" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Meals</h2>
          <p className="text-sm text-muted-foreground">Manage your meal & food item library</p>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Add Meal</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search meals..."
        filters={[{
          key: "category", label: "Category", value: filterCategory, onChange: setFilterCategory,
          options: [{ value: "all", label: "All Categories" }, ...mealCategories.map((c) => ({ value: c, label: c }))],
        }]}
      />

      <ResponsiveTable data={filtered} columns={columns} keyExtractor={(item) => item.id} rowActions={rowActions} onRowClick={(item) => setViewMeal(item)} />

      {/* Add Meal Sheet */}
      <QuickAddSheet open={showAddSheet} onOpenChange={setShowAddSheet} title="Add Meal" onSubmit={handleSave} submitLabel="Save Meal">
        <div className="space-y-4">
          <div>
            <Label>Meal Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grilled Salmon" />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{mealCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Calories (kcal)</Label><Input type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} placeholder="0" /></div>
            <div><Label>Protein (g)</Label><Input type="number" value={form.protein} onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))} placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Carbs (g)</Label><Input type="number" value={form.carbs} onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))} placeholder="0" /></div>
            <div><Label>Fat (g)</Label><Input type="number" value={form.fat} onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))} placeholder="0" /></div>
          </div>
          <div><Label>Serving Size</Label><Input value={form.servingSize} onChange={(e) => setForm((f) => ({ ...f, servingSize: e.target.value }))} placeholder="e.g. 200g" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
          <div><Label>Ingredients</Label><Textarea value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} rows={2} /></div>

          {/* Media */}
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
                      {m.type === "image" ? <img src={m.url} alt={m.label} className="w-full h-full object-cover" /> :
                       m.thumbnail ? <img src={m.thumbnail} alt={m.label} className="w-full h-full object-cover" /> :
                       <div className="w-full h-full flex items-center justify-center"><Play className="w-6 h-6 text-primary" /></div>}
                      <button onClick={() => setFormMedia((prev) => prev.filter((x) => x.id !== m.id))} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </div>
      </QuickAddSheet>

      {/* View Meal Dialog */}
      <Dialog open={!!viewMeal} onOpenChange={(open) => !open && setViewMeal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewMeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Apple className="w-5 h-5 text-primary" />{viewMeal.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{viewMeal.category}</Badge>
                  <Badge variant="secondary">{viewMeal.servingSize}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Calories", value: viewMeal.calories, unit: "kcal" },
                    { label: "Protein", value: viewMeal.protein, unit: "g" },
                    { label: "Carbs", value: viewMeal.carbs, unit: "g" },
                    { label: "Fat", value: viewMeal.fat, unit: "g" },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{m.value}<span className="text-xs text-muted-foreground">{m.unit}</span></p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {viewMeal.description && <div><Label className="text-xs text-muted-foreground">Description</Label><p className="text-sm mt-1">{viewMeal.description}</p></div>}
                {viewMeal.ingredients && <div><Label className="text-xs text-muted-foreground">Ingredients</Label><p className="text-sm mt-1 whitespace-pre-wrap">{viewMeal.ingredients}</p></div>}
                {viewMeal.media.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Media</Label>
                    <ScrollArea className="w-full mt-2">
                      <div className="flex gap-2 pb-2">
                        {viewMeal.media.map((m) => (
                          <div key={m.id} className="relative shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-border bg-muted cursor-pointer" onClick={() => setMediaPlayerItem(m)}>
                            {m.type === "image" ? <img src={m.url} alt={m.label} className="w-full h-full object-cover" /> :
                             m.thumbnail ? <img src={m.thumbnail} alt={m.label} className="w-full h-full object-cover" /> :
                             <div className="w-full h-full flex flex-col items-center justify-center gap-1"><Play className="w-8 h-8 text-primary" /><span className="text-[10px] text-muted-foreground">{m.type}</span></div>}
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

      {/* Media Player */}
      <Dialog open={!!mediaPlayerItem} onOpenChange={(open) => !open && setMediaPlayerItem(null)}>
        <DialogContent className="max-w-2xl">
          {mediaPlayerItem && (
            mediaPlayerItem.type === "image" ? <img src={mediaPlayerItem.url} alt={mediaPlayerItem.label} className="w-full rounded-lg" /> :
            mediaPlayerItem.type === "video" ? <video src={mediaPlayerItem.url} controls className="w-full rounded-lg" /> :
            <div className="aspect-video"><iframe src={getEmbedUrl(mediaPlayerItem.url, mediaPlayerItem.type as "youtube" | "vimeo") || mediaPlayerItem.url} className="w-full h-full rounded-lg" allowFullScreen allow="autoplay; encrypted-media" /></div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
