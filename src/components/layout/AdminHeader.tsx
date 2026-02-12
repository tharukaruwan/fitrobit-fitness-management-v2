import { useState, useRef, useMemo } from "react";
import { Menu, Bell, Cake, FileText, Calendar, LogOut, User, Settings, ChevronDown, Sparkles, ArrowRight, Bot, MessageSquare, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title: string;
}

// Sample data - in real app this would come from API
const notificationCount = 5;
const birthdayCount = 3;
const logCount = 12;
const smsCount = 1247;
const nextRenewalDate = "2026-02-15";

export function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const authUser = useAppSelector((state) => state.auth.user);
  const isRootAdmin = authUser?.role === "gym";

  const [aiQuery, setAiQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = {
    name: authUser?.ownerName || authUser?.name || "User",
    email: authUser?.email || authUser?.phoneNumber || "",
    initials: (authUser?.ownerName || authUser?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    avatarUrl: authUser?.logo || null,
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  const handleProfileClick = () => {
    navigate("/settings");
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      navigate("/fitrobit-ai", { state: { initialQuery: aiQuery.trim() } });
      setAiQuery("");
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-gradient-to-r from-card via-card to-muted/50 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-xl shrink-0 h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
          {/* AI Quick Chat Input - hidden on mobile */}
          <form
            onSubmit={handleAiSubmit}
            className={cn(
              "hidden lg:flex items-center gap-2 h-9 rounded-full border transition-all duration-300 overflow-hidden",
              isSubmitting
                ? "w-10 bg-primary border-primary scale-95 opacity-70"
                : isFocused
                  ? "w-72 bg-card border-primary/40 shadow-md shadow-primary/10"
                  : "w-56 bg-muted/50 border-border/50 hover:border-primary/30 hover:bg-card hover:shadow-sm"
            )}
          >
            {!isSubmitting && (
              <>
                <div className="pl-3 flex items-center">
                  <Sparkles className={cn(
                    "w-3.5 h-3.5 transition-colors duration-200",
                    isFocused ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask Fitrobit AI..."
                  className="flex-1 h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none pr-1"
                />
                {aiQuery.trim() && (
                  <button
                    type="submit"
                    className="mr-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
            {isSubmitting && (
              <div className="w-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
              </div>
            )}
          </form>

          {/* Root Admin indicators: SMS count & Renewal date */}
          {isRootAdmin && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate("/settings")}
                    className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-muted/50 border border-border/50 hover:bg-accent transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-card-foreground">{smsCount.toLocaleString()}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Remaining SMS Credits</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate("/settings")}
                    className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-muted/50 border border-border/50 hover:bg-accent transition-colors"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Renews {new Date(nextRenewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Next Subscription Renewal</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Language Selector */}
          <LanguageSelector />

          {/* Calendar - hidden on xs */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden xs:flex rounded-xl relative h-9 w-9" 
                onClick={() => navigate("/calendar")}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.calendarScheduling')}</TooltipContent>
          </Tooltip>

          {/* Logs - hidden on small screens */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl relative h-9 w-9">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                {logCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-muted-foreground text-background text-[9px] font-semibold rounded-full">
                    {logCount > 99 ? "99+" : logCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.activityLogs')}</TooltipContent>
          </Tooltip>

          {/* Birthday Reminders - hidden on small screens */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl relative h-9 w-9">
                <Cake className="w-4 h-4 sm:w-5 sm:h-5" />
                {birthdayCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-warning text-warning-foreground text-[9px] font-semibold rounded-full">
                    {birthdayCount > 99 ? "99+" : birthdayCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.birthdayReminders')}</TooltipContent>
          </Tooltip>

          {/* Notifications - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl relative h-9 w-9">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-semibold rounded-full">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.notifications')}</TooltipContent>
          </Tooltip>

          {/* User Profile Section */}
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
            {/* User Name - clickable, hidden on mobile */}
            <button
              onClick={handleProfileClick}
              className="hidden md:block text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {currentUser.name}
            </button>

            {/* Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <Avatar className="h-9 w-9 cursor-pointer bg-muted ring-1 ring-border">
                    <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} className="object-contain p-1" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold text-sm">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                {/* User info header in dropdown */}
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="cursor-pointer gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="cursor-pointer gap-2"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
