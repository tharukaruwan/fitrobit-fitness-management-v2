import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  DetailPageTemplate, 
  DetailTab, 
  SectionHeader 
} from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage, supportedLanguages, type LanguageCode } from "@/store/languageSlice";
import { setCurrency, supportedCurrencies, selectCurrentCurrency } from "@/store/currencySlice";
import { useTranslation } from "@/hooks/useTranslation";
import { AccountSettingsTab } from "@/components/settings/AccountSettingsTab";
import { PaymentsTab } from "@/components/settings/PaymentsTab";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Globe,
  Mail, 
  Phone,
  Lock,
  Key,
  Eye,
  EyeOff,
  Pencil, 
  Save,
  X,
  Check,
  Smartphone,
  Tablet,
  Laptop,
  Trash2,
  RefreshCw,
  Coins,
  Wallet,
  Receipt
} from "lucide-react";

// User data is derived from Redux inside the component

// Sample devices data
const devicesData = [
  { id: 1, name: "MacBook Pro", type: "laptop", lastActive: "Now", location: "New York, US", current: true },
  { id: 2, name: "iPhone 15 Pro", type: "smartphone", lastActive: "2 hours ago", location: "New York, US", current: false },
  { id: 3, name: "iPad Pro", type: "tablet", lastActive: "Yesterday", location: "New York, US", current: false },
  { id: 4, name: "Windows Desktop", type: "laptop", lastActive: "3 days ago", location: "Los Angeles, US", current: false },
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const authUser = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const currentLang = supportedLanguages.find(l => l.code === currentLanguage);

  const userData = {
    name: authUser?.ownerName || authUser?.name || "User",
    email: authUser?.email || "",
    phone: authUser?.phoneNumber || "",
    role: authUser?.role === "gym" ? "Root Admin" : (authUser?.role || "User"),
    avatar: (authUser?.ownerName || authUser?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    avatarUrl: authUser?.logo || null,
    joinDate: authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
  };

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    membershipReminders: true,
    paymentAlerts: true,
    birthdayReminders: true,
    classReminders: true,
    marketingEmails: false,
  });

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const handleLanguageChange = (code: LanguageCode) => {
    dispatch(setLanguage(code));
    toast({ title: t('settings.language'), description: `Language changed to ${supportedLanguages.find(l => l.code === code)?.name}` });
  };

  const handleCurrencyChange = (code: string) => {
    dispatch(setCurrency(code));
    const currency = supportedCurrencies.find(c => c.code === code);
    toast({ title: "Currency Updated", description: `Currency changed to ${currency?.name} (${currency?.symbol})` });
  };

  const handleProfileSave = () => {
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setProfileData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    });
    setIsEditingProfile(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleRemoveDevice = (deviceId: number) => {
    toast({ title: "Device Removed", description: "The device has been logged out." });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "smartphone": return <Smartphone className="w-5 h-5" />;
      case "tablet": return <Tablet className="w-5 h-5" />;
      default: return <Laptop className="w-5 h-5" />;
    }
  };

  // Profile Tab
  const ProfileTab = (
    <div className="space-y-6">
      <SectionHeader 
        title={t('settings.accountDetails')}
        action={
          !isEditingProfile ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="w-4 h-4 mr-1" />
              {t('common.edit')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleProfileCancel}>
                <X className="w-4 h-4 mr-1" />
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleProfileSave}>
                <Save className="w-4 h-4 mr-1" />
                {t('common.save')}
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Full Name
          </Label>
          <Input
            id="name"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!isEditingProfile}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {t('auth.email')}
          </Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            disabled={!isEditingProfile}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Phone
          </Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!isEditingProfile}
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Role</Label>
          <Input
            value={userData.role}
            disabled
            className="disabled:opacity-100 disabled:cursor-default disabled:bg-muted/30"
          />
        </div>
      </div>
    </div>
  );

  // Security Tab
  const SecurityTab = (
    <div className="space-y-6">
      <SectionHeader title={t('settings.passwordSecurity')} />
      
      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Current Password
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password (min 8 characters)"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <Button onClick={handlePasswordChange} className="w-full sm:w-auto">
          <Lock className="w-4 h-4 mr-2" />
          Update Password
        </Button>
      </div>

      <SectionHeader title={t('settings.twoFactor')} />
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
        <div>
          <p className="font-medium text-card-foreground">Two-Factor Authentication</p>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
        <Switch />
      </div>
    </div>
  );

  // Notifications Tab
  const NotificationsTab = (
    <div className="space-y-6">
      <SectionHeader title="Email & Push Notifications" />
      
      <div className="space-y-3">
        {[
          { key: "emailNotifications", label: t('settings.emailNotifications'), description: "Receive notifications via email" },
          { key: "pushNotifications", label: t('settings.pushNotifications'), description: "Receive push notifications on your devices" },
          { key: "smsAlerts", label: t('settings.smsAlerts'), description: "Receive important alerts via SMS" },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
            <div>
              <p className="font-medium text-card-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={notifications[item.key as keyof typeof notifications]}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
            />
          </div>
        ))}
      </div>

      <SectionHeader title="Notification Types" />
      
      <div className="space-y-3">
        {[
          { key: "membershipReminders", label: "Membership Reminders", description: "Get notified about expiring memberships" },
          { key: "paymentAlerts", label: "Payment Alerts", description: "Receive payment confirmations and reminders" },
          { key: "birthdayReminders", label: "Birthday Reminders", description: "Get notified about member birthdays" },
          { key: "classReminders", label: "Class Reminders", description: "Reminders for upcoming classes" },
          { key: "marketingEmails", label: "Marketing Emails", description: "Receive promotional content and updates" },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
            <div>
              <p className="font-medium text-card-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={notifications[item.key as keyof typeof notifications]}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Appearance Tab (Theme + Language + Currency)
  const AppearanceTab = (
    <div className="space-y-6">
      <SectionHeader title={t('settings.themeSettings')} />
      
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "light", label: "Light", icon: "☀️" },
          { value: "dark", label: "Dark", icon: "🌙" },
          { value: "system", label: "System", icon: "💻" },
        ].map(item => (
          <button
            key={item.value}
            onClick={() => setTheme(item.value as typeof theme)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              theme === item.value
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border/50 hover:border-primary/30 hover:bg-accent/50'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {theme === item.value && <Check className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>

      <SectionHeader title="Currency" />
      <p className="text-sm text-muted-foreground mb-4">Select your preferred currency for displaying amounts throughout the application.</p>
      
      <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <Coins className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold">{currentCurrency.symbol}</span>
        <span className="font-medium text-card-foreground">Current Currency: {currentCurrency.name} ({currentCurrency.code})</span>
      </div>
      
      <ScrollArea className="h-48">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {supportedCurrencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                currentCurrency.code === currency.code
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/50 hover:border-primary/30 hover:bg-accent/50'
              }`}
            >
              <span className="text-xl font-bold w-8 text-center">{currency.symbol}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{currency.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currency.code}</p>
              </div>
              {currentCurrency.code === currency.code && (
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      <SectionHeader title={t('settings.language')} />
      <p className="text-sm text-muted-foreground mb-4">{t('settings.languageDesc')}</p>
      
      <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <Globe className="w-5 h-5 text-primary" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="font-medium text-card-foreground">{t('settings.currentLanguage')}: {currentLang?.name}</span>
      </div>
      
      <ScrollArea className="h-64">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                currentLanguage === lang.code
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/50 hover:border-primary/30 hover:bg-accent/50'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{lang.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lang.nativeName}</p>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Devices Tab
  const DevicesTab = (
    <div className="space-y-6">
      <SectionHeader 
        title="Active Sessions" 
        action={
          <Button size="sm" variant="outline" onClick={() => toast({ title: "All devices logged out" })}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Logout All
          </Button>
        }
      />
      
      <div className="space-y-3">
        {devicesData.map(device => (
          <div 
            key={device.id} 
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              device.current ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              device.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {getDeviceIcon(device.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground truncate">{device.name}</p>
                {device.current && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {device.location} • {device.lastActive}
              </p>
            </div>
            {!device.current && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveDevice(device.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <SectionHeader title="Device Preferences" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
          <div>
            <p className="font-medium text-card-foreground">Remember this device</p>
            <p className="text-sm text-muted-foreground">Stay logged in on trusted devices</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
          <div>
            <p className="font-medium text-card-foreground">Login notifications</p>
            <p className="text-sm text-muted-foreground">Get notified when logging in from new devices</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  const isRootAdmin = authUser?.role === "gym";

  const tabs: DetailTab[] = [
    { id: "profile", label: t('settings.profile'), icon: <User className="w-4 h-4" />, content: ProfileTab },
    { id: "security", label: t('settings.security'), icon: <Shield className="w-4 h-4" />, content: SecurityTab },
    { id: "notifications", label: t('settings.notifications'), icon: <Bell className="w-4 h-4" />, content: NotificationsTab },
    { id: "appearance", label: t('settings.appearance'), icon: <Palette className="w-4 h-4" />, content: AppearanceTab },
    { id: "devices", label: "Devices", icon: <Monitor className="w-4 h-4" />, content: DevicesTab },
    ...(isRootAdmin ? [
      { id: "payments", label: "Payments", icon: <Receipt className="w-4 h-4" />, content: <PaymentsTab /> },
      { id: "account", label: "Account", icon: <Wallet className="w-4 h-4" />, content: <AccountSettingsTab /> },
    ] : []),
  ];

  return (
    <DetailPageTemplate
      title={userData.name}
      subtitle={`${userData.role} • Member since ${userData.joinDate}`}
      avatar={
        userData.avatarUrl ? (
          <div className="w-14 h-14 rounded-2xl bg-muted ring-1 ring-border flex items-center justify-center overflow-hidden">
            <img src={userData.avatarUrl} alt={userData.name} className="w-full h-full object-contain p-1" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl">
            {userData.avatar}
          </div>
        )
      }
      badge={
        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {userData.role}
        </span>
      }
      tabs={tabs}
      defaultTab={tabFromUrl && tabs.some(t => t.id === tabFromUrl) ? tabFromUrl : "profile"}
      backPath="/"
    />
  );
}
