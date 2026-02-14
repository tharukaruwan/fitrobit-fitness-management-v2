import { useState, useMemo, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  Dumbbell,
  Ticket,
  Receipt,
  TrendingDown,
  UserCog,
  Smartphone,
  Building2,
  Radio,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  ClipboardList,
  Package,
  Wrench,
  FolderOpen,
  Shield,
  UserCog2,
  Database,
  Apple,
  Ruler,
  CalendarDays,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { usePermissions, ModuleId } from "@/contexts/PermissionsContext";
import logoSvg from "@/assets/logo-dark.svg";
import logoIcon from "@/assets/logo-icon.svg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { toggleSidebar } from "@/store/sidebarSlice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItem {
  title: string;
  translate: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  moduleId?: ModuleId;
  subItems?: {
    title: string;
    translate: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    moduleId?: ModuleId;
  }[];
}

interface MenuSection {
  title: string;
  translate: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "",
    translate: "",
    items: [
      { title: "Dashboard", translate: "nav.dashboard", icon: LayoutDashboard, path: "/", moduleId: "dashboard" },
      {
        title: "Attendance",
        icon: UserCheck,
        moduleId: "attendance",
        translate: "nav.attendance", 
        subItems: [
          { title: "Daily", translate: "nav.dailyAttendance", path: "/attendance/daily", icon: CalendarDays, moduleId: "attendance" },
          { title: "First In/Out", translate: "nav.firstInOut", path: "/attendance/first-in-out", icon: Clock, moduleId: "attendance" },
        ],
      },
      { title: "Calendar", translate: "nav.calendar", icon: CalendarDays, path: "/calendar", moduleId: "classes" },
      { title: "Bookings", translate: "nav.bookings", icon: CalendarCheck, path: "/bookings", moduleId: "classes" },
      { title: "Members", translate: "nav.members", icon: Users, path: "/members", moduleId: "members" },
      {
        title: "Training & Plans",
        translate: "nav.trainingPlans", 
        icon: CreditCard,
        moduleId: "memberships",
        subItems: [
          { title: "Memberships", translate: "nav.memberships", path: "/memberships", icon: CreditCard, moduleId: "memberships" },
          { title: "Classes", translate: "nav.classes", path: "/classes", icon: Dumbbell, moduleId: "classes" },
          { title: "Personal Training", translate: "nav.personalTraining", path: "/training/personal", icon: UserCog2, moduleId: "personal_training" },
          { title: "Categories", translate: "nav.categories", path: "/training/categories", icon: FolderOpen, moduleId: "memberships" },
        ],
      },
      {
        title: "Master Data",
        translate: "nav.masterData", 
        icon: Database,
        moduleId: "classes",
        subItems: [
          { title: "Workout Plans", translate: "nav.workoutPlans", path: "/master-data/workouts", icon: ClipboardList, moduleId: "classes" },
          { title: "Nutrition Plans", translate: "nav.nutritionPlans", path: "/master-data/meals", icon: Apple, moduleId: "classes" },
          { title: "Exercises", translate: "nav.exercises", path: "/master-data/exercises", icon: Dumbbell, moduleId: "classes" },
          { title: "Meals", translate: "nav.meals", path: "/master-data/meals-library", icon: Apple, moduleId: "classes" },
          { title: "Measurements", translate: "nav.measurements", path: "/master-data/measurements", icon: Ruler, moduleId: "classes" },
        ],
      },
      {
        title: "Products",
        translate: "nav.products", 
        icon: Package,
        moduleId: "products",
        subItems: [
          { title: "POS", translate: "nav.pos", path: "/products/pos", icon: Package, moduleId: "products" },
          { title: "Categories", translate: "nav.categories", path: "/products/categories", icon: FolderOpen, moduleId: "products" },
        ],
      },
      {
        title: "Operations",
        translate: "operations", 
        icon: Receipt,
        moduleId: "members",
        subItems: [
          { title: "Day Passes", translate: "daypasses", path: "/day-passes", icon: Ticket, moduleId: "members" },
          { title: "Receipts", translate: "nav.receipts", path: "/receipts", icon: Receipt, moduleId: "payments" },
          { title: "Expenses", translate: "nav.expenses", path: "/expenses", icon: TrendingDown, moduleId: "expenses" },
        ],
      },
      {
        title: "Organization",
        translate: "organization", 
        icon: Building2,
        moduleId: "employees",
        subItems: [
          { title: "Employees", translate: "nav.employees", path: "/employees", icon: UserCog, moduleId: "employees" },
          { title: "Roles", translate: "nav.roles", path: "/roles", icon: Shield, moduleId: "roles" },
          { title: "Branches", translate: "nav.branches", path: "/branches", icon: Building2, moduleId: "branches" },
          { title: "Devices", translate: "nav.devices", path: "/devices", icon: Smartphone, moduleId: "devices" },
          { title: "Equipment", translate: "nav.equipment", path: "/equipment", icon: Wrench, moduleId: "equipment" },
        ],
      },
      {
        title: "Tools",
        translate: "tools", 
        icon: Radio,
        moduleId: "broadcasts",
        subItems: [
          { title: "Broadcasts", translate: "nav.broadcasts", path: "/broadcasts", icon: Radio, moduleId: "broadcasts" },
          { title: "Fitrobit AI", translate: "nav.fitrobitAI", path: "/fitrobit-ai", icon: Bot, moduleId: "dashboard" },
        ],
      },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { t } = useTranslation();
  const { canAccessModule } = usePermissions();
  const authUser = useAppSelector((state) => state.auth.user);
  const collapsed = useAppSelector((state) => state.sidebar.collapsed);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsLargeScreen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Only apply collapsed mode on large screens
  const isCollapsed = collapsed && isLargeScreen;

  const currentUser = {
    name: authUser?.ownerName || authUser?.name || "User",
    email: authUser?.email || authUser?.phoneNumber || "",
    initials: (authUser?.ownerName || authUser?.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    avatarUrl: authUser?.logo || null,
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebar());
  };

  const filteredMenuSections = useMemo(() => {
    return menuSections.map((section) => {
      const filteredItems = section.items
        .map((item) => {
          if (item.moduleId && !canAccessModule(item.moduleId)) {
            if (item.subItems) {
              const accessibleSubItems = item.subItems.filter(
                (sub) => !sub.moduleId || canAccessModule(sub.moduleId)
              );
              if (accessibleSubItems.length > 0) {
                return { ...item, subItems: accessibleSubItems };
              }
            }
            return null;
          }
          if (item.subItems) {
            const accessibleSubItems = item.subItems.filter(
              (sub) => !sub.moduleId || canAccessModule(sub.moduleId)
            );
            if (accessibleSubItems.length === 0) return null;
            return { ...item, subItems: accessibleSubItems };
          }
          return item;
        })
        .filter(Boolean) as MenuItem[];
      return { ...section, items: filteredItems };
    }).filter((section) => section.items.length > 0);
  }, [canAccessModule]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isSubItemActive = (subItems?: MenuItem["subItems"]) => {
    if (!subItems) return false;
    return subItems.some((item) => isActive(item.path));
  };

  // Collapsed item - uses Popover (click-based, works on touch/tablet)
  const CollapsedMenuItem = ({ item }: { item: MenuItem }) => {
    if (item.subItems) {
      const active = isSubItemActive(item.subItems);
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-48 p-2 z-[9999] bg-popover border shadow-lg"
          >
            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t(item.translate as any)}
            </p>
            <div className="space-y-0.5">
              {item.subItems.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors",
                    isActive(sub.path)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <sub.icon className="w-4 h-4" />
                  {t(sub.translate as any)}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            to={item.path!}
            onClick={onClose}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto",
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium z-[9999]">
          {t(item.translate as any)}
        </TooltipContent>
      </Tooltip>
    );
  };

  const sidebarWidth = isCollapsed ? "w-[68px]" : "w-72";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border z-50",
          "transform transition-all duration-300 ease-out flex flex-col",
          "lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:shrink-0",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Edge collapse handle - a slim tab on the sidebar edge */}
        <button
          onClick={handleToggleCollapse}
          className={cn(
            "hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-[14px] z-[60]",
            "w-[14px] h-14 items-center justify-center",
            "rounded-r-md bg-accent/80 border border-l-0 border-sidebar-border",
            "text-muted-foreground hover:text-primary hover:bg-accent hover:w-[18px]",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Header */}
        <div className={cn(
          "flex items-center h-16 border-b border-sidebar-border shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between px-5"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="Fitrobit" className="h-8 w-auto" />
            </div>
          )}
          {isCollapsed && (
            <img src={logoIcon} alt="Fitrobit" className="h-7 w-7 object-contain" />
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className={cn("py-4 space-y-6", isCollapsed ? "px-1.5" : "px-3")}>
            {filteredMenuSections.map((section, sectionIndex) => (
              <div key={section.title || `section-${sectionIndex}`}>
                {section.title && !isCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.translate ? t(section.translate as any) : section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      {isCollapsed ? (
                        <CollapsedMenuItem item={item} />
                      ) : item.subItems ? (
                        <div>
                          <button
                            onClick={() => toggleExpand(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl",
                              "text-sm font-medium transition-all duration-200",
                              isSubItemActive(item.subItems)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5" />
                              <span>{t(item.translate as any)}</span>
                            </div>
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          {expandedItems.includes(item.title) && (
                            <ul className="mt-1 ml-4 pl-4 border-l-2 border-sidebar-border space-y-1">
                              {item.subItems.map((subItem) => (
                                <li key={subItem.path}>
                                  <Link
                                    to={subItem.path}
                                    onClick={onClose}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                                      "transition-all duration-200",
                                      isActive(subItem.path)
                                        ? "bg-primary text-primary-foreground font-medium shadow-soft"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                    )}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    <span>{t(subItem.translate as any)}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.path!}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                            "transition-all duration-200",
                            isActive(item.path)
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{t(item.translate as any)}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Footer */}
        <div className={cn(
          "shrink-0 border-t border-sidebar-border p-3",
          isCollapsed && "p-2"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 shrink-0 bg-muted ring-1 ring-border cursor-pointer hover:ring-primary transition-all">
                      <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} className="object-contain p-1" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-xs">
                        {currentUser.initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="end" sideOffset={8} className="w-48 p-3 z-[9999] bg-popover border shadow-lg">
                  <p className="font-medium text-sm truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate mb-3">{currentUser.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("common.logout" as any)}
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 bg-muted ring-1 ring-border">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} className="object-contain p-1" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="shrink-0 h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}