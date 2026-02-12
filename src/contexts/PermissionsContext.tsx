import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

// Module definitions
export const MODULES = [
  { id: "dashboard", name: "Dashboard", description: "View dashboard and analytics" },
  { id: "members", name: "Members", description: "Manage gym members" },
  { id: "memberships", name: "Memberships", description: "Manage membership plans" },
  { id: "classes", name: "Classes", description: "Manage classes and schedules" },
  { id: "personal_training", name: "Personal Training", description: "Manage PT packages and sessions" },
  { id: "attendance", name: "Attendance", description: "Track member attendance" },
  { id: "payments", name: "Payments & Receipts", description: "Handle payments and receipts" },
  { id: "expenses", name: "Expenses", description: "Track business expenses" },
  { id: "employees", name: "Employees", description: "Manage staff and employees" },
  { id: "broadcasts", name: "Broadcasts", description: "Send announcements and marketing" },
  { id: "products", name: "Products & POS", description: "Manage products and sales" },
  { id: "equipment", name: "Equipment", description: "Track gym equipment" },
  { id: "branches", name: "Branches", description: "Manage gym locations" },
  { id: "devices", name: "Devices", description: "Manage connected devices" },
  { id: "reports", name: "Reports & Analytics", description: "View reports and insights" },
  { id: "settings", name: "Settings", description: "Configure system settings" },
  { id: "roles", name: "Roles & Permissions", description: "Manage user roles" },
] as const;

export type ModuleId = typeof MODULES[number]["id"];
export type Action = "view" | "create" | "edit" | "delete";

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles can be edited but not deleted
  permissions: Record<ModuleId, ModulePermission>;
}

// Default system roles
const createFullAccess = (): ModulePermission => ({
  view: true,
  create: true,
  edit: true,
  delete: true,
});

const createViewOnly = (): ModulePermission => ({
  view: true,
  create: false,
  edit: false,
  delete: false,
});

const createNoAccess = (): ModulePermission => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

const createDefaultPermissions = (): Record<ModuleId, ModulePermission> => {
  const permissions: Partial<Record<ModuleId, ModulePermission>> = {};
  MODULES.forEach((m) => {
    permissions[m.id] = createNoAccess();
  });
  return permissions as Record<ModuleId, ModulePermission>;
};

const defaultRoles: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full access to all modules and settings",
    isSystem: true,
    permissions: MODULES.reduce((acc, m) => {
      acc[m.id] = createFullAccess();
      return acc;
    }, {} as Record<ModuleId, ModulePermission>),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access with some restrictions",
    isSystem: true,
    permissions: {
      dashboard: createFullAccess(),
      members: createFullAccess(),
      memberships: createFullAccess(),
      classes: createFullAccess(),
      personal_training: createFullAccess(),
      attendance: createFullAccess(),
      payments: createFullAccess(),
      expenses: createFullAccess(),
      employees: { view: true, create: true, edit: true, delete: false },
      broadcasts: createFullAccess(),
      products: createFullAccess(),
      equipment: createFullAccess(),
      branches: createViewOnly(),
      devices: createFullAccess(),
      reports: createFullAccess(),
      settings: { view: true, create: false, edit: true, delete: false },
      roles: createViewOnly(),
    },
  },
  {
    id: "front-desk",
    name: "Front Desk",
    description: "Reception and member check-in duties",
    isSystem: true,
    permissions: {
      dashboard: createViewOnly(),
      members: { view: true, create: true, edit: true, delete: false },
      memberships: createViewOnly(),
      classes: createViewOnly(),
      personal_training: createViewOnly(),
      attendance: { view: true, create: true, edit: false, delete: false },
      payments: { view: true, create: true, edit: false, delete: false },
      expenses: createNoAccess(),
      employees: createNoAccess(),
      broadcasts: createNoAccess(),
      products: { view: true, create: false, edit: false, delete: false },
      equipment: createNoAccess(),
      branches: createNoAccess(),
      devices: createNoAccess(),
      reports: createNoAccess(),
      settings: createNoAccess(),
      roles: createNoAccess(),
    },
  },
  {
    id: "trainer",
    name: "Trainer",
    description: "Personal trainers and class instructors",
    isSystem: true,
    permissions: {
      dashboard: createViewOnly(),
      members: createViewOnly(),
      memberships: createNoAccess(),
      classes: { view: true, create: true, edit: true, delete: false },
      personal_training: { view: true, create: true, edit: true, delete: false },
      attendance: { view: true, create: true, edit: false, delete: false },
      payments: createNoAccess(),
      expenses: createNoAccess(),
      employees: createNoAccess(),
      broadcasts: createNoAccess(),
      products: createNoAccess(),
      equipment: createViewOnly(),
      branches: createNoAccess(),
      devices: createNoAccess(),
      reports: createNoAccess(),
      settings: createNoAccess(),
      roles: createNoAccess(),
    },
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Financial management and reporting",
    isSystem: true,
    permissions: {
      dashboard: createViewOnly(),
      members: createViewOnly(),
      memberships: createViewOnly(),
      classes: createNoAccess(),
      personal_training: createNoAccess(),
      attendance: createNoAccess(),
      payments: createFullAccess(),
      expenses: createFullAccess(),
      employees: createNoAccess(),
      broadcasts: createNoAccess(),
      products: createViewOnly(),
      equipment: createNoAccess(),
      branches: createViewOnly(),
      devices: createNoAccess(),
      reports: createFullAccess(),
      settings: createNoAccess(),
      roles: createNoAccess(),
    },
  },
];

