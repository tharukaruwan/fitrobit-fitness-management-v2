import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import DailyAttendance from "./pages/attendance/DailyAttendance";
import FirstInOut from "./pages/attendance/FirstInOut";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Memberships from "./pages/Memberships";
import MembershipDetail from "./pages/MembershipDetail";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import TrainingCategories from "./pages/training/Categories";
import PersonalTraining from "./pages/training/PersonalTraining";
import PTPackageDetail from "./pages/PTPackageDetail";
import DayPasses from "./pages/DayPasses";
import Receipts from "./pages/Receipts";
import Expenses from "./pages/Expenses";
import Employees from "./pages/Employees";
import Devices from "./pages/Devices";
import Branches from "./pages/Branches";
import Broadcasts from "./pages/Broadcasts";
import FitrobitAI from "./pages/FitrobitAI";
import Settings from "./pages/Settings";
import CalendarPage from "./pages/Calendar";
import WorkoutTemplates from "./pages/WorkoutTemplates";
import WorkoutTemplateDetail from "./pages/WorkoutTemplateDetail";
import NutritionTemplates from "./pages/NutritionTemplates";
import NutritionTemplateDetail from "./pages/NutritionTemplateDetail";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import AttendanceHeatmap from "./pages/AttendanceHeatmap";
import UserAnalytics from "./pages/UserAnalytics";
import POS from "./pages/products/POS";
import Categories from "./pages/products/Categories";
import Equipment from "./pages/Equipment";
import Roles from "./pages/Roles";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MasterDataMeasurements from "./pages/master-data/Measurements";
import MasterDataExercises from "./pages/master-data/Exercises";
import MasterDataMealsLibrary from "./pages/master-data/MealsLibrary";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail";
import EmployeeDetail from "./pages/EmployeeDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PermissionsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attendance/daily" element={<DailyAttendance />} />
              <Route path="/attendance/first-in-out" element={<FirstInOut />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
              <Route path="/memberships" element={<Memberships />} />
              <Route path="/memberships/:id" element={<MembershipDetail />} />
              <Route path="/training/categories" element={<TrainingCategories />} />
              <Route path="/training/personal" element={<PersonalTraining />} />
              <Route path="/training/personal/:id" element={<PTPackageDetail />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/:id" element={<ClassDetail />} />
              <Route path="/workout-templates" element={<WorkoutTemplates />} />
              <Route path="/workout-templates/:id" element={<WorkoutTemplateDetail />} />
              <Route path="/nutrition-templates" element={<NutritionTemplates />} />
              <Route path="/nutrition-templates/:id" element={<NutritionTemplateDetail />} />
              <Route path="/master-data/workouts" element={<WorkoutTemplates />} />
              <Route path="/master-data/workouts/:id" element={<WorkoutTemplateDetail />} />
              <Route path="/master-data/meals" element={<NutritionTemplates />} />
              <Route path="/master-data/meals/:id" element={<NutritionTemplateDetail />} />
              <Route path="/master-data/measurements" element={<MasterDataMeasurements />} />
              <Route path="/master-data/exercises" element={<MasterDataExercises />} />
              <Route path="/master-data/meals-library" element={<MasterDataMealsLibrary />} />
              <Route path="/revenue-analytics" element={<RevenueAnalytics />} />
              <Route path="/attendance-heatmap" element={<AttendanceHeatmap />} />
              <Route path="/user-analytics" element={<UserAnalytics />} />
              <Route path="/products/pos" element={<POS />} />
              <Route path="/products/categories" element={<Categories />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/day-passes" element={<DayPasses />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/broadcasts" element={<Broadcasts />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/fitrobit-ai" element={<FitrobitAI />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PermissionsProvider>
  </QueryClientProvider>
);

export default App;
