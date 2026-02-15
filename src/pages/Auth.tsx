import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, User, Shield, ArrowRight, Phone, Lock, UserCircle } from "lucide-react";
import { Request, TokenManager } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setAuthenticated, setTokens, setUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoSvg from "@/assets/logo-dark.svg";
import authBg from "@/assets/auth-bg.jpg";

type UserType = "employee" | "root";

// Gym ID validation: only letters, numbers, underscore, and hyphen allowed
const validateGymId = (value: string): boolean => {
  const gymIdRegex = /^[a-zA-Z0-9_-]+$/;
  return gymIdRegex.test(value);
};

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [userType, setUserType] = useState<UserType>("employee");

  // Form states
  const [gymId, setGymId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s-]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Gym ID validation for employee login or signup
    if (userType === "employee" || authMode === "signup") {
      if (!gymId.trim()) {
        newErrors.gymId = "Gym ID is required";
      } else if (!validateGymId(gymId)) {
        newErrors.gymId = "Gym ID can only contain letters, numbers, _ and -";
      }
    }

    // Full name validation for signup
    if (authMode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGymIdChange = (value: string) => {
    // Remove spaces and invalid characters as user types
    const sanitized = value.replace(/\s/g, "");
    setGymId(sanitized);
    
    // Clear error when user starts typing valid input
    if (errors.gymId && (sanitized === "" || validateGymId(sanitized))) {
      setErrors((prev) => ({ ...prev, gymId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "forgot") {
      // Validate only phone for forgot password
      const newErrors: Record<string, string> = {};
      if (!phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[+]?[\d\s-]{10,15}$/.test(phone.replace(/\s/g, ""))) {
        newErrors.phone = "Please enter a valid phone number";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fix the errors in the form");
        return;
      }
      
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Password reset link sent to your phone!");
      setAuthMode("login");
      resetForm();
      setIsLoading(false);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === "login" && userType === "root") {
        const response = await Request.post<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(
          "/users/login",
          { phoneNumber: phone, password }
        );
        
        dispatch(setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken }));
        dispatch(setUser(response.user as import("@/store/authSlice").AuthUser));
        dispatch(setAuthenticated(true));
        
        toast.success("Welcome back!");
        navigate("/");
      } else if (authMode === "login" && userType === "employee") {
        const response = await Request.post<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(
          "/employees/login",
          { id: gymId, phoneNumber: phone, password }
        );

        dispatch(setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken }));
        dispatch(setUser({ ...response.user, isEmployee: true } as import("@/store/authSlice").AuthUser));
        dispatch(setAuthenticated(true));

        toast.success("Welcome back!");
        navigate("/");
      } else if (authMode === "signup") {
        // Root Admin signup API
        await Request.post("/users/signup", {
          gymId,
          name: fullName,
          phoneNumber: phone,
          password,
        });

        // Store credentials to prefill on login page
        const registeredPhone = phone;
        const registeredPassword = password;

        toast.success("Account created successfully! Redirecting to login...");
        
        // Wait 2 seconds, then switch to login with prefilled credentials
        setTimeout(() => {
          setAuthMode("login");
          setUserType("root");
          setPhone(registeredPhone);
          setPassword(registeredPassword);
          setFullName("");
          setGymId("");
          setErrors({});
        }, 2000);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      const axiosMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMsg || msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhone("");
    setPassword("");
    setFullName("");
    setGymId("");
    setErrors({});
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/40 to-primary/20 backdrop-blur-[2px]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img src={logoSvg} alt="Fitrobit" className="h-12 sm:h-14 w-auto drop-shadow-md" />
        </div>

        <Card className="border-border/30 shadow-2xl bg-card/95 backdrop-blur-md rounded-2xl">
          <CardHeader className="text-center pb-2 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {authMode === "forgot" ? "Reset Password" : authMode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-sm">
              {authMode === "forgot"
                ? "Enter your phone number to receive a password reset link"
                : authMode === "login"
                ? "Sign in to access your dashboard"
                : "Sign up to get started with Fitrobit"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Forgot Password Form */}
            {authMode === "forgot" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="resetPhone" className="text-xs sm:text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="resetPhone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearFieldError("phone");
                      }}
                      className={`pl-10 h-10 sm:h-11 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 font-medium text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      resetForm();
                    }}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : authMode === "signup" ? (
              /* Signup is only for Root Admin — no tabs needed */
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Gym ID for Root Admin signup */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signupGymId" className="text-xs sm:text-sm font-medium">
                    Gym ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupGymId"
                      placeholder="e.g., my_gym-2024"
                      value={gymId}
                      onChange={(e) => handleGymIdChange(e.target.value)}
                      className={`pl-10 h-10 sm:h-11 text-sm ${errors.gymId ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {errors.gymId && (
                    <p className="text-xs text-destructive">{errors.gymId}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Create a unique ID for your gym</p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signupFullName" className="text-xs sm:text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupFullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearFieldError("fullName");
                      }}
                      className={`pl-10 h-10 sm:h-11 text-sm ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signupPhone" className="text-xs sm:text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupPhone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearFieldError("phone");
                      }}
                      className={`pl-10 h-10 sm:h-11 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="signupPassword" className="text-xs sm:text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError("password");
                      }}
                      className={`pl-10 h-10 sm:h-11 pr-10 text-sm ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 font-medium text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Root Admin Account
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Back to sign in */}
                <div className="text-center pt-1 sm:pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        resetForm();
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <>
                {/* Login mode — show Employee/Root tabs */}
                <Tabs
                  value={userType}
                  onValueChange={(v) => {
                    setUserType(v as UserType);
                    resetForm();
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12 bg-muted/50 rounded-xl">
                    <TabsTrigger 
                      value="employee" 
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Employee</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="root" 
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Root Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Employee Login */}
                  <TabsContent value="employee" className="mt-4 sm:mt-6">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="gymId" className="text-xs sm:text-sm font-medium">
                          Gym ID <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="gymId"
                            placeholder="e.g., fitness_hub-01"
                            value={gymId}
                            onChange={(e) => handleGymIdChange(e.target.value)}
                            className={`pl-10 h-10 sm:h-11 text-sm ${errors.gymId ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {errors.gymId && (
                          <p className="text-xs text-destructive">{errors.gymId}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Only letters, numbers, _ and - allowed</p>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
                          Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              clearFieldError("phone");
                            }}
                            className={`pl-10 h-10 sm:h-11 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-destructive">{errors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                            Password <span className="text-destructive">*</span>
                          </Label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("forgot");
                              resetForm();
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              clearFieldError("password");
                            }}
                            className={`pl-10 h-10 sm:h-11 pr-10 text-sm ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 sm:h-11 font-medium text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Root Admin Login */}
                  <TabsContent value="root" className="mt-4 sm:mt-6">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="rootPhone" className="text-xs sm:text-sm font-medium">
                          Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="rootPhone"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              clearFieldError("phone");
                            }}
                            className={`pl-10 h-10 sm:h-11 text-sm ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-destructive">{errors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rootPassword" className="text-xs sm:text-sm font-medium">
                            Password <span className="text-destructive">*</span>
                          </Label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("forgot");
                              resetForm();
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="rootPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              clearFieldError("password");
                            }}
                            className={`pl-10 h-10 sm:h-11 pr-10 text-sm ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive">{errors.password}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 sm:h-11 font-medium text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign In as Admin
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Sign up link */}
                <div className="text-center pt-1 sm:pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        resetForm();
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign up as Root Admin
                    </button>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/80 mt-4 sm:mt-6 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
