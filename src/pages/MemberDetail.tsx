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
  CreditCard,
  TrendingUp,
  Pencil,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Plus,
  Eye,
  Printer,
  Download,
  Save,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  Apple,
  Activity,
  GraduationCap,
  Target,
  AlertCircle,
  FolderOpen,
  Trash2,
  IdCardIcon,
  Notebook,
} from "lucide-react";
import { MemberWorkoutTab } from "@/components/member/MemberWorkoutTab";
import { MemberDietTab } from "@/components/member/MemberDietTab";
import { MemberProgressTab } from "@/components/member/MemberProgressTab";
import { MemberActivityTab } from "@/components/member/MemberActivityTab";
import { MemberMembershipTab } from "@/components/member/MemberMembershipTab";
import { MemberClassesTab } from "@/components/member/MemberClassesTab";
import { MemberPTTab } from "@/components/member/MemberPTTab";
import { MemberEmergencyTab } from "@/components/member/MemberEmergencyTab";
import { MemberDocumentsTab } from "@/components/member/MemberDocumentsTab";
import { MemberStatusTab } from "@/components/member/MemberStatusTab";
import { MemberCalendarTab } from "@/components/member/MemberCalendarTab";
import { MemberPaymentsTab } from "@/components/member/MemberPaymentsTab";
import Request from "@/lib/api/client";
// Zod validation schema
const memberFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phoneNumber: z.string().trim().max(20),
  nic: z.string().trim().max(20),
  address: z.string().trim().max(500, { message: "Address too long" }),
  remark: z.string().trim().max(20),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  weight: z.string().max(20),
  height: z.string().max(20),
  goal: z.string().max(500),
  branch: z.string().min(1, { message: "Branch is required" }),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

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

export interface Membership {
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
  memberLimit: number;
  benefits: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MemberLite {
  _id: string;
  selfSignup: boolean;
  memberId: string;
  phoneNumber: string;
  nic: string;
  name: string;
  gender: "male" | "female" | string;
  user: string;
  oldMemberShipGroup: string[];
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
  memberShip: Membership;
  memberShipGroup: string;
}

export interface MemberShipGroup {
  _id: string;
  memberShip: Membership;
  members: MemberLite[];
  user: string;
  status: "Active" | "Inactive" | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Member {
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
  oldMemberShipGroup: string[];
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
  memberShip: Membership;
  memberShipGroup: MemberShipGroup;
  memberShipName?: string;
  expiryDate: Date;
}

export interface ApiMember {
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
  oldMemberShipGroup: string[];
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
  memberShip: Membership;
  memberShipGroup: MemberShipGroup;
}


const fetchMembers = async (id: string) => {
  const res = await Request.get<ApiMember>(`members/${id}`);
  return res;
};

const mapApiMember = (mb: ApiMember): Member => ({
  id: mb._id,
  memberId: mb.memberId,
  name: mb.name ? mb.name : "No Name",
  email: mb.email ? mb.email : "",
  phoneNumber: mb.phoneNumber ? mb.phoneNumber : "",
  nic: mb.nic ? mb.nic : "",
  address: mb.address ? mb.address : "",
  remark: mb.remark ? mb.remark : "",
  gender: mb.gender ? mb.gender : "other",
  dateOfBirth: mb.dateOfBirth ? new Date(mb.dateOfBirth) : null,
  weight: mb.weight ? mb.weight : "",
  height: mb.height ? mb.height : "",
  goal: mb.goal ? mb.goal : "",
  branch: mb.branch ? mb.branch : "",
  image: mb.image ? mb.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg",
  selfSignup: mb.selfSignup ? mb.selfSignup : false,
  user: mb.user ? mb.user : "",
  oldMemberShipGroup: [],
  notifications: [],
  status: mb.status ? mb.status : "Inactive",
  terminated: false,
  terminatedReasons: [],
  blackListed: false,
  blackListedReasons: [],
  renewalDay: "",
  deviceData: [],
  createdUser: "",
  createdBy: "",
  updatedAt: mb.updatedAt,
  memberShipName: mb.memberShip ? mb.memberShip.name : "No Membership",
  memberShip: mb.memberShip ? mb.memberShip : null,
  memberShipGroup: mb.memberShipGroup ? mb.memberShipGroup : undefined,
  createdAt: mb.createdAt,
  expiryDate: new Date(mb.updatedAt),
});

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg");


  const { data: apiResponse, isLoading, refetch, error } = useQuery({
    queryKey: ["members-list", id],
    queryFn: () => fetchMembers(id || ""),
  });

