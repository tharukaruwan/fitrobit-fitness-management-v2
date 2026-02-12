import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Info } from "lucide-react";

export interface InfoItem {
  id: string;
  title: string;
  description: string;
}

interface InformationTabProps {
  items?: InfoItem[];
  onSave?: (items: InfoItem[]) => void;
  entityType?: string;
}

const defaultItems: InfoItem[] = [
  { id: "1", title: "Target Audience", description: "Beginners looking to build strength" },
  { id: "2", title: "Special Focus", description: "Fat burning and muscle toning" },
];

export function InformationTab({ items: initialItems, onSave, entityType = "program" }: InformationTabProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<InfoItem[]>(initialItems || defaultItems);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAddItem = () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast({ title: "Error", description: "Please fill in both title and description", variant: "destructive" });
      return;
    }
    const newItem: InfoItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDescription.trim(),
    };
    setItems([...items, newItem]);
    setNewTitle("");
    setNewDescription("");
    toast({ title: "Added", description: "Information item added successfully" });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Removed", description: "Information item removed" });
  };

  const handleUpdateItem = (id: string, field: "title" | "description", value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    onSave?.(items);
    toast({ title: "Saved", description: "Information updated successfully" });
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Information & Notes" 
        action={
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        Add custom notes, special purposes, or descriptions for this {entityType}. 
        Examples: "Targets fat burning", "Beginner-friendly", "Home workout focused".
      </p>

      {/* Existing Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input 
                    value={item.title}
                    onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea 
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-border/50 space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Information
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input 
              placeholder="e.g., Target Audience, Special Focus..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea 
              placeholder="e.g., This program targets fat burning and is perfect for home workouts..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="mt-1 min-h-[60px]"
            />
          </div>
          <Button onClick={handleAddItem} size="sm" className="w-fit">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>
    </div>
  );
}
