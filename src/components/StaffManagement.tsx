import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, UserCircle, Mail, Phone, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, Staff } from "@/services/organizationService";
import { StaffCreationForm } from "@/components/StaffCreationForm";

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
          {(user?.role === 'owner' || user?.isSuperuser) && (
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
                    {(user?.role === 'owner' || user?.isSuperuser) && (
                      <div className="flex items-center space-x-2">
                        {(member.role !== 'owner' || user?.isSuperuser) && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setEditOpen(member)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Change Role
                            </Button>
                            {member.role !== 'owner' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeleteConfirm(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </>
                        )}
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
      <StaffCreationForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          fetchStaff(); // Refresh staff list after successful creation
        }}
      />

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
              isSuperuser={user?.isSuperuser === true || user?.role === 'owner'}
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

// Role Form Component
interface RoleFormProps {
  currentRole: string;
  onSubmit: (role: "owner" | "manager" | "member") => void;
  onCancel: () => void;
  isSuperuser?: boolean; // true if user is superuser OR has owner role (including during impersonation)
}

const RoleForm = ({ currentRole, onSubmit, onCancel, isSuperuser }: RoleFormProps) => {
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
            {isSuperuser && <SelectItem value="owner">Owner</SelectItem>}
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
