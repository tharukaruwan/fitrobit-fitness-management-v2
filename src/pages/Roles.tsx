import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Users,
  Eye,
  PenLine,
  FilePlus,
  Trash,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePermissions,
  MODULES,
  ModuleId,
  ModulePermission,
  Role,
} from "@/contexts/PermissionsContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Roles() {
  const {
    roles,
    addRole,
    updateRole,
    deleteRole,
    createDefaultPermissions,
    hasPermission,
  } = usePermissions();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: createDefaultPermissions(),
  });

  const canCreate = hasPermission("roles", "create");
  const canEdit = hasPermission("roles", "edit");
  const canDelete = hasPermission("roles", "delete");

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: createDefaultPermissions(),
    });
    setSelectedRole(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditForm = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setIsEditOpen(true);
  };

  const duplicateRole = (role: Role) => {
    setFormData({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setIsAddOpen(true);
  };

  const handleAddRole = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    addRole({
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
    });
    toast.success("Role created successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    if (!formData.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    updateRole(selectedRole.id, {
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
    });
    toast.success("Role updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    if (deleteRole(selectedRole.id)) {
      toast.success("Role deleted successfully");
    } else {
      toast.error("Cannot delete system roles");
    }
    setIsDeleteOpen(false);
    setSelectedRole(null);
  };

  const togglePermission = (moduleId: ModuleId, action: keyof ModulePermission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId],
          [action]: !prev.permissions[moduleId][action],
          // If disabling view, disable all other actions
          ...(action === "view" && prev.permissions[moduleId].view
            ? { create: false, edit: false, delete: false }
            : {}),
          // If enabling any action, also enable view
          ...(action !== "view" && !prev.permissions[moduleId][action]
            ? { view: true }
            : {}),
        },
      },
    }));
  };

  const setAllPermissions = (moduleId: ModuleId, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          view: value,
          create: value,
          edit: value,
          delete: value,
        },
      },
    }));
  };

  const getPermissionCount = (role: Role) => {
    let count = 0;
    Object.values(role.permissions).forEach((perms) => {
      if (perms.view) count++;
    });
    return count;
  };

  const PermissionsEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Role Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Branch Manager"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this role's responsibilities"
            rows={2}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">Module Permissions</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Configure what actions this role can perform in each module
        </p>

        {/* Desktop/Tablet Header */}
        <div className="hidden md:grid grid-cols-[1fr_60px_60px_60px_60px_70px] gap-1 px-3 py-2 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground mb-2">
          <span>Module</span>
          <span className="text-center">View</span>
          <span className="text-center">Create</span>
          <span className="text-center">Edit</span>
          <span className="text-center">Delete</span>
          <span className="text-center">All</span>
        </div>

        <ScrollArea className="h-[280px] md:h-[350px]">
          <div className="space-y-1 pr-3">
            {MODULES.map((module) => {
              const perms = formData.permissions[module.id];
              const allEnabled = perms.view && perms.create && perms.edit && perms.delete;

              return (
                <div
                  key={module.id}
                  className="rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden p-3 space-y-3">
                    <div>
                      <p className="font-medium text-sm">{module.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {module.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {(["view", "create", "edit", "delete"] as const).map((action) => (
                        <label
                          key={action}
                          className="flex flex-col items-center gap-1.5 cursor-pointer"
                        >
                          <Checkbox
                            checked={perms[action]}
                            onCheckedChange={() => togglePermission(module.id, action)}
                          />
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {action}
                          </span>
                        </label>
                      ))}
                      <Button
                        type="button"
                        variant={allEnabled ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => setAllPermissions(module.id, !allEnabled)}
                      >
                        {allEnabled ? <Check className="h-3 w-3" /> : "All"}
                      </Button>
                    </div>
                  </div>

                  {/* Desktop/Tablet Layout */}
                  <div className="hidden md:grid grid-cols-[1fr_60px_60px_60px_60px_70px] gap-1 px-3 py-2.5 items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{module.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {module.description}
                      </p>
                    </div>
                    {(["view", "create", "edit", "delete"] as const).map((action) => (
                      <div key={action} className="flex justify-center">
                        <Checkbox
                          checked={perms[action]}
                          onCheckedChange={() => togglePermission(module.id, action)}
                        />
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant={allEnabled ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => setAllPermissions(module.id, !allEnabled)}
                      >
                        {allEnabled ? <Check className="h-3 w-3" /> : "All"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage access control for your team
          </p>
        </div>
        {canCreate && (
          <Button onClick={openAddForm}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-xs text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {roles.filter((r) => r.isSystem).length}
                </p>
                <p className="text-xs text-muted-foreground">System Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <PenLine className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {roles.filter((r) => !r.isSystem).length}
                </p>
                <p className="text-xs text-muted-foreground">Custom Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={cn(
              "transition-all duration-200",
              expandedRole === role.id && "ring-2 ring-primary/20"
            )}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() =>
                    setExpandedRole(expandedRole === role.id ? null : role.id)
                  }
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-[10px]">
                          System
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-1">
                      {role.description || "No description"}
                    </CardDescription>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                      expandedRole === role.id && "rotate-90"
                    )}
                  />
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicateRole(role)}
                    title="Duplicate"
                    disabled={!canCreate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(role)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && !role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsDeleteOpen(true);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Permission summary badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {getPermissionCount(role)} of {MODULES.length} modules
                </span>
              </div>
            </CardHeader>

            {/* Expanded permissions view */}
            {expandedRole === role.id && (
              <CardContent className="px-4 pb-4 pt-2">
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {MODULES.map((module) => {
                      const perms = role.permissions[module.id];
                      if (!perms.view) return null;

                      return (
                        <div
                          key={module.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                        >
                          <span className="text-sm font-medium flex-1">
                            {module.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {perms.view && (
                              <span
                                className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center"
                                title="View"
                              >
                                <Eye className="w-3 h-3 text-blue-500" />
                              </span>
                            )}
                            {perms.create && (
                              <span
                                className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center"
                                title="Create"
                              >
                                <FilePlus className="w-3 h-3 text-green-500" />
                              </span>
                            )}
                            {perms.edit && (
                              <span
                                className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center"
                                title="Edit"
                              >
                                <PenLine className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                            {perms.delete && (
                              <span
                                className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash className="w-3 h-3 text-red-500" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* No access modules */}
                  {MODULES.filter((m) => !role.permissions[m.id].view).length >
                    0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        No access to:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {MODULES.filter((m) => !role.permissions[m.id].view).map(
                          (module) => (
                            <Badge
                              key={module.id}
                              variant="outline"
                              className="text-xs opacity-50"
                            >
                              {module.name}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Role Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
        title="Create New Role"
        description="Define a new role with specific permissions"
        onSubmit={handleAddRole}
        submitLabel="Create Role"
        className="sm:max-w-xl"
      >
        <PermissionsEditor />
      </QuickAddSheet>

      {/* Edit Role Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
        title="Edit Role"
        description={`Update permissions for ${selectedRole?.name || "role"}`}
        onSubmit={handleEditRole}
        submitLabel="Save Changes"
        className="sm:max-w-xl"
      >
        <PermissionsEditor />
      </QuickAddSheet>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRole?.name}"? This action
              cannot be undone. Employees with this role will need to be
              reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
