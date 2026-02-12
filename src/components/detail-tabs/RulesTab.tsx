import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { useToast } from "@/hooks/use-toast";
import { Save, ShieldCheck, Users, Calendar, UserCheck } from "lucide-react";

export interface RulesConfig {
  ageRestriction: {
    enabled: boolean;
    minAge: number;
    maxAge: number;
  };
  genderRestriction: {
    enabled: boolean;
    allowedGender: "all" | "male" | "female";
  };
  memberLimit: {
    enabled: boolean;
    maxMembers: number;
  };
  membershipRequired: {
    enabled: boolean;
    requiredTypes: string[];
  };
  experienceLevel: {
    enabled: boolean;
    minLevel: "beginner" | "intermediate" | "advanced";
  };
}

interface RulesTabProps {
  rules?: Partial<RulesConfig>;
  onSave?: (rules: RulesConfig) => void;
  entityType?: string;
}

const defaultRules: RulesConfig = {
  ageRestriction: { enabled: false, minAge: 16, maxAge: 65 },
  genderRestriction: { enabled: false, allowedGender: "all" },
  memberLimit: { enabled: false, maxMembers: 20 },
  membershipRequired: { enabled: false, requiredTypes: [] },
  experienceLevel: { enabled: false, minLevel: "beginner" },
};

export function RulesTab({ rules: initialRules, onSave, entityType = "program" }: RulesTabProps) {
  const { toast } = useToast();
  const [rules, setRules] = useState<RulesConfig>({ ...defaultRules, ...initialRules });

  const handleSave = () => {
    onSave?.(rules);
    toast({ title: "Saved", description: "Enrollment rules updated successfully" });
  };

  const updateRule = <K extends keyof RulesConfig>(
    category: K, 
    field: keyof RulesConfig[K], 
    value: RulesConfig[K][keyof RulesConfig[K]]
  ) => {
    setRules(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Enrollment Rules" 
        action={
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        Set validation rules for who can enroll in this {entityType}. 
        These restrictions will be checked during registration.
      </p>

      {/* Age Restriction */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Age Restriction</p>
              <p className="text-xs text-muted-foreground">Limit enrollment by age range</p>
            </div>
          </div>
          <Switch 
            checked={rules.ageRestriction.enabled}
            onCheckedChange={(checked) => updateRule("ageRestriction", "enabled", checked)}
          />
        </div>
        {rules.ageRestriction.enabled && (
          <div className="grid grid-cols-2 gap-3 pl-11">
            <div>
              <Label className="text-xs text-muted-foreground">Minimum Age</Label>
              <Input 
                type="number" 
                value={rules.ageRestriction.minAge}
                onChange={(e) => updateRule("ageRestriction", "minAge", parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Maximum Age</Label>
              <Input 
                type="number" 
                value={rules.ageRestriction.maxAge}
                onChange={(e) => updateRule("ageRestriction", "maxAge", parseInt(e.target.value) || 100)}
                min={0}
                max={100}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Gender Restriction */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium">Gender Restriction</p>
              <p className="text-xs text-muted-foreground">Limit enrollment by gender</p>
            </div>
          </div>
          <Switch 
            checked={rules.genderRestriction.enabled}
            onCheckedChange={(checked) => updateRule("genderRestriction", "enabled", checked)}
          />
        </div>
        {rules.genderRestriction.enabled && (
          <div className="pl-11">
            <Label className="text-xs text-muted-foreground">Allowed Gender</Label>
            <Select 
              value={rules.genderRestriction.allowedGender}
              onValueChange={(value: "all" | "male" | "female") => updateRule("genderRestriction", "allowedGender", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male Only</SelectItem>
                <SelectItem value="female">Female Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Member Limit */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium">Member Limit</p>
              <p className="text-xs text-muted-foreground">Set maximum number of enrollments</p>
            </div>
          </div>
          <Switch 
            checked={rules.memberLimit.enabled}
            onCheckedChange={(checked) => updateRule("memberLimit", "enabled", checked)}
          />
        </div>
        {rules.memberLimit.enabled && (
          <div className="pl-11">
            <Label className="text-xs text-muted-foreground">Maximum Members</Label>
            <Input 
              type="number" 
              value={rules.memberLimit.maxMembers}
              onChange={(e) => updateRule("memberLimit", "maxMembers", parseInt(e.target.value) || 1)}
              min={1}
              className="mt-1 w-32"
            />
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Experience Level</p>
              <p className="text-xs text-muted-foreground">Require minimum experience level</p>
            </div>
          </div>
          <Switch 
            checked={rules.experienceLevel.enabled}
            onCheckedChange={(checked) => updateRule("experienceLevel", "enabled", checked)}
          />
        </div>
        {rules.experienceLevel.enabled && (
          <div className="pl-11">
            <Label className="text-xs text-muted-foreground">Minimum Level</Label>
            <Select 
              value={rules.experienceLevel.minLevel}
              onValueChange={(value: "beginner" | "intermediate" | "advanced") => updateRule("experienceLevel", "minLevel", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
