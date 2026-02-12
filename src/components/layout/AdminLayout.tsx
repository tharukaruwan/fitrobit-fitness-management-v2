import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { RenewalWarningModal } from "./RenewalWarningModal";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/attendance/daily": "Daily Attendance",
  "/attendance/first-in-out": "First In/Out",
  "/attendance-heatmap": "Attendance Heatmap",
  "/calendar": "Calendar",
  "/bookings": "Bookings",
  "/members": "Members",
  "/memberships": "Memberships",
  "/classes": "Classes",
  "/training/personal": "Personal Training",
  "/training/categories": "Training Categories",
  "/master-data/workouts": "Master Data",
  "/master-data/meals": "Master Data",
  "/master-data/measurements": "Master Data",
  "/master-data/exercises": "Master Data",
  "/master-data/meals-library": "Master Data",
  "/workout-templates": "Master Data",
  "/nutrition-templates": "Master Data",
  "/products/pos": "POS",
  "/products/categories": "Product Categories",
  "/day-passes": "Day Passes",
  "/receipts": "Receipts",
  "/expenses": "Expenses",
  "/employees": "Employees",
  "/roles": "Roles",
  "/devices": "Devices",
  "/branches": "Branches",
  "/equipment": "Equipment",
  "/broadcasts": "Broadcasts",
  "/fitrobit-ai": "Fitrobit AI",
  "/settings": "Settings",
  "/revenue-analytics": "Revenue Analytics",
  "/user-analytics": "User Analytics",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];
  
  // Prefix match for detail pages (e.g. /members/1 → "Members", /classes/2 → "Classes")
  const sortedPaths = Object.keys(pageTitles)
    .filter((p) => p !== "/")
    .sort((a, b) => b.length - a.length);
  
  for (const path of sortedPaths) {
    if (pathname.startsWith(path + "/") || pathname.startsWith(path)) {
      return pageTitles[path];
    }
  }
  
  return "Dashboard";
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <RenewalWarningModal />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={pageTitle}
        />
        
        <main className={cn(
          "flex-1 overflow-auto",
          location.pathname === "/products/pos" ? "p-0" : "p-4 lg:p-6"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