  const memberDetails = apiResponse ? mapApiMember(apiResponse) : null;
  useEffect(() => {
    if (memberDetails) {
      setAvatarUrl(memberDetails.image ? memberDetails.image : "https://static.vecteezy.com/system/resources/thumbnails/006/390/348/small/simple-flat-isolated-people-icon-free-vector.jpg");
    }
  }, [memberDetails]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      nic: "",
      address: "",
      remark: "",
      gender: "male",
      dateOfBirth: undefined,
      weight: "",
      height: "",
      goal: "",
      branch: "",
    },
  });

  useEffect(() => {
    if (memberDetails) {
      form.reset({
        name: memberDetails.name || "",
        email: memberDetails.email || "",
        phoneNumber: memberDetails.phoneNumber || "",
        nic: memberDetails.nic || "",
        address: memberDetails.address || "",
        remark: memberDetails.remark || "",
        gender: memberDetails.gender || "male",
        dateOfBirth: memberDetails.dateOfBirth || undefined,
        weight: memberDetails.weight || "",
        height: memberDetails.height || "",
        goal: memberDetails.goal || "",
        branch: memberDetails.branch || "",
      });
    }
  }, [memberDetails?.id, form]);


  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form with data:", data);
    try {
      await Request.put(`/members/${id}`, data);
      toast({ title: "Member Updated", description: "Personal details saved successfully." });
      refetch();
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast({ title: "Member Updated", description: "Failed to update member details." });
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
    window.open(`https://wa.me/${phoneNo.replace(/\D/g, "")}`, "_blank");
  };

  const handleEmail = (emailAdd: string) => {
    window.open(`mailto:${emailAdd}`, "_blank");
  };

  const PersonalTab = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionHeader
          title="Contact Information"
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
              const fieldValue = field.value instanceof Date ? field.value : new Date();
              const selectedDate = fieldValue;

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
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setMonth(date.getMonth());
                            newDate.setFullYear(date.getFullYear());
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
                <FormLabel className="text-xs text-muted-foreground">Weight</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel className="text-xs text-muted-foreground">Height</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectionHeader title="Fitness Goal" />
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  className="bg-primary/5 border-primary/20 text-primary font-medium"
                  placeholder="Enter fitness goal..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  const tabs: DetailTab[] = [
    {
      id: "personal",
      label: "Personal",
      icon: <User className="w-4 h-4" />,
      content: PersonalTab // TODO: Create seperate PersonalTab component with member details form
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-4 h-4" />,
      content: <MemberPaymentsTab id={id} />
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <CalendarIcon className="w-4 h-4" />,
      content: <MemberCalendarTab />
    },
    {
      id: "status",
      label: "Status",
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: <MemberStatusTab id={id} />
    },
    {
      id: "membership",
      label: "Membership",
      icon: <Users className="w-4 h-4" />,
      content: <MemberMembershipTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member" } />
    },
    {
      id: "classes",
      label: "Classes",
      icon: <GraduationCap className="w-4 h-4" />,
      content: <MemberClassesTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "pt",
      label: "PT",
      icon: <Target className="w-4 h-4" />,
      content: <MemberPTTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "workout",
      label: "Workout",
      icon: <Dumbbell className="w-4 h-4" />,
      content: <MemberWorkoutTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "diet",
      label: "Diet",
      icon: <Apple className="w-4 h-4" />,
      content: <MemberDietTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "progress",
      label: "Progress",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <MemberProgressTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="w-4 h-4" />,
      content: <MemberActivityTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "emergency",
      label: "Emergency",
      icon: <AlertCircle className="w-4 h-4" />,
      content: <MemberEmergencyTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FolderOpen className="w-4 h-4" />,
      content: <MemberDocumentsTab memberId={memberDetails?.memberId || undefined} memberName={memberDetails?.name || "Unknown Member"} />
    },
  ];


  return (
    <DetailPageTemplate
      isLoading={isLoading || isSubmitting}
      error={!!error ? "Failed to load member data." : false}
      title={memberDetails?.name || "Unknown Member"}
      subtitle={`${memberDetails?.memberShipName || "Membership Not Found"}`}
      avatar={
        <img
          src={avatarUrl}
          alt={memberDetails?.name || "Unknown Member"}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-border/50"
        />
      }
      onAvatarChange={handleAvatarChange}
      badge={
        <StatusBadge
          status={memberDetails?.status === "Active" ? "success" : memberDetails?.status === "Inactive" ? "error" : "warning"}
          label={memberDetails?.status.charAt(0).toUpperCase() + memberDetails?.status.slice(1)}
        />
      }
      tabs={tabs}
      defaultTab="personal"
      headerActions={[
        memberDetails?.phoneNumber && {
          label: "WhatsApp",
          icon: <MessageCircle className="w-4 h-4" />,
          onClick: () => handleWhatsApp(memberDetails.phoneNumber),
          variant: "outline" as const,
        },
        memberDetails?.email && {
          label: "Email",
          icon: <Mail className="w-4 h-4" />,
          onClick: () => handleEmail(memberDetails.email),
          variant: "outline" as const,
        },
      ].filter(Boolean)}
      backPath="/members"
    />
  );
}
