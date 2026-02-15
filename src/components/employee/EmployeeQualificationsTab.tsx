import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { useToast } from "@/hooks/use-toast";
import { Plus, Award, Trash2 } from "lucide-react";

interface Qualification {
  id: string;
  title: string;
  institution: string;
  date: string;
  expiryDate?: string;
  type: "certification" | "degree" | "training" | "license";
  status: "valid" | "expiring" | "expired";
}

const initialQualifications: Qualification[] = [
  { id: "q1", title: "Certified Personal Trainer (CPT)", institution: "NASM", date: "2021-06-15", expiryDate: "2026-06-15", type: "certification", status: "valid" },
  { id: "q2", title: "First Aid & CPR", institution: "Red Cross", date: "2024-01-10", expiryDate: "2026-01-10", type: "certification", status: "expired" },
  { id: "q3", title: "BSc Sports Science", institution: "State University", date: "2020-05-20", type: "degree", status: "valid" },
  { id: "q4", title: "Nutrition Coach Level 2", institution: "Precision Nutrition", date: "2023-03-01", expiryDate: "2027-03-01", type: "training", status: "valid" },
  { id: "q5", title: "Group Fitness License", institution: "ACE", date: "2022-09-01", expiryDate: "2026-04-01", type: "license", status: "expiring" },
];

const qualStatusMap: Record<Qualification["status"], "success" | "warning" | "error"> = {
  valid: "success",
  expiring: "warning",
  expired: "error",
};

export function EmployeeQualificationsTab() {
  const { toast } = useToast();
  const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications);
  const [showAddQual, setShowAddQual] = useState(false);
  const [qualForm, setQualForm] = useState({
    title: "",
    institution: "",
    date: "",
    expiryDate: "",
    type: "certification" as Qualification["type"],
  });

  const handleAddQual = () => {
    if (!qualForm.title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const newQ: Qualification = {
      id: `q-${Date.now()}`,
      title: qualForm.title,
      institution: qualForm.institution,
      date: qualForm.date || format(new Date(), "yyyy-MM-dd"),
      expiryDate: qualForm.expiryDate || undefined,
      type: qualForm.type,
      status: "valid",
    };
    setQualifications((prev) => [newQ, ...prev]);
    setShowAddQual(false);
    setQualForm({ title: "", institution: "", date: "", expiryDate: "", type: "certification" });
    toast({ title: "Qualification added" });
  };

  return (
    <>
      <div className="space-y-6">
        <SectionHeader
          title="Qualifications & Certifications"
          action={
            <Button size="sm" onClick={() => setShowAddQual(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {qualifications.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/50 p-4 bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-semibold truncate">{q.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{q.institution}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Issued: {q.date}</span>
                    {q.expiryDate && <span>• Expires: {q.expiryDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge
                    status={qualStatusMap[q.status]}
                    label={q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setQualifications((prev) => prev.filter((x) => x.id !== q.id));
                      toast({ title: "Removed" });
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="mt-2 text-[10px] capitalize">
                {q.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Add Qualification Sheet */}
      <QuickAddSheet
        open={showAddQual}
        onOpenChange={setShowAddQual}
        title="Add Qualification"
        onSubmit={handleAddQual}
        submitLabel="Add"
      >
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={qualForm.title}
              onChange={(e) => setQualForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Certified Personal Trainer"
            />
          </div>
          <div>
            <Label>Institution</Label>
            <Input
              value={qualForm.institution}
              onChange={(e) => setQualForm((f) => ({ ...f, institution: e.target.value }))}
              placeholder="e.g. NASM"
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={qualForm.type}
              onValueChange={(v) => setQualForm((f) => ({ ...f, type: v as Qualification["type"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="license">License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={qualForm.date}
                onChange={(e) => setQualForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={qualForm.expiryDate}
                onChange={(e) => setQualForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </QuickAddSheet>
    </>
  );
}