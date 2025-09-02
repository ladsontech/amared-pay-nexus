import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, UserCircle, Mail, Phone, Building, Shield, Wallet, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserResponse, SubAdminResponse, CreateSubAdminRequest } from "@/services/userService";
import { organizationService, StaffResponse, AddStaffRequest } from "@/services/organizationService";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "manager" | "operator" | "staff";
  status: "active" | "inactive";
  organization: string;
  lastLogin: string;
  createdAt: string;
  username: string;
}

const SystemUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [subAdmins, setSubAdmins] = useState<SystemUser[]>([]);
  const [staff, setStaff] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | SystemUser>(null);
  const [confirmDelete, setConfirmDelete] = useState<null | SystemUser>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch regular users
      const usersResponse = await userService.listUsers();
      const transformedUsers: SystemUser[] = usersResponse.map((user: UserResponse) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.phone_number || '',
        role: (user.role?.toLowerCase() as SystemUser["role"]) || "staff",
        status: user.is_active ? "active" : "inactive",
        organization: user.organization?.name || "System",
        lastLogin: user.last_login || user.date_joined,
        createdAt: user.date_joined,
        username: user.username
      }));

      // Fetch sub admins
      const subAdminsResponse = await userService.listSubAdmins();
      const transformedSubAdmins: SystemUser[] = subAdminsResponse.map((subAdmin: SubAdminResponse) => ({
        id: subAdmin.id,
        name: `${subAdmin.first_name} ${subAdmin.last_name}`.trim(),
        email: subAdmin.email,
        phone: subAdmin.phone_number,
        role: "admin" as const,
        status: subAdmin.is_active ? "active" : "inactive",
        organization: "System",
        lastLogin: subAdmin.last_login || subAdmin.date_joined,
        createdAt: subAdmin.date_joined,
        username: subAdmin.username
      }));

      // Fetch organization staff
      const staffResponse = await organizationService.listStaff();
      const transformedStaff: SystemUser[] = staffResponse.map((staff: StaffResponse) => ({
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`.trim(),
        email: staff.email,
        phone: staff.phone_number,
        role: staff.role === "owner" ? "admin" : staff.role === "manager" ? "manager" : "staff",
        status: staff.is_active ? "active" : "inactive",
        organization: staff.organization.name,
        lastLogin: staff.date_joined, // API doesn't provide last_login for staff
        createdAt: staff.date_joined,
        username: staff.username
      }));

      setUsers(transformedUsers);
      setSubAdmins(transformedSubAdmins);
      setStaff(transformedStaff);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Using demo data.",
        variant: "destructive",
      });
      
      // Fallback to demo data
      setUsers([
        {
          id: "USR001",
          name: "Super Admin",
          email: "superadmin@almaredpay.com",
          phone: "+256700000000",
          role: "super_admin",
          status: "active",
          organization: "System",
          lastLogin: "2024-01-15T08:30:00Z",
          createdAt: "2024-01-01T00:00:00Z",
          username: "superadmin"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-700";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "manager":
        return "bg-blue-100 text-blue-700";
      case "operator":
      case "staff":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "operator":
        return "Operator";
      case "staff":
        return "Staff";
      default:
        return role;
    }
  };

  // Combine all users for display
  const allUsers = [...users, ...subAdmins, ...staff];

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubAdmin = async (data: CreateSubAdminRequest) => {
    try {
      setIsCreating(true);
      const response = await userService.createSubAdmin(data);
      
      const newUser: SystemUser = {
        id: response.id,
        name: `${response.first_name} ${response.last_name}`.trim(),
        email: response.email,
        phone: response.phone_number,
        role: "admin",
        status: response.is_active ? "active" : "inactive",
        organization: "System",
        lastLogin: response.date_joined,
        createdAt: response.date_joined,
        username: response.username
      };
      
      setSubAdmins(prev => [newUser, ...prev]);
      setCreateSubAdminOpen(false);
      toast({ 
        title: "Sub Admin created", 
        description: `${newUser.name} has been successfully created` 
      });
    } catch (error) {
      console.error('Error creating sub admin:', error);
      toast({
        title: "Error",
        description: "Failed to create sub admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateStaff = async (data: AddStaffRequest) => {
    try {
      setIsCreating(true);
      const response = await organizationService.addStaff(data);
      
      const newUser: SystemUser = {
        id: response.id,
        name: `${response.first_name} ${response.last_name}`.trim(),
        email: response.email,
        phone: response.phone_number,
        role: response.role === "owner" ? "admin" : response.role === "manager" ? "manager" : "staff",
        status: response.is_active ? "active" : "inactive",
        organization: response.organization.name,
        lastLogin: response.date_joined,
        createdAt: response.date_joined,
        username: response.username
      };
      
      setStaff(prev => [newUser, ...prev]);
      setCreateStaffOpen(false);
      toast({ 
        title: "Staff member created", 
        description: `${newUser.name} has been successfully added` 
      });
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        title: "Error",
        description: "Failed to create staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeposit = (userId: string) => {
    toast({
      title: "Deposit Initiated",
      description: `Deposit of UGX 50,000 has been successfully added to user ${userId}`,
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      // Find user type and delete accordingly
      const user = allUsers.find(u => u.id === userId);
      if (!user) return;

      if (subAdmins.find(u => u.id === userId)) {
        await userService.deleteSubAdmin(userId);
        setSubAdmins(prev => prev.filter(u => u.id !== userId));
      } else if (staff.find(u => u.id === userId)) {
        await organizationService.removeStaff(userId);
        setStaff(prev => prev.filter(u => u.id !== userId));
      }
      
      setConfirmDelete(null);
      toast({ title: "User deleted successfully" });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Users</h1>
            <p className="text-muted-foreground">
              Manage all users across the system
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex items-center space-x-2" onClick={() => setCreateSubAdminOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Sub Admin</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2" onClick={() => setCreateStaffOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Staff</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">{allUsers.length}</div>
              <p className="text-xs text-gray-600">System wide</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Active Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-blue-600">
                {allUsers.filter(user => user.status === "active").length}
              </div>
              <p className="text-xs text-gray-600">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Admins</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">
                {allUsers.filter(user => user.role === "admin" || user.role === "super_admin").length}
              </div>
              <p className="text-xs text-gray-600">Admin access</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Organizations</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">
                {new Set(allUsers.filter(u => u.organization !== "System").map(u => u.organization)).size}
              </div>
              <p className="text-xs text-gray-600">With users</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
            {[1, 2, 3].map((i) => (
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
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-base text-black">{user.name}</h3>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          {user.role === "super_admin" && (
                            <Badge variant="outline" className="border-red-200">
                              <Shield className="h-3 w-3 mr-1" />
                              System
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{user.phone}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{user.organization}</span>
                            </div>
                            <p className="truncate"><strong>Username:</strong> {user.username}</p>
                          </div>
                          <div>
                            <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>
                            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditOpen(user)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeposit(user.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Wallet className="h-3 w-3 mr-1" />
                        Deposit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirmDelete(user)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <UserCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No users match your search criteria." : "Create your first user to get started."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Sub Admin Dialog */}
      <Dialog open={createSubAdminOpen} onOpenChange={setCreateSubAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sub Admin</DialogTitle>
            <DialogDescription>Add a new sub administrator to the system.</DialogDescription>
          </DialogHeader>
          <SubAdminForm 
            onSubmit={handleCreateSubAdmin} 
            onCancel={() => setCreateSubAdminOpen(false)} 
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Create Staff Dialog */}
      <Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Organization Staff</DialogTitle>
            <DialogDescription>Add a new staff member to an organization.</DialogDescription>
          </DialogHeader>
          <StaffForm 
            onSubmit={handleCreateStaff} 
            onCancel={() => setCreateStaffOpen(false)} 
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the user and their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            {confirmDelete && (
              <AlertDialogAction onClick={() => handleDelete(confirmDelete.id)} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SystemUsers;

// ----- Forms -----
interface SubAdminFormProps {
  onSubmit: (data: CreateSubAdminRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SubAdminForm = ({ onSubmit, onCancel, isLoading }: SubAdminFormProps) => {
  const [form, setForm] = useState<CreateSubAdminRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "+256",
    username: "",
    password: ""
  });

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.username || !form.password) {
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>First Name *</Label>
          <Input 
            value={form.first_name} 
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input 
            value={form.last_name} 
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            placeholder="Doe"
          />
        </div>
        <div>
          <Label>Username *</Label>
          <Input 
            value={form.username} 
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="johndoe"
          />
        </div>
        <div>
          <Label>Password *</Label>
          <Input 
            type="password"
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input 
            type="email"
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <Label>Phone Number *</Label>
          <Input 
            value={form.phone_number} 
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            placeholder="+256701234567"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !form.first_name || !form.last_name || !form.email || !form.username || !form.password}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Sub Admin
        </Button>
      </DialogFooter>
    </div>
  );
};

interface StaffFormProps {
  onSubmit: (data: AddStaffRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const StaffForm = ({ onSubmit, onCancel, isLoading }: StaffFormProps) => {
  const [form, setForm] = useState<AddStaffRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "+256",
    username: "",
    password: "",
    organization: "",
    role: "member"
  });
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch organizations for the dropdown
    const fetchOrgs = async () => {
      try {
        const response = await organizationService.listOrganizations();
        setOrganizations(response.map(org => ({ id: org.id, name: org.name })));
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.username || !form.password || !form.organization) {
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>First Name *</Label>
          <Input 
            value={form.first_name} 
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            placeholder="John"
          />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input 
            value={form.last_name} 
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            placeholder="Doe"
          />
        </div>
        <div>
          <Label>Username *</Label>
          <Input 
            value={form.username} 
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="johndoe"
          />
        </div>
        <div>
          <Label>Password *</Label>
          <Input 
            type="password"
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input 
            type="email"
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <Label>Phone Number *</Label>
          <Input 
            value={form.phone_number} 
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            placeholder="+256701234567"
          />
        </div>
        <div>
          <Label>Organization *</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.organization} 
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
          >
            <option value="">Select organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Role *</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value as AddStaffRequest["role"] })}
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !form.first_name || !form.last_name || !form.email || !form.username || !form.password || !form.organization}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Staff Member
        </Button>
      </DialogFooter>
    </div>
  );
};