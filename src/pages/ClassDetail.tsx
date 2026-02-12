import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DetailPageTemplate, 
  DetailTab, 
  SectionHeader,
} from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePreview } from "@/components/ui/image-preview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { InformationTab } from "@/components/detail-tabs/InformationTab";
import { RulesTab } from "@/components/detail-tabs/RulesTab";
import { ScheduleTab } from "@/components/detail-tabs/ScheduleTab";
import { 
  Dumbbell, 
  Clock, 
  Users, 
  Calendar,
  MapPin,
  User,
  Eye,
  Save,
  BarChart3,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
} from "lucide-react";

// Form validation schema
const classFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  instructor: z.string().min(1, "Instructor is required"),
  schedule: z.string().min(1, "Schedule is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  room: z.string().min(1, "Room is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  level: z.string().min(1, "Level is required"),
  description: z.string().max(500),
  equipment: z.string(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

// Sample class data
const classData = {
  id: 1,
  classId: "CLS-001",
  name: "Morning Yoga",
  instructor: "Emma Wilson",
  instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  schedule: "Mon, Wed, Fri",
  time: "06:00 AM",
  duration: "60 min",
  capacity: 20,
  enrolled: 18,
  room: "Studio A",
  status: "scheduled" as const,
  description: "A relaxing morning yoga session focusing on flexibility, breathing techniques, and mental clarity.",
  equipment: ["Yoga Mat", "Blocks", "Straps"],
  level: "All Levels",
  createdAt: "Jan 1, 2024",
};

// Sample enrolled members
interface EnrolledMember {
  id: number;
  memberId: string;
  name: string;
  image: string;
  enrolledDate: string;
  attendanceRate: number;
  status: "confirmed" | "waitlist" | "cancelled";
}

const enrolledMembers: EnrolledMember[] = [
  { id: 1, memberId: "MEM-001", name: "John Smith", image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150", enrolledDate: "Jan 10, 2024", attendanceRate: 95, status: "confirmed" },
  { id: 2, memberId: "MEM-005", name: "Sarah Wilson", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", enrolledDate: "Jan 12, 2024", attendanceRate: 88, status: "confirmed" },
  { id: 3, memberId: "MEM-012", name: "Mike Johnson", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", enrolledDate: "Jan 15, 2024", attendanceRate: 75, status: "confirmed" },
  { id: 4, memberId: "MEM-018", name: "Emily Davis", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", enrolledDate: "Jan 18, 2024", attendanceRate: 100, status: "confirmed" },
  { id: 5, memberId: "MEM-023", name: "Robert Brown", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", enrolledDate: "Jan 20, 2024", attendanceRate: 0, status: "waitlist" },
];

// Sample attendance records
interface AttendanceRecord {
  id: number;
  date: string;
  attended: number;
  absent: number;
  total: number;
  status: "completed" | "cancelled" | "scheduled";
}

const attendanceRecords: AttendanceRecord[] = [
  { id: 1, date: "Jan 29, 2024", attended: 17, absent: 1, total: 18, status: "completed" },
  { id: 2, date: "Jan 27, 2024", attended: 16, absent: 2, total: 18, status: "completed" },
  { id: 3, date: "Jan 25, 2024", attended: 18, absent: 0, total: 18, status: "completed" },
  { id: 4, date: "Jan 31, 2024", attended: 0, absent: 0, total: 18, status: "scheduled" },
  { id: 5, date: "Feb 2, 2024", attended: 0, absent: 0, total: 18, status: "scheduled" },
];

const memberColumns: Column<EnrolledMember>[] = [
  { 
    key: "image", 
    label: "", 
    priority: "always", 
    className: "w-10",
    render: (value: string, item: EnrolledMember) => <ImagePreview src={value} alt={item.name} size="sm" />
  },
  { 
    key: "name", 
    label: "Member", 
    priority: "always",
    render: (value: string, item: EnrolledMember) => (
      <div>
        <p className="font-medium text-sm">{value}</p>
        <p className="text-xs text-muted-foreground">{item.memberId}</p>
      </div>
    )
  },
  { key: "enrolledDate", label: "Enrolled", priority: "md" },
  { 
    key: "attendanceRate", 
    label: "Attendance", 
    priority: "lg",
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <Progress value={value} className="w-12 h-1.5" />
        <span className="text-xs font-medium">{value}%</span>
      </div>
    )
  },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "confirmed" | "waitlist" | "cancelled") => (
      <StatusBadge 
        status={value === "confirmed" ? "success" : value === "waitlist" ? "warning" : "error"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

const attendanceColumns: Column<AttendanceRecord>[] = [
  { key: "date", label: "Date", priority: "always" },
  { 
    key: "attended", 
    label: "Attended", 
    priority: "always",
    render: (value: number, item: AttendanceRecord) => (
      <span className="font-medium text-success">{value}/{item.total}</span>
    )
  },
  { 
    key: "absent", 
    label: "Absent", 
    priority: "md",
    render: (value: number) => (
      <span className="text-destructive">{value}</span>
    )
  },
  { 
    key: "status", 
    label: "Status", 
    priority: "always",
    render: (value: "completed" | "cancelled" | "scheduled") => (
      <StatusBadge 
        status={value === "completed" ? "success" : value === "scheduled" ? "info" : "error"} 
        label={value.charAt(0).toUpperCase() + value.slice(1)} 
      />
    )
  },
];

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const gymClass = classData;

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: gymClass.name,
      instructor: gymClass.instructor,
      schedule: gymClass.schedule,
      time: gymClass.time,
      duration: gymClass.duration,
      room: gymClass.room,
      capacity: gymClass.capacity,
      level: gymClass.level,
      description: gymClass.description,
      equipment: gymClass.equipment.join(", "),
    },
  });

  const onSubmit = (data: ClassFormValues) => {
    console.log("Saving class:", data);
    toast({ title: "Saved", description: "Class updated successfully." });
  };

  const handleViewMember = (member: EnrolledMember) => {
    navigate(`/members/${member.id}`);
  };

  const memberActions: RowAction<EnrolledMember>[] = [
    { icon: Eye, label: "View Member", onClick: handleViewMember, variant: "primary" },
    { icon: XCircle, label: "Remove", onClick: () => toast({ title: "Member removed from class" }), variant: "danger" },
  ];

  // Overview Tab - Always Editable Form
  const OverviewTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader 
          title="Class Details" 
          action={
            <Button type="submit" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Class Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="text-xs text-muted-foreground">Class ID</FormLabel>
            <Input value={gymClass.classId} disabled className="mt-2" />
          </div>

          <FormField
            control={form.control}
            name="instructor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Instructor</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Room</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Schedule</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Mon, Wed, Fri" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Time</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 06:00 AM" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Duration</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 60 min" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Capacity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Level</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Equipment (comma-separated)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Yoga Mat, Blocks, Straps" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Capacity</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{gymClass.enrolled} enrolled</span>
                <span>{gymClass.capacity - gymClass.enrolled} spots left</span>
              </div>
              <Progress value={(gymClass.enrolled / gymClass.capacity) * 100} className="h-1.5" />
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Equipment Needed</h4>
            <div className="flex flex-wrap gap-1">
              {gymClass.equipment.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  // Enrolled Members Tab
  const EnrolledTab = (
    <div className="space-y-4">
      <SectionHeader 
        title={`Enrolled Members (${enrolledMembers.length}/${gymClass.capacity})`}
      />
      <ResponsiveTable 
        data={enrolledMembers} 
        columns={memberColumns} 
        keyExtractor={(item) => item.id}
        rowActions={memberActions}
        onRowClick={handleViewMember}
      />
    </div>
  );

  // Attendance Tab
  const AttendanceTab = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">24</p>
              <p className="text-xs text-muted-foreground truncate">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">92%</p>
              <p className="text-xs text-muted-foreground truncate">Avg Attendance</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">18</p>
              <p className="text-xs text-muted-foreground truncate">Enrolled</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-card-foreground">2</p>
              <p className="text-xs text-muted-foreground truncate">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Session History" />
      <ResponsiveTable 
        data={attendanceRecords} 
        columns={attendanceColumns} 
        keyExtractor={(item) => item.id}
      />
    </div>
  );

  const statusMap = { 
    scheduled: { status: "info" as const, label: "Scheduled" }, 
    ongoing: { status: "success" as const, label: "Ongoing" }, 
    completed: { status: "neutral" as const, label: "Completed" }, 
    cancelled: { status: "error" as const, label: "Cancelled" } 
  };

  const tabs: DetailTab[] = [
    { id: "overview", label: "Overview", icon: <Dumbbell />, content: OverviewTab },
    { id: "enrolled", label: "Enrolled", icon: <Users />, content: EnrolledTab },
    { id: "attendance", label: "Attendance", icon: <BarChart3 />, content: AttendanceTab },
    { id: "information", label: "Info", icon: <Info />, content: <InformationTab entityType="class" /> },
    { id: "rules", label: "Rules", icon: <ShieldCheck />, content: <RulesTab entityType="class" /> },
    { id: "schedule", label: "Schedule", icon: <Calendar />, content: <ScheduleTab entityType="class" mode="recurring" /> },
  ];

  return (
    <DetailPageTemplate
      title={gymClass.name}
      subtitle={`${gymClass.classId} • ${gymClass.instructor} • ${gymClass.schedule} at ${gymClass.time}`}
      avatar={
        <ImagePreview 
          src={gymClass.instructorImage} 
          alt={gymClass.instructor} 
          size="md" 
        />
      }
      badge={<StatusBadge {...statusMap[gymClass.status]} />}
      tabs={tabs}
      defaultTab="overview"
      backPath="/classes"
    />
  );
}