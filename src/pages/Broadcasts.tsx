import { useState, useMemo } from "react";
import { 
  Radio, 
  Mail, 
  MessageSquare, 
  Users, 
  Send, 
  Clock, 
  Plus,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Filter,
  Eye,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Megaphone,
  Tag,
  Bell,
  X,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

// Types
type BroadcastType = "announcement" | "promotion" | "reminder";
type ChannelType = "sms" | "email";
type BroadcastStatus = "sent" | "scheduled" | "draft" | "failed";

interface Broadcast {
  id: number;
  title: string;
  type: BroadcastType;
  channel: ChannelType;
  targetSummary: string;
  status: BroadcastStatus;
  createdAt: string;
  scheduledFor?: string;
  recipients: number;
  sent: number;
  delivered: number;
  failed: number;
  content: string;
}

interface TargetFilters {
  membershipTypes: string[];
  classes: string[];
  branches: string[];
  statuses: string[];
  gender: string;
}

// Sample data
const sampleBroadcasts: Broadcast[] = [
  { id: 1, title: "New Year Special - 20% Off!", type: "promotion", channel: "sms", targetSummary: "All Active Members", status: "sent", createdAt: "Jan 15, 2025", recipients: 1250, sent: 1250, delivered: 1198, failed: 12, content: "Happy New Year! Get 20% off on annual memberships. Valid till Jan 31." },
  { id: 2, title: "Holiday Hours Update", type: "announcement", channel: "email", targetSummary: "All Members", status: "sent", createdAt: "Jan 10, 2025", recipients: 2100, sent: 2100, delivered: 2045, failed: 5, content: "Our gym will operate on reduced hours during the holiday season." },
  { id: 3, title: "HIIT Class Starting Next Week", type: "announcement", channel: "email", targetSummary: "Premium Members", status: "scheduled", scheduledFor: "Jan 20, 2025 9:00 AM", createdAt: "Jan 18, 2025", recipients: 450, sent: 0, delivered: 0, failed: 0, content: "Join our new high-intensity interval training class every Tuesday!" },
  { id: 4, title: "Membership Renewal Reminder", type: "reminder", channel: "sms", targetSummary: "Expiring Members", status: "draft", createdAt: "Jan 17, 2025", recipients: 85, sent: 0, delivered: 0, failed: 0, content: "Hi {firstName}, your membership expires on {expiryDate}. Renew now!" },
  { id: 5, title: "Valentine's Special Offer", type: "promotion", channel: "email", targetSummary: "All Members", status: "scheduled", scheduledFor: "Feb 10, 2025 8:00 AM", createdAt: "Jan 16, 2025", recipients: 2100, sent: 0, delivered: 0, failed: 0, content: "Bring a partner and get 50% off their membership!" },
  { id: 6, title: "Pool Maintenance Notice", type: "announcement", channel: "sms", targetSummary: "VIP Members", status: "sent", createdAt: "Jan 12, 2025", recipients: 120, sent: 120, delivered: 118, failed: 2, content: "Pool closed for maintenance Jan 15-16. Sorry for inconvenience." },
];

// Filter options
const membershipTypes = ["Basic", "Standard", "Premium", "VIP", "Student", "Corporate"];
const classOptions = ["Yoga", "HIIT", "Spinning", "Pilates", "CrossFit", "Swimming", "Zumba"];
const branchOptions = ["Main Branch", "Downtown", "Westside", "East Plaza", "North Point"];
const memberStatuses = ["Active", "Expired", "Frozen", "Trial"];

// Variable suggestions
const variableSuggestions = [
  { key: "{firstName}", label: "First Name" },
  { key: "{lastName}", label: "Last Name" },
  { key: "{membershipType}", label: "Membership" },
  { key: "{expiryDate}", label: "Expiry Date" },
  { key: "{branchName}", label: "Branch" },
];

export default function Broadcasts() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(sampleBroadcasts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create broadcast state
  const [currentStep, setCurrentStep] = useState(1);
  const [broadcastType, setBroadcastType] = useState<BroadcastType>("announcement");
  const [channel, setChannel] = useState<ChannelType>("sms");
  const [targetFilters, setTargetFilters] = useState<TargetFilters>({
    membershipTypes: [],
    classes: [],
    branches: [],
    statuses: ["Active"],
    gender: "all",
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [sendOption, setSendOption] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Calculate live member count based on filters
  const estimatedRecipients = useMemo(() => {
    let base = 2500;
    if (targetFilters.membershipTypes.length > 0) {
      base = Math.floor(base * (targetFilters.membershipTypes.length * 0.15));
    }
    if (targetFilters.branches.length > 0) {
      base = Math.floor(base * (targetFilters.branches.length * 0.2));
    }
    if (targetFilters.statuses.length > 0 && !targetFilters.statuses.includes("Active")) {
      base = Math.floor(base * 0.3);
    }
    if (targetFilters.gender !== "all") {
      base = Math.floor(base * 0.48);
    }
    return Math.max(base, 10);
  }, [targetFilters]);

  // Character count for SMS
  const smsCharLimit = 160;
  const charCount = content.length;
  const smsSegments = Math.ceil(charCount / smsCharLimit) || 1;

  // Filter broadcasts
  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: broadcasts.length,
    sent: broadcasts.filter((b) => b.status === "sent").length,
    scheduled: broadcasts.filter((b) => b.status === "scheduled").length,
    drafts: broadcasts.filter((b) => b.status === "draft").length,
  };

  const resetCreateForm = () => {
    setCurrentStep(1);
    setBroadcastType("announcement");
    setChannel("sms");
    setTargetFilters({ membershipTypes: [], classes: [], branches: [], statuses: ["Active"], gender: "all" });
    setTitle("");
    setContent("");
    setEmailSubject("");
    setSendOption("now");
    setScheduleDate("");
    setScheduleTime("");
  };

  const handleCreateBroadcast = () => {
    const newBroadcast: Broadcast = {
      id: broadcasts.length + 1,
      title,
      type: broadcastType,
      channel,
      targetSummary: targetFilters.membershipTypes.length > 0 
        ? targetFilters.membershipTypes.join(", ") 
        : "All Members",
      status: sendOption === "now" ? "sent" : "scheduled",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      scheduledFor: sendOption === "schedule" ? `${scheduleDate} ${scheduleTime}` : undefined,
      recipients: estimatedRecipients,
      sent: sendOption === "now" ? estimatedRecipients : 0,
      delivered: sendOption === "now" ? Math.floor(estimatedRecipients * 0.96) : 0,
      failed: sendOption === "now" ? Math.floor(estimatedRecipients * 0.01) : 0,
      content,
    };
    setBroadcasts([newBroadcast, ...broadcasts]);
    setShowCreateModal(false);
    resetCreateForm();
  };

  const handleViewDetails = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowDetailsModal(true);
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable);
  };

  const toggleFilter = (category: keyof TargetFilters, value: string) => {
    if (category === "gender") {
      setTargetFilters((prev) => ({ ...prev, gender: value }));
    } else {
      setTargetFilters((prev) => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((v) => v !== value)
          : [...prev[category], value],
      }));
    }
  };

  const getStatusConfig = (status: BroadcastStatus) => {
    const config = {
      sent: { status: "success" as const, label: "Sent" },
      scheduled: { status: "info" as const, label: "Scheduled" },
      draft: { status: "neutral" as const, label: "Draft" },
      failed: { status: "error" as const, label: "Failed" },
    };
    return config[status];
  };

  const getTypeIcon = (type: BroadcastType) => {
    const icons = { announcement: Megaphone, promotion: Tag, reminder: Bell };
    return icons[type];
  };

  const getChannelIcon = (ch: ChannelType) => {
    const icons = { sms: MessageSquare, email: Mail };
    return icons[ch];
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Broadcasts</h1>
          <p className="text-sm text-muted-foreground">Send messages to your members via SMS or Email</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Broadcast</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Broadcast List - Card Based for Mobile */}
      <div className="space-y-3">
        {filteredBroadcasts.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No broadcasts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredBroadcasts.map((broadcast) => {
            const TypeIcon = getTypeIcon(broadcast.type);
            const ChannelIcon = getChannelIcon(broadcast.channel);
            return (
              <Card 
                key={broadcast.id} 
                className="shadow-soft hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(broadcast)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">{broadcast.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{broadcast.content}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ChannelIcon className="h-3 w-3" />
                          {broadcast.channel.toUpperCase()}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {broadcast.targetSummary}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{broadcast.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge {...getStatusConfig(broadcast.status)} />
                      {broadcast.status === "sent" && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          <span className="text-muted-foreground">{broadcast.delivered.toLocaleString()}</span>
                        </div>
                      )}
                      {broadcast.status === "scheduled" && (
                        <span className="text-xs text-muted-foreground">{broadcast.scheduledFor}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Broadcast Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              New Broadcast
            </DialogTitle>
            <DialogDescription>
              Step {currentStep} of 4
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  step <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step 1: Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">What type of broadcast?</Label>
              <RadioGroup value={broadcastType} onValueChange={(v) => setBroadcastType(v as BroadcastType)}>
                <div className="grid gap-3">
                  {[
                    { value: "announcement", label: "Announcement", desc: "General updates and news", icon: Megaphone },
                    { value: "promotion", label: "Promotion", desc: "Offers and marketing", icon: Tag },
                    { value: "reminder", label: "Reminder", desc: "Renewals and follow-ups", icon: Bell },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        broadcastType === type.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={type.value} className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        broadcastType === type.value ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Channel Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Choose a channel</Label>
              <RadioGroup value={channel} onValueChange={(v) => setChannel(v as ChannelType)}>
                <div className="grid gap-3">
                  {[
                    { value: "sms", label: "SMS", desc: "Short text messages", icon: MessageSquare },
                    { value: "email", label: "Email", desc: "Detailed content with formatting", icon: Mail },
                  ].map((ch) => (
                    <label
                      key={ch.value}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        channel === ch.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={ch.value} className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        channel === ch.value ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <ch.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{ch.label}</p>
                        <p className="text-sm text-muted-foreground">{ch.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4 shrink-0" />
                <span>WhatsApp & Push coming soon</span>
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Target Audience</Label>
                <Badge variant="secondary" className="text-primary">
                  <Users className="h-3 w-3 mr-1" />
                  {estimatedRecipients.toLocaleString()} members
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Membership Types */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Membership Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {membershipTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleFilter("membershipTypes", type)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          targetFilters.membershipTypes.includes(type)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member Status */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Member Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {memberStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleFilter("statuses", status)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          targetFilters.statuses.includes(status)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branches */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Branch</Label>
                  <div className="flex flex-wrap gap-2">
                    {branchOptions.map((branch) => (
                      <button
                        key={branch}
                        onClick={() => toggleFilter("branches", branch)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          targetFilters.branches.includes(branch)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Gender (Optional)</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => toggleFilter("gender", g.value)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                          targetFilters.gender === g.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Content & Send */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Year Special Offer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              {channel === "email" && (
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject line"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="content">Message</Label>
                  {channel === "sms" && (
                    <span className={cn(
                      "text-xs",
                      charCount > smsCharLimit ? "text-warning" : "text-muted-foreground"
                    )}>
                      {charCount}/{smsCharLimit} ({smsSegments} SMS)
                    </span>
                  )}
                </div>
                <Textarea
                  id="content"
                  placeholder={channel === "sms" ? "Keep it short and clear..." : "Write your message here..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={channel === "sms" ? 3 : 5}
                  className="mt-1"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground">Variables:</span>
                  {variableSuggestions.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key)}
                      className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-base font-semibold">When to send?</Label>
                <RadioGroup value={sendOption} onValueChange={(v) => setSendOption(v as "now" | "schedule")}>
                  <div className="flex gap-3">
                    <label className={cn(
                      "flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                      sendOption === "now" ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <RadioGroupItem value="now" />
                      <div>
                        <p className="font-medium">Send Now</p>
                        <p className="text-xs text-muted-foreground">Immediately</p>
                      </div>
                    </label>
                    <label className={cn(
                      "flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                      sendOption === "schedule" ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <RadioGroupItem value="schedule" />
                      <div>
                        <p className="font-medium">Schedule</p>
                        <p className="text-xs text-muted-foreground">Pick date & time</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                {sendOption === "schedule" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date" className="text-sm">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-sm">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium">{estimatedRecipients.toLocaleString()} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-medium uppercase">{channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{broadcastType}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} className="flex-1 sm:flex-none">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 sm:flex-none">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateBroadcast} 
                disabled={!title || !content}
                className="flex-1 sm:flex-none gap-2"
              >
                <Send className="h-4 w-4" />
                {sendOption === "now" ? "Send Now" : "Schedule"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          {selectedBroadcast && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = getTypeIcon(selectedBroadcast.type);
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  {selectedBroadcast.title}
                </DialogTitle>
                <DialogDescription>{selectedBroadcast.createdAt}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status & Channel */}
                <div className="flex items-center gap-2">
                  <StatusBadge {...getStatusConfig(selectedBroadcast.status)} />
                  <Badge variant="secondary" className="gap-1">
                    {(() => {
                      const Icon = getChannelIcon(selectedBroadcast.channel);
                      return <Icon className="h-3 w-3" />;
                    })()}
                    {selectedBroadcast.channel.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{selectedBroadcast.type}</Badge>
                </div>

                {/* Message Content */}
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-sm">{selectedBroadcast.content}</p>
                </div>

                {/* Target */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{selectedBroadcast.targetSummary}</span>
                </div>

                {selectedBroadcast.scheduledFor && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="font-medium">{selectedBroadcast.scheduledFor}</span>
                  </div>
                )}

                {/* Analytics */}
                {selectedBroadcast.status === "sent" && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold">{selectedBroadcast.recipients.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Recipients</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold">{selectedBroadcast.sent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                      <div className="p-3 rounded-lg bg-success/10 text-center">
                        <p className="text-2xl font-bold text-success">{selectedBroadcast.delivered.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Delivered</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 text-center">
                        <p className="text-2xl font-bold text-destructive">{selectedBroadcast.failed}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
