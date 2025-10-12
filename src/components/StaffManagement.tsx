import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, UserCircle, Mail, Phone, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, Staff, CreateStaffRequest } from "@/services/organizationService";

export const StaffManagement = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);
  const { toast } = useToast();

  const fetchStaff = async () => {
    if (!user?.organizationId) return;
    
    try {
      setIsLoading(true);
      const response = await organizationService.getStaffList({ 
        organization: user.organizationId 
      });
      setStaff(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [user?.organizationId]);

  const handleCreate = async (data: CreateStaffRequest) => {
    try {
      await organizationService.addStaff(data);
      await fetchStaff();
      toast({ 
        title: "Success", 
        description: "Staff member added successfully",
        duration: 5000
      });
      setCreateOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add staff member",
        variant: "destructive",
        duration: 5000
      });
      throw error;
    }
  };

  const handleUpdateRole = async (staffId: string, role: "owner" | "manager" | "member") => {
    try {
      await organizationService.updateStaffRole(staffId, { role });
      await fetchStaff();
      toast({ 
        title: "Success", 
        description: "Staff role updated successfully",
        duration: 5000
      });
      setEditOpen(null);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update staff role",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const handleDelete = async (staffId: string) => {
    try {
      await organizationService.deleteStaff(staffId);
      await fetchStaff();
      toast({ 
        title: "Success", 
        description: "Staff member removed successfully",
        duration: 5000
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to remove staff member",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Staff Management</h2>
            <p className="text-sm text-muted-foreground">Manage your organization's staff members and their roles</p>
          </div>
          {user?.role === 'owner' && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          )}
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
            {staff.map((member) => (
              <Card key={member.id} className="border border-slate-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {member.user.username}
                          </h3>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {member.role || 'member'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.user.phone_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {user?.role === 'owner' && member.role !== 'owner' && (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(member)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(member)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Staff Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Add a new staff member to your organization</DialogDescription>
          </DialogHeader>
          <StaffForm 
            organizationId={user?.organizationId || ''} 
            onSubmit={handleCreate} 
            onCancel={() => setCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Staff Role</DialogTitle>
            <DialogDescription>Update the role for {editOpen?.user.username}</DialogDescription>
          </DialogHeader>
          {editOpen && (
            <RoleForm 
              currentRole={editOpen.role || 'member'} 
              onSubmit={(role) => handleUpdateRole(editOpen.id, role)} 
              onCancel={() => setEditOpen(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteConfirm?.user.username} from your organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>Cancel</AlertDialogCancel>
            {deleteConfirm && (
              <AlertDialogAction 
                onClick={() => handleDelete(deleteConfirm.id)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Staff Form Component
interface StaffFormProps {
  organizationId: string;
  onSubmit: (data: CreateStaffRequest) => Promise<void>;
  onCancel: () => void;
}

const StaffForm = ({ organizationId, onSubmit, onCancel }: StaffFormProps) => {
  const [form, setForm] = useState<CreateStaffRequest>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    organization: organizationId,
    role: "member",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>First Name</Label>
          <Input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Phone Number</Label>
        <Input
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          required
          placeholder="+256700000000"
        />
      </div>
      <div>
        <Label>Username</Label>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select 
          value={form.role} 
          onValueChange={(value: "owner" | "manager" | "member") => setForm({ ...form, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Staff Member"}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Role Form Component
interface RoleFormProps {
  currentRole: string;
  onSubmit: (role: "owner" | "manager" | "member") => void;
  onCancel: () => void;
}

const RoleForm = ({ currentRole, onSubmit, onCancel }: RoleFormProps) => {
  const [role, setRole] = useState<"owner" | "manager" | "member">(currentRole as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Role</Label>
        <Select value={role} onValueChange={(v: "owner" | "manager" | "member") => setRole(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Role</Button>
      </DialogFooter>
    </form>
  );
};
