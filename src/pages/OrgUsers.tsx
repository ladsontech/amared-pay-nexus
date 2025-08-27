import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Permission, UserRole } from "@/types/auth";
import { demoUsers } from "@/data/demoData";
import { Plus, Search, Filter, UserCircle, Mail, Shield, Trash2, Edit } from "lucide-react";

type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
};

const allPermissions: Permission[] = [
  "approve_transactions",
  "approve_funding",
  "approve_bulk_payments",
  "approve_bank_deposits",
  "view_department_reports",
  "manage_team",
  "submit_transactions",
  "request_funding",
  "view_own_history",
  "access_petty_cash",
  "access_bulk_payments",
  "access_collections",
  "access_bank_deposits",
  // system_* omitted intentionally for org scope
];

const roleLabel = (role: UserRole) =>
  role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Staff";

export default function OrgUsers() {
  const { user: currentUser, hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<OrgUser[]>([]);

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);

  // Add form state
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: UserRole; permissions: Permission[] }>(
    { name: "", email: "", role: "staff", permissions: ["submit_transactions", "view_own_history", "access_petty_cash"] }
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const orgId = currentUser?.organizationId;
      const initial = demoUsers
        .filter(u => u.organizationId === orgId)
        .map<OrgUser>(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, permissions: u.permissions }));
      setUsers(initial);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentUser?.organizationId]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleAdd = () => {
    if (!hasPermission("manage_team")) {
      toast({ title: "Forbidden", description: "You don't have permission to manage users.", variant: "destructive" });
      return;
    }
    if (!newUser.name || !newUser.email) {
      toast({ title: "Missing info", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    const created: OrgUser = {
      id: `tmp-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: Array.from(new Set(newUser.permissions)),
    };
    setUsers(prev => [created, ...prev]);
    setIsAddOpen(false);
    setNewUser({ name: "", email: "", role: "staff", permissions: ["submit_transactions", "view_own_history", "access_petty_cash"] });
    toast({ title: "User added", description: `${created.name} has been added.` });
  };

  const openEdit = (u: OrgUser) => {
    setSelectedUser(u);
    setIsEditOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    if (!hasPermission("manage_team")) {
      toast({ title: "Forbidden", description: "You don't have permission to manage users.", variant: "destructive" });
      return;
    }
    setUsers(prev => prev.map(u => (u.id === selectedUser.id ? selectedUser : u)));
    setIsEditOpen(false);
    toast({ title: "Permissions updated", description: `Updated access for ${selectedUser.name}.` });
  };

  const handleRemove = (id: string) => {
    if (!hasPermission("manage_team")) {
      toast({ title: "Forbidden", description: "You don't have permission to remove users.", variant: "destructive" });
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: "User removed", description: "The user has been removed from the organization." });
  };

  const permissionChecked = (perm: Permission) => selectedUser?.permissions.includes(perm) ?? false;

  const togglePermission = (perm: Permission, checked: boolean | "indeterminate") => {
    if (!selectedUser) return;
    setSelectedUser({
      ...selectedUser,
      permissions: checked
        ? Array.from(new Set([...selectedUser.permissions, perm]))
        : selectedUser.permissions.filter(p => p !== perm)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage organization users, roles and access</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground">In this organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "manager").length}</div>
            <p className="text-sm text-muted-foreground">With approval rights</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{users.filter(u => u.role === "staff").length}</div>
            <p className="text-sm text-muted-foreground">General team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((u) => (
            <Card key={u.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{u.name}</h3>
                        <Badge className={getRoleBadgeClass(u.role)}>{roleLabel(u.role)}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>{u.permissions.length} permissions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemove(u.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a new user for this organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>Update access rights for the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPermissions.map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={permissionChecked(perm)}
                      onCheckedChange={(c) => togglePermission(perm, c)}
                    />
                    <span className="capitalize">{perm.replaceAll('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

