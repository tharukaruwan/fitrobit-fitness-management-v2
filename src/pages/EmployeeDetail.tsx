import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  DetailPageTemplate,
  DetailTab,
  SectionHeader
} from "@/components/ui/detail-page-template";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import {
  User,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Save,
  AlertCircle,
  FolderOpen,
  IdCardIcon,
  Notebook,
  ClipboardList,
  DollarSign,
  Shield,
  Award,
} from "lucide-react";
import { EmployeeEmergencyTab } from "@/components/employee/EmployeeEmergencyTab";
import { EmployeeDocumentsTab } from "@/components/employee/EmployeeDocumentsTab";
import { EmployeeCalendarTab } from "@/components/employee/EmployeeCalendarTab";
import { EmployeeAttendanceTab } from "@/components/employee/EmployeeAttendanceTab";
import { EmployeeSalaryTab } from "@/components/employee/EmployeeSalaryTab";
import { EmployeeLeaveTab } from "@/components/employee/EmployeeLeaveTab";
import { EmployeeQualificationsTab } from "@/components/employee/EmployeeQualificationsTab";
import Request from "@/lib/api/client";

// Zod validation schema - FIXED: Made optional fields actually optional
const employeeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255).or(z.literal("")),
  phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
  nic: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(500, { message: "Address too long" }).optional().or(z.literal("")),
  remark: z.string().trim().max(500).optional().or(z.literal("")),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  weight: z.string().max(20).optional().or(z.literal("")),
  height: z.string().max(20).optional().or(z.literal("")),
  goal: z.string().max(500).optional().or(z.literal("")),
  branch: z.string().optional().or(z.literal("")),
  status: z.string().min(1, { message: "Status is required" }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// Common Types
export interface Duration {
  days: number;
  weeks: number;
  months: number;
  years: number;
}

export interface Notification {
  note: string;
}

export interface Employeeship {
  _id: string;
  name: string;
  description: string;
  price: number;
  user: string;
  class: string | null;
  expiration: "Time_Base" | string;
  duration: Duration;
  maxAttendanceLimit: number | null;
  status: "Active" | "Inactive" | string;
  employeeLimit: number;
  benefits: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EmployeeLite {
  _id: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber: string;
  nic: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldEmployeeShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  employeeShip: Employeeship;
  employeeShipGroup: string;
}

export interface EmployeeShipGroup {
  _id: string;
  employeeShip: Employeeship;
  employees: EmployeeLite[];
  user: string;
  status: "Active" | "Inactive" | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Employee {
  address: string;
  remark: string;
  dateOfBirth: Date;
  weight: string;
  height: string;
  goal: string;
  branch: string;
  id: string;
  image?: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber: string;
  nic: string;
  email: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldEmployeeShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  employeeShip: Employeeship;
  employeeShipGroup: EmployeeShipGroup;
  employeeShipName?: string;
  expiryDate: Date;
}

export interface ApiEmployee {
  address: any;
  dateOfBirth: any;
  weight: any;
  height: any;
  goal: any;
  branch: any;
  remark: any;
  _id: string;
  image?: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber?: string;
  email: string;
  nic: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldEmployeeShipGroup: string[];
  notifications: Notification[];
  status: "Active" | "Inactive" | string;
  terminated: boolean;
  terminatedReasons: string[];
  blackListed: boolean;
  blackListedReasons: string[];
  renewalDay: string;
  deviceData: any[];
  createdUser: string;
  createdBy: "gym" | "admin" | string;
  createdAt: string;
  updatedAt: string;
  employeeShip: Employeeship;
  employeeShipGroup: EmployeeShipGroup;
}

interface Branch {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
}

interface BranchListResponse {
  data: Branch[];
  message: string;
}

const fetchEmployees = async (id: string) => {
  const res = await Request.get<ApiEmployee>(`employees/${id}`);
  return res;
};

const fetchBranches = async () => {
  const params = {
    "filters[status]": "Active",
    dataPerPage: 100, // Get all active branches
  };
  const res = await Request.get<BranchListResponse>("/branchers/list", params);
  return res.data || [];
};

// FIXED: Better null handling and type safety
const mapApiEmployee = (mb: ApiEmployee): Employee => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name || "No Name",
  email: mb.email || "",
  phoneNumber: mb.phoneNumber || "",
  nic: mb.nic || "",
  address: mb.address || "",
  remark: mb.remark || "",
  gender: mb.gender || "other",
  dateOfBirth: mb.dateOfBirth ? new Date(mb.dateOfBirth) : new Date(),
  weight: mb.weight || "",
  height: mb.height || "",
  goal: mb.goal || "",
  branch: mb.branch || "",
  image: mb.image || "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  selfSignup: mb.selfSignup || false,
  user: mb.user || "",
  oldEmployeeShipGroup: mb.oldEmployeeShipGroup || [],
  notifications: mb.notifications || [],
  status: mb.status || "Inactive",
  terminated: mb.terminated || false,
  terminatedReasons: mb.terminatedReasons || [],
  blackListed: mb.blackListed || false,
  blackListedReasons: mb.blackListedReasons || [],
  renewalDay: mb.renewalDay || "",
  deviceData: mb.deviceData || [],
  createdUser: mb.createdUser || "",
  createdBy: mb.createdBy || "gym",
  updatedAt: mb.updatedAt,
  employeeShipName: mb.employeeShip?.name || "No Employeeship",
  employeeShip: mb.employeeShip || null,
  employeeShipGroup: mb.employeeShipGroup || undefined,
  createdAt: mb.createdAt,
  expiryDate: mb.updatedAt ? new Date(mb.updatedAt) : new Date(),
});

export default function EmployeeDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg");

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ["branches-dropdown"],
    queryFn: fetchBranches,
  });

  const { data: apiResponse, isLoading, refetch, error } = useQuery({
    queryKey: ["employees-list", id],
    queryFn: () => fetchEmployees(id || ""),
    enabled: !!id, // FIXED: Only fetch if id exists
  });

  const employeeDetails = apiResponse ? mapApiEmployee(apiResponse) : null;

  useEffect(() => {
    if (employeeDetails?.image) {
      setAvatarUrl(employeeDetails.image);
    }
  }, [employeeDetails?.image]);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      nic: "",
      status: "",
      address: "",
      remark: "",
      gender: "male", // FIXED: Capital M to match SelectItem values
      dateOfBirth: undefined,
      weight: "",
      height: "",
      goal: "",
      branch: "",
    },
  });

  // FIXED: Better dependency tracking
  useEffect(() => {
    if (employeeDetails) {
      form.reset({
        name: employeeDetails.name || "",
        email: employeeDetails.email || "",
        phoneNumber: employeeDetails.phoneNumber || "",
        nic: employeeDetails.nic || "",
        status: employeeDetails.status || "",
        address: employeeDetails.address || "",
        remark: employeeDetails.remark || "",
        gender: employeeDetails.gender || "male",
        dateOfBirth: employeeDetails.dateOfBirth || undefined,
        weight: employeeDetails.weight || "",
        height: employeeDetails.height || "",
        goal: employeeDetails.goal || "",
        branch: employeeDetails.branch || "",
      });
    }
  }, [employeeDetails?.id, form]);

  // FIXED: Better error handling and toast messages
  const onSubmit = async (data: EmployeeFormValues) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Employee ID is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting form with data:", data);

    try {
      // FIXED: Format date properly for API
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
      };

      await Request.put(`/employees/${id}`, formattedData);

      toast({
        title: "Success",
        description: "Employee details updated successfully.",
      });

      await refetch();
    } catch (error: any) {
      console.error("Error updating employee:", error);

      const errorMessage = error?.response?.data?.message
        || error?.message
        || "Failed to update employee details.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast({ title: "Photo Updated", description: "Profile photo has been changed." });
  };

  const handleWhatsApp = (phoneNo: string) => {
    if (!phoneNo) {
      toast({
        title: "Error",
        description: "Phone number not available.",
        variant: "destructive"
      });
      return;
    }
    window.open(`https://wa.me/${phoneNo.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (emailAdd: string) => {
    if (!emailAdd) {
      toast({
        title: "Error",
        description: "Email address not available.",
        variant: "destructive"
      });
      return;
    }
    window.open(`mailto:${emailAdd}`, "_blank");
  };

  const PersonalTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader
          title="Contact Information"
          action={
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-1" />
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IdCardIcon className="w-3.5 h-3.5" /> NIC
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IdCardIcon className="w-3.5 h-3.5" /> Status
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IdCardIcon className="w-3.5 h-3.5" /> Branch
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value} onValueChange={field.onChange}
                    disabled={branchesLoading}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length === 0 && !branchesLoading ? (
                        <SelectItem value="no-branches" disabled>
                          No active branches available
                        </SelectItem>
                      ) : (
                        branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            {branch.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[60px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remark"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Notebook className="w-3.5 h-3.5" /> Remark
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[60px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectionHeader title="Physical Details" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Gender</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => {
              const currentYear = new Date().getFullYear();
              const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];

              // FIXED: Better null handling for date
              const selectedDate = field.value instanceof Date && !isNaN(field.value.getTime())
                ? field.value
                : new Date();

              return (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value instanceof Date && !isNaN(field.value.getTime())
                            ? format(field.value, "PPP")
                            : <span>Pick a date</span>
                          }
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Select
                          value={selectedDate.getMonth().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedDate.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(parseInt(value));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[90px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        month={selectedDate}
                        onMonthChange={(date) => {
                          if (field.value instanceof Date) {
                            const newDate = new Date(field.value);
                            newDate.setMonth(date.getMonth());
                            newDate.setFullYear(date.getFullYear());
                            field.onChange(newDate);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Weight (kg)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.1" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Height (cm)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.1" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  const tabs: DetailTab[] = [
    {
      id: "personal",
      label: "Personal",
      icon: <User className="w-4 h-4" />,
      content: PersonalTab
    },
    // {
    //   id: "calendar",
    //   label: "Calendar",
    //   icon: <CalendarIcon className="w-4 h-4" />,
    //   content: <EmployeeCalendarTab />
    // },
    {
      id: "emergency",
      label: "Emergency",
      icon: <AlertCircle className="w-4 h-4" />,
      content: <EmployeeEmergencyTab memberId={employeeDetails?.memberId || undefined} memberName={employeeDetails?.name || "Unknown Employee"} />
    },
    { 
      id: "attendance", 
      label: "Attendance", 
      icon: <ClipboardList className="w-4 h-4" />, 
      content: <EmployeeAttendanceTab /> 
    },
    { 
      id: "salary", 
      label: "Salary", 
      icon: <DollarSign className="w-4 h-4" />, 
      content: <EmployeeSalaryTab /> 
    },
    { 
      id: "leave", 
      label: "Leave & HR", 
      icon: <Shield className="w-4 h-4" />, 
      content: <EmployeeLeaveTab /> 
    },
    { 
      id: "qualifications", 
      label: "Qualifications", 
      icon: <Award className="w-4 h-4" />, 
      content: <EmployeeQualificationsTab /> 
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FolderOpen className="w-4 h-4" />,
      content: <EmployeeDocumentsTab memberId={employeeDetails?.memberId || undefined} memberName={employeeDetails?.name || "Unknown Employee"} />
    },
  ];

  // FIXED: Better conditional rendering
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Employee ID Missing</h2>
          <p className="text-muted-foreground">Unable to load employee details.</p>
        </div>
      </div>
    );
  }

  return (
    <DetailPageTemplate
      isLoading={isLoading || isSubmitting}
      error={!!error ? "Failed to load employee data." : false}
      title={employeeDetails?.name || "Unknown Employee"}
      subtitle={`${employeeDetails?.employeeShipName || "Employeeship Not Found"}`}
      avatar={
        <img
          src={avatarUrl}
          alt={employeeDetails?.name || "Unknown Employee"}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-border/50"
        />
      }
      onAvatarChange={handleAvatarChange}
      badge={
        <StatusBadge
          status={employeeDetails?.status === "Active" ? "success" : employeeDetails?.status === "Inactive" ? "error" : "warning"}
          label={employeeDetails?.status ? employeeDetails.status.charAt(0).toUpperCase() + employeeDetails.status.slice(1) : "Unknown"}
        />
      }
      tabs={tabs}
      defaultTab="personal"
      headerActions={[
        employeeDetails?.phoneNumber && {
          label: "WhatsApp",
          icon: <MessageCircle className="w-4 h-4" />,
          onClick: () => handleWhatsApp(employeeDetails.phoneNumber),
          variant: "outline" as const,
        },
        employeeDetails?.email && {
          label: "Email",
          icon: <Mail className="w-4 h-4" />,
          onClick: () => handleEmail(employeeDetails.email),
          variant: "outline" as const,
        },
      ].filter(Boolean)}
      backPath="/employees"
    />
  );
}