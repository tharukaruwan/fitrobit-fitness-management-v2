import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Clock, Dumbbell, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GymClass {
  id: number;
  classId: string;
  name: string;
  instructor: string;
  instructorImage: string;
  schedule: string;
  time: string;
  duration: string;
  capacity: number;
  enrolled: number;
  room: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

const sampleData: GymClass[] = [
  { id: 1, classId: "CLS-001", name: "Morning Yoga", instructor: "Emma Wilson", instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", schedule: "Mon, Wed, Fri", time: "06:00 AM", duration: "60 min", capacity: 20, enrolled: 18, room: "Studio A", status: "scheduled" },
  { id: 2, classId: "CLS-002", name: "HIIT Training", instructor: "Jake Miller", instructorImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150", schedule: "Tue, Thu, Sat", time: "07:30 AM", duration: "45 min", capacity: 15, enrolled: 15, room: "Main Floor", status: "ongoing" },
  { id: 3, classId: "CLS-003", name: "Spin Class", instructor: "Lisa Chen", instructorImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150", schedule: "Daily", time: "08:00 AM", duration: "50 min", capacity: 25, enrolled: 22, room: "Spin Room", status: "scheduled" },
  { id: 4, classId: "CLS-004", name: "Strength Training", instructor: "Mike Thompson", instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", schedule: "Mon, Wed, Fri", time: "10:00 AM", duration: "75 min", capacity: 12, enrolled: 8, room: "Weight Room", status: "scheduled" },
  { id: 5, classId: "CLS-005", name: "Pilates", instructor: "Sarah Davis", instructorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", schedule: "Tue, Thu", time: "11:00 AM", duration: "55 min", capacity: 18, enrolled: 14, room: "Studio B", status: "completed" },
  { id: 6, classId: "CLS-006", name: "Boxing", instructor: "Chris Johnson", instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", schedule: "Mon, Wed, Sat", time: "06:00 PM", duration: "60 min", capacity: 10, enrolled: 10, room: "Boxing Ring", status: "cancelled" },
  { id: 7, classId: "CLS-007", name: "Zumba", instructor: "Maria Garcia", instructorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", schedule: "Tue, Thu, Sat", time: "05:00 PM", duration: "60 min", capacity: 30, enrolled: 28, room: "Studio A", status: "scheduled" },
  { id: 8, classId: "CLS-008", name: "CrossFit", instructor: "David Lee", instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", schedule: "Mon, Wed, Fri", time: "07:00 AM", duration: "60 min", capacity: 15, enrolled: 12, room: "CrossFit Zone", status: "scheduled" },
  { id: 9, classId: "CLS-009", name: "Swimming", instructor: "Anna Brown", instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", schedule: "Daily", time: "06:30 AM", duration: "45 min", capacity: 8, enrolled: 6, room: "Pool", status: "ongoing" },
  { id: 10, classId: "CLS-010", name: "Meditation", instructor: "Tom Wilson", instructorImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", schedule: "Daily", time: "07:00 PM", duration: "30 min", capacity: 20, enrolled: 15, room: "Zen Room", status: "scheduled" },
];

const mockInstructors = [
  { id: "1", name: "Emma Wilson" },
  { id: "2", name: "Jake Miller" },
  { id: "3", name: "Lisa Chen" },
  { id: "4", name: "Mike Thompson" },
];

const mockRooms = [
  { id: "1", name: "Studio A" },
  { id: "2", name: "Studio B" },
  { id: "3", name: "Main Floor" },
  { id: "4", name: "Spin Room" },
  { id: "5", name: "Weight Room" },
];

const columns: Column<GymClass>[] = [
  { key: "instructorImage", label: "", priority: "always", className: "w-12", render: (value: string, item: GymClass) => <ImagePreview src={value} alt={item.instructor} size="sm" /> },
  {
    key: "name",
    label: "Class",
    priority: "always",
    render: (value: string, item: GymClass) => (
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{item.instructor}</p>
      </div>
    ),
  },
  { key: "classId", label: "ID", priority: "xl" },
  { key: "schedule", label: "Schedule", priority: "lg" },
  { key: "time", label: "Time", priority: "md" },
  { key: "duration", label: "Duration", priority: "lg" },
  { key: "enrolled", label: "Enrolled", priority: "always", render: (value: number, item: GymClass) => <span className={`font-medium ${value >= item.capacity ? "text-destructive" : "text-card-foreground"}`}>{value}/{item.capacity}</span> },
  { key: "room", label: "Room", priority: "xl" },
  {
    key: "status",
    label: "Status",
    priority: "md",
    render: (value: "scheduled" | "ongoing" | "completed" | "cancelled") => {
      const statusMap = { scheduled: { status: "info" as const, label: "Scheduled" }, ongoing: { status: "success" as const, label: "Ongoing" }, completed: { status: "neutral" as const, label: "Completed" }, cancelled: { status: "error" as const, label: "Cancelled" } };
      return <StatusBadge {...statusMap[value]} />;
    },
  },
];

export default function Classes() {
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    instructorId: "",
    schedule: "",
    time: "",
    duration: "",
    capacity: "",
    room: "",
    level: "all",
    description: "",
  });

  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["name", "instructor", "classId"],
  });

  const handleView = (item: GymClass) => {
    navigate(`/classes/${item.id}`);
  };

  const handleEdit = (item: GymClass) => {
    toast.info(`Editing ${item.name}`);
  };

  const handleDelete = (item: GymClass) => {
    toast.error(`Delete ${item.name}?`, {
      action: {
        label: "Confirm",
        onClick: () => toast.success(`${item.name} deleted`),
      },
    });
  };

  const rowActions: RowAction<GymClass>[] = [
    { icon: Eye, label: "View", onClick: handleView, variant: "primary" },
    { icon: Pencil, label: "Edit", onClick: handleEdit },
    { icon: Trash2, label: "Delete", onClick: handleDelete, variant: "danger" },
  ];

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a class name");
      return;
    }
    if (!formData.instructorId) {
      toast.error("Please select an instructor");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Class created successfully");
      setIsAddOpen(false);
      setIsSubmitting(false);
      resetForm();
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      instructorId: "",
      schedule: "",
      time: "",
      duration: "",
      capacity: "",
      room: "",
      level: "all",
      description: "",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">24</p>
              <p className="text-xs text-muted-foreground">Active Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">148</p>
              <p className="text-xs text-muted-foreground">Enrolled Today</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">10</p>
              <p className="text-xs text-muted-foreground">Today's Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">92%</p>
              <p className="text-xs text-muted-foreground">Avg Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search classes..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "scheduled", label: "Scheduled" },
              { value: "ongoing", label: "Ongoing" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            key: "room",
            label: "Room",
            value: filters.room || "all",
            onChange: (v) => handleFilter("room", v),
            options: [
              { value: "Studio A", label: "Studio A" },
              { value: "Studio B", label: "Studio B" },
              { value: "Main Floor", label: "Main Floor" },
              { value: "Spin Room", label: "Spin Room" },
            ],
          },
        ]}
        actions={
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Class
          </Button>
        }
      />

      {/* Table */}
      <ResponsiveTable 
        data={paginatedData} 
        columns={columns} 
        keyExtractor={(item) => item.id} 
        pagination={paginationProps}
        rowActions={rowActions}
        onRowClick={handleView}
      />

      {/* Quick Add Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Class"
        description="Create a new class schedule"
        onSubmit={handleSubmit}
        submitLabel="Create Class"
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Yoga"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="instructor">Instructor *</Label>
            <Select value={formData.instructorId} onValueChange={(v) => setFormData({ ...formData, instructorId: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {mockInstructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="e.g., Mon, Wed, Fri"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="20"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="room">Room</Label>
              <Select value={formData.room} onValueChange={(v) => setFormData({ ...formData, room: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the class..."
              className="mt-1.5"
              rows={3}
            />
          </div>
        </div>
      </QuickAddSheet>
    </div>
  );
}
