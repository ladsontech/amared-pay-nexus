import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, UserCircle, Search, ShieldCheck, Pencil, Trash2 } from "lucide-react";
import { Permission, User, rolePermissions } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { demoUsers } from "@/data/demoData";
import { organizationService } from "@/services/organizationService";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

type OrgUser = User;

const LOCAL_KEY_PREFIX = "org_users_";

const getLocalKey = (orgId: string) => `${LOCAL_KEY_PREFIX}${orgId}`;

export default function OrgUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<OrgUser | null>(null);
  const [verifyOrgName, setVerifyOrgName] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPhrase, setVerifyPhrase] = useState("");

  const isManager = currentUser?.permissions?.includes("manage_team");

  const orgUsersInitial = useMemo(() => {
    const orgId = currentUser?.organizationId;
    if (!orgId) return [] as OrgUser[];
    const localKey = getLocalKey(orgId);
    const fromLocal = localStorage.getItem(localKey);
    if (fromLocal) {
      try {
        const parsed = JSON.parse(fromLocal) as OrgUser[];
        return parsed;
      } catch {
        // ignore
      }
    }
    return demoUsers.filter(u => u.organizationId === orgId);
  }, [currentUser?.organizationId]);

  useEffect(() => {
    setUsers(orgUsersInitial);
  }, [orgUsersInitial]);

  const persist = (next: OrgUser[]) => {
    if (!currentUser?.organizationId) return;
    localStorage.setItem(getLocalKey(currentUser.organizationId), JSON.stringify(next));
  };

  const handleAddOrUpdate = (payload: Partial<OrgUser>) => {
    if (!currentUser?.organizationId || !currentUser.organization) return;
    let next: OrgUser[] = [];
    if (editingUser) {
      next = users.map(u => (u.id === editingUser.id ? { ...editingUser, ...payload } as OrgUser : u));
      toast({ title: "User updated" });
    } else {
      const newUser: OrgUser = {
        id: `user-${Date.now()}`,
        name: payload.name || "",
        email: payload.email || "",
        role: (payload.role as OrgUser["role"]) || "staff",
        organizationId: currentUser.organizationId,
        organization: currentUser.organization,
        permissions: (payload.permissions as Permission[]) || [],
        department: payload.department || "",
        avatar: payload.avatar,
        position: payload.position || "",
      };
      next = [newUser, ...users];
      toast({ title: "User added" });
    }
    setUsers(next);
    persist(next);
    setOpen(false);
    setEditingUser(null);
  };

  const handleCreateStaffMember = async (payload: Partial<OrgUser>) => {
    if (!currentUser?.organizationId || !currentUser.organization) return;
    
    try {
      // If we have API integration, create via API
      const staffPayload = {
        username: payload.email?.split('@')[0] || '',
        password: 'defaultPassword123', // You might want to generate this or ask user
        first_name: payload.name?.split(' ')[0] || '',
        last_name: payload.name?.split(' ').slice(1).join(' ') || '',
        email: payload.email || '',
        phone_number: '+256700000000', // Default phone
        organization: currentUser.organizationId,
        role: payload.role === 'manager' ? 'manager' as const : 'member' as const
      };
      
      const response = await organizationService.addStaff(staffPayload);
      
      const newUser: OrgUser = {
        id: crypto.randomUUID(), // Generate temp ID since API doesn't return it
        name: `${response.first_name} ${response.last_name}`.trim(),
        email: response.email,
        role: response.role === 'manager' ? 'manager' : 'staff',
        organizationId: currentUser.organizationId,
        organization: currentUser.organization,
        permissions: (payload.permissions as Permission[]) || [],
        department: payload.department || "",
        avatar: payload.avatar,
        position: payload.position || "",
      };
      
      const next = [newUser, ...users];
      setUsers(next);
      persist(next);
      setOpen(false);
      setEditingUser(null);
      toast({ title: "Staff member created via API" });
    } catch (error) {
      console.error('API creation failed, falling back to local:', error);
      // Fallback to local creation
      handleAddOrUpdate(payload);
    }
  };
  const handleDelete = (id: string) => {
    const next = users.filter(u => u.id !== id);
    setUsers(next);
    persist(next);
    toast({ title: "User removed" });
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.position.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users and access rights for your organization</p>
        </div>
        {isManager && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditingUser(null); }}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <UserForm
              user={editingUser}
              onCancel={() => { setOpen(false); setEditingUser(null); }}
              onSave={handleAddOrUpdate}
            />
          </Dialog>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(u => (
          <Card key={u.id} className="hover:shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{u.name}</h3>
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="text-sm text-muted-foreground">
                      <span className="mr-2">{u.position}</span>
                      {u.department && <span>• {u.department}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {u.permissions.map(p => (
                        <Badge key={p} variant="secondary" className="capitalize">{p.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {isManager && (
                  <div className="flex items-center gap-2">
                    <Dialog open={open && editingUser?.id === u.id} onOpenChange={(o) => { setOpen(o); if (!o) setEditingUser(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(u)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <UserForm
                        user={editingUser}
                        onCancel={() => { setOpen(false); setEditingUser(null); }}
                        onSave={handleAddOrUpdate}
                      />
                    </Dialog>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setConfirmDeleteUser(u)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Secure Delete Verification */}
      <AlertDialog open={!!confirmDeleteUser} onOpenChange={(o) => { if (!o) { setConfirmDeleteUser(null); setVerifyOrgName(""); setVerifyEmail(""); setVerifyPhrase(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm user removal</AlertDialogTitle>
            <AlertDialogDescription>
              Please complete all verification steps to permanently remove this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Step 1: Type your organization name</p>
              <Input
                placeholder={currentUser?.organization?.name || "Organization name"}
                value={verifyOrgName}
                onChange={(e) => setVerifyOrgName(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Step 2: Type the email of the user to be removed</p>
              <Input
                placeholder={confirmDeleteUser?.email || "user@example.com"}
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Step 3: Type DELETE to confirm</p>
              <Input
                placeholder="Type DELETE"
                value={verifyPhrase}
                onChange={(e) => setVerifyPhrase(e.target.value)}
              />
            </div>
            <div className="rounded-md border p-3 text-sm bg-blue-50 border-blue-200 text-blue-800">
              This action is irreversible. The user and their demo data will be removed from your organization.
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmDeleteUser(null); setVerifyOrgName(""); setVerifyEmail(""); setVerifyPhrase(""); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={
                !confirmDeleteUser ||
                !currentUser?.organization?.name ||
                verifyOrgName.trim() !== (currentUser?.organization?.name || "") ||
                verifyEmail.trim().toLowerCase() !== (confirmDeleteUser?.email.toLowerCase() || "") ||
                verifyPhrase.trim().toUpperCase() !== "DELETE"
              }
              onClick={() => {
                if (confirmDeleteUser) {
                  handleDelete(confirmDeleteUser.id);
                }
                setConfirmDeleteUser(null);
                setVerifyOrgName("");
                setVerifyEmail("");
                setVerifyPhrase("");
              }}
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserForm({ user, onSave, onCancel }: { user: OrgUser | null; onSave: (payload: Partial<OrgUser>) => void; onCancel: () => void; }) {
  const isEdit = Boolean(user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<OrgUser["role"]>(user?.role || "staff");
  const [position, setPosition] = useState(user?.position || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [permissions, setPermissions] = useState<Permission[]>(user?.permissions || []);

  useEffect(() => {
    if (isEdit) {
      setName(user!.name);
      setEmail(user!.email);
      setRole(user!.role);
      setPosition(user!.position);
      setDepartment(user!.department || "");
      setPermissions(user!.permissions);
    }
  }, [isEdit, user]);

  const togglePermission = (p: Permission) => {
    setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const applyRoleDefaults = (nextRole: OrgUser["role"]) => {
    setRole(nextRole);
    const defaults = rolePermissions[nextRole];
    const orgScopedDefaults = defaults.filter(p => p !== 'system_admin' && p !== 'manage_organizations' && p !== 'manage_system_users' && p !== 'view_system_analytics');
    setPermissions(orgScopedDefaults as Permission[]);
  };

  const allOrgPermissions: Permission[] = [
    'approve_transactions',
    'approve_funding',
    'approve_bulk_payments',
    'approve_bank_deposits',
    'view_department_reports',
    'manage_team',
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections',
    'access_bank_deposits',
  ];

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> {isEdit ? "Edit User" : "Add User"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Finance Officer" />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Finance" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => applyRoleDefaults(v as OrgUser["role"]) }>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Permissions</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allOrgPermissions.map(p => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <Checkbox checked={permissions.includes(p)} onCheckedChange={() => togglePermission(p)} />
                <span className="capitalize">{p.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSave({ name, email, role, position, department, permissions })}
          disabled={!name || !email}
        >
          {isEdit ? "Save changes" : "Add user"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

