import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, UserCircle, Mail, Phone, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, SubAdminResponse, CreateSubAdminRequest } from "@/services/userService";

const SystemSubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdminResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | SubAdminResponse>(null);
  const [confirmDelete, setConfirmDelete] = useState<null | SubAdminResponse>(null);
  const { toast } = useToast();

  const fetchSubAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await userService.listSubAdmins();
      setSubAdmins(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sub-admins",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const filteredSubAdmins = subAdmins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: CreateSubAdminRequest) => {
    try {
      console.log('Creating sub-admin with data:', data);
      const result = await userService.createSubAdmin(data);
      console.log('Sub-admin created successfully:', result);
      
      // Refresh the list first
      await fetchSubAdmins();
      
      // Show success toast
      toast({ 
        title: "Success", 
        description: "Sub-admin created successfully",
        duration: 5000
      });
      
      // Close dialog
      setCreateOpen(false);
    } catch (error: any) {
      console.error('Create sub-admin error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create sub-admin",
        variant: "destructive",
        duration: 5000
      });
      throw error; // Re-throw to stop loading state
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateSubAdminRequest>) => {
    try {
      await userService.updateSubAdmin(id, data);
      toast({ title: "Success", description: "Sub-admin updated successfully" });
      setEditOpen(null);
      fetchSubAdmins();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update sub-admin", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteSubAdmin(id);
      toast({ title: "Success", description: "Sub-admin deleted successfully" });
      setConfirmDelete(null);
      fetchSubAdmins();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete sub-admin", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Sub-Admins</h1>
            <p className="text-sm text-muted-foreground">Manage sub-administrators who can manage organizations</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Sub-Admin</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <Card className="border border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-base lg:text-lg">Total Sub-Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{subAdmins.length}</div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-base lg:text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {subAdmins.filter(admin => admin.is_active).length}
              </div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-base lg:text-lg">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                {subAdmins.filter(admin => !admin.is_active).length}
              </div>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Inactive accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sub-admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
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
          <Card className="border border-slate-100 bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {filteredSubAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {`${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.username}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge className={admin.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} variant="outline">
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="border-purple-200 hidden sm:inline-flex">
                          <Shield className="h-3 w-3 mr-1" />
                          Sub-Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sub-Admin</DialogTitle>
            <DialogDescription>Add a new sub-administrator to manage organizations.</DialogDescription>
          </DialogHeader>
          <SubAdminForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sub-Admin</DialogTitle>
            <DialogDescription>Update sub-administrator details.</DialogDescription>
          </DialogHeader>
          {editOpen && (
            <SubAdminForm 
              initial={editOpen} 
              onSubmit={(data) => handleUpdate(editOpen.id, data)} 
              onCancel={() => setEditOpen(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the sub-admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            {confirmDelete && (
              <AlertDialogAction 
                onClick={() => handleDelete(confirmDelete.id)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SystemSubAdmins;

// Sub-Admin Form Component
interface SubAdminFormProps {
  initial?: Partial<CreateSubAdminRequest>;
  onSubmit: (data: CreateSubAdminRequest) => void;
  onCancel: () => void;
}

const SubAdminForm = ({ initial, onSubmit, onCancel }: SubAdminFormProps) => {
  const [form, setForm] = useState<CreateSubAdminRequest>({
    first_name: initial?.first_name || "",
    last_name: initial?.last_name || "",
    email: initial?.email || "",
    phone_number: initial?.phone_number || "",
    username: initial?.username || "",
    password: initial?.password || "",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        />
      </div>
      <div>
        <Label>Username (Optional)</Label>
        <Input
          value={form.username || ''}
          onChange={(e) => setForm({ ...form, username: e.target.value || undefined })}
          placeholder="Leave empty to auto-generate"
        />
        <p className="text-xs text-muted-foreground mt-1">
          If not provided, username will be generated automatically
        </p>
      </div>
      {!initial && (
        <div>
          <Label>Password *</Label>
          <Input
            type="password"
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            maxLength={40}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must be between 8 and 40 characters
          </p>
        </div>
      )}
      {initial && (
        <div>
          <Label>Password (Optional)</Label>
          <Input
            type="password"
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value || undefined })}
            minLength={8}
            maxLength={40}
            placeholder="Leave empty to keep current password"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Only enter if you want to change the password (8-40 characters)
          </p>
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (initial ? "Updating..." : "Creating...") : (initial ? "Update" : "Create")}
        </Button>
      </DialogFooter>
    </form>
  );
};