interface PermissionsContextType {
  roles: Role[];
  currentUserRole: Role | null;
  setCurrentUserRole: (roleId: string) => void;
  hasPermission: (moduleId: ModuleId, action: Action) => boolean;
  canAccessModule: (moduleId: ModuleId) => boolean;
  addRole: (role: Omit<Role, "id" | "isSystem">) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  deleteRole: (roleId: string) => boolean;
  getRoleById: (roleId: string) => Role | undefined;
  createDefaultPermissions: () => Record<ModuleId, ModulePermission>;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem("fitrobit_roles");
    return saved ? JSON.parse(saved) : defaultRoles;
  });
  
  const [currentUserRoleId, setCurrentUserRoleId] = useState<string>(() => {
    return localStorage.getItem("fitrobit_current_role") || "super-admin";
  });

  const currentUserRole = useMemo(() => {
    return roles.find((r) => r.id === currentUserRoleId) || null;
  }, [roles, currentUserRoleId]);

  const saveRoles = useCallback((newRoles: Role[]) => {
    setRoles(newRoles);
    localStorage.setItem("fitrobit_roles", JSON.stringify(newRoles));
  }, []);

  const setCurrentUserRole = useCallback((roleId: string) => {
    setCurrentUserRoleId(roleId);
    localStorage.setItem("fitrobit_current_role", roleId);
  }, []);

  const hasPermission = useCallback(
    (moduleId: ModuleId, action: Action): boolean => {
      if (!currentUserRole) return false;
      const modulePerms = currentUserRole.permissions[moduleId];
      return modulePerms?.[action] ?? false;
    },
    [currentUserRole]
  );

  const canAccessModule = useCallback(
    (moduleId: ModuleId): boolean => {
      return hasPermission(moduleId, "view");
    },
    [hasPermission]
  );

  const addRole = useCallback(
    (roleData: Omit<Role, "id" | "isSystem">) => {
      const newRole: Role = {
        ...roleData,
        id: `role-${Date.now()}`,
        isSystem: false,
      };
      saveRoles([...roles, newRole]);
    },
    [roles, saveRoles]
  );

  const updateRole = useCallback(
    (roleId: string, updates: Partial<Role>) => {
      saveRoles(
        roles.map((r) =>
          r.id === roleId ? { ...r, ...updates, id: r.id, isSystem: r.isSystem } : r
        )
      );
    },
    [roles, saveRoles]
  );

  const deleteRole = useCallback(
    (roleId: string): boolean => {
      const role = roles.find((r) => r.id === roleId);
      if (!role || role.isSystem) return false;
      saveRoles(roles.filter((r) => r.id !== roleId));
      return true;
    },
    [roles, saveRoles]
  );

  const getRoleById = useCallback(
    (roleId: string) => roles.find((r) => r.id === roleId),
    [roles]
  );

  return (
    <PermissionsContext.Provider
      value={{
        roles,
        currentUserRole,
        setCurrentUserRole,
        hasPermission,
        canAccessModule,
        addRole,
        updateRole,
        deleteRole,
        getRoleById,
        createDefaultPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
