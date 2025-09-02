import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Users, Building, Wallet, Edit, MoreHorizontal, CreditCard, Ban, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationService, CreateOrganizationRequest, OrganizationResponse } from "@/services/organizationService";

interface Organization {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  walletBalance: number;
  members: number;
  createdAt: string;
  adminName: string;
  phone: string;
  address?: string;
  company_reg_id?: string;
  tin?: string;
}

const SystemOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | Organization>(null);
  const [topUpOpen, setTopUpOpen] = useState<null | Organization>(null);
  const [confirmDelete, setConfirmDelete] = useState<null | Organization>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationService.listOrganizations();
      
      // Transform API response to match our interface
      const transformedOrgs: Organization[] = response.map((org: OrganizationResponse) => ({
        id: org.id,
        name: org.name,
        email: org.owner?.email || '',
        status: "active" as const, // Default to active, you might want to add status field to API
        walletBalance: org.wallet?.balance || 0,
        members: org.staff_count || 0,
        createdAt: org.created_at,
        adminName: org.owner ? `${org.owner.first_name} ${org.owner.last_name}`.trim() : '',
        phone: org.owner?.phone_number || '',
        address: org.address,
        company_reg_id: org.company_reg_id,
        tin: org.tin
      }));
      
      setOrganizations(transformedOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations. Using demo data.",
        variant: "destructive",
      });
      
      // Fallback to demo data
      setOrganizations([
        {
          id: "ORG001",
          name: "Tech Solutions Ltd",
          email: "admin@techsolutions.com",
          status: "active",
          walletBalance: 125000,
          members: 45,
          createdAt: "2024-01-10T10:30:00Z",
          adminName: "John Doe",
          phone: "+256701234567"
        },
        {
          id: "ORG002",
          name: "Digital Agency Inc",
          email: "contact@digitalagency.com",
          status: "active",
          walletBalance: 85000,
          members: 28,
          createdAt: "2024-01-08T14:20:00Z",
          adminName: "Jane Smith",
          phone: "+256789012345"
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
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrganization = async (data: CreateOrganizationRequest) => {
    try {
      setIsCreating(true);
      const response = await organizationService.createOrganization(data);
      
      // Add new organization to the list
      const newOrg: Organization = {
        id: response.id,
        name: response.name,
        email: data.email,
        status: "active",
        walletBalance: response.wallet?.balance || 0,
        members: 1, // Owner is the first member
        createdAt: response.created_at,
        adminName: `${data.first_name} ${data.last_name}`.trim(),
        phone: data.phone_number,
        address: response.address,
        company_reg_id: response.company_reg_id,
        tin: response.tin
      };
      
      setOrganizations(prev => [newOrg, ...prev]);
      setCreateOpen(false);
      toast({ 
        title: "Organization created", 
        description: `${newOrg.name} has been successfully created` 
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      if (updates.name || updates.address || updates.company_reg_id || updates.tin) {
        const updatePayload = {
          name: updates.name || organizations.find(o => o.id === id)?.name || '',
          address: updates.address || organizations.find(o => o.id === id)?.address || '',
          company_reg_id: updates.company_reg_id || organizations.find(o => o.id === id)?.company_reg_id || '',
          tin: updates.tin || organizations.find(o => o.id === id)?.tin || ''
        };
        
        await organizationService.updateOrganization(id, updatePayload);
      }
      
      setOrganizations(prev => prev.map(org => org.id === id ? { ...org, ...updates } : org));
      setEditOpen(null);
      toast({ title: "Organization updated" });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = (org: Organization) => {
    const nextStatus: Organization["status"] = org.status === "active" ? "suspended" : "active";
    setOrganizations(prev => prev.map(o => o.id === org.id ? { ...o, status: nextStatus } : o));
    toast({ title: `Status changed`, description: `${org.name} is now ${nextStatus}` });
  };

  const handleTopUp = (orgId: string, amount: number) => {
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, walletBalance: o.walletBalance + amount } : o));
    setTopUpOpen(null);
    toast({ title: "Wallet topped up", description: `UGX ${amount.toLocaleString()}` });
  };

  const handleDelete = (orgId: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== orgId));
    setConfirmDelete(null);
    toast({ title: "Organization deleted" });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Organizations</h1>
            <p className="text-muted-foreground">
              Manage all organizations in the system
            </p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">{organizations.length}</div>
              <p className="text-xs text-gray-600">Registered</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Active</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-blue-600">
                {organizations.filter(org => org.status === "active").length}
              </div>
              <p className="text-xs text-gray-600">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Total Balance</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">
                {(organizations.reduce((sum, org) => sum + org.walletBalance, 0) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-600">UGX system wide</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-black">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-lg font-bold text-black">
                {organizations.reduce((sum, org) => sum + org.members, 0)}
              </div>
              <p className="text-xs text-gray-600">All organizations</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search organizations..."
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
          <div className="grid grid-cols-1 gap-4">
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
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-base text-black">{org.name}</h3>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <p className="truncate"><strong>ID:</strong> {org.id}</p>
                            <p className="truncate"><strong>Email:</strong> {org.email}</p>
                          </div>
                          <div>
                            <p className="truncate"><strong>Admin:</strong> {org.adminName}</p>
                            <p className="truncate"><strong>Phone:</strong> {org.phone}</p>
                          </div>
                          <div>
                            <p><strong>Created:</strong> {new Date(org.createdAt).toLocaleDateString()}</p>
                            {org.address && <p className="truncate"><strong>Address:</strong> {org.address}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Wallet className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-xs">{(org.walletBalance / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-xs">{org.members}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditOpen(org)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTopUpOpen(org)}>
                            <CreditCard className="h-3 w-3 mr-2" /> Top up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(org)}>
                            {org.status === "active" ? (
                              <Ban className="h-3 w-3 mr-2" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-2" />
                            )}
                            {org.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setConfirmDelete(org)}>
                            <Trash2 className="h-3 w-3 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredOrganizations.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No organizations found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No organizations match your search criteria." : "Create your first organization to get started."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Organization Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>Set up a new organization with an admin user.</DialogDescription>
          </DialogHeader>
          <OrgForm 
            onSubmit={handleCreateOrganization} 
            onCancel={() => setCreateOpen(false)} 
            submitLabel="Create Organization"
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details.</DialogDescription>
          </DialogHeader>
          {editOpen && (
            <OrgEditForm
              initial={editOpen}
              onSubmit={(data) => handleUpdateOrganization(editOpen.id, data)}
              onCancel={() => setEditOpen(null)}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Top-up Dialog */}
      <Dialog open={!!topUpOpen} onOpenChange={(o) => !o && setTopUpOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top up wallet</DialogTitle>
            <DialogDescription>Increase organization wallet balance.</DialogDescription>
          </DialogHeader>
          {topUpOpen && (
            <TopUpForm
              org={topUpOpen}
              onSubmit={(amount) => handleTopUp(topUpOpen.id, amount)}
              onCancel={() => setTopUpOpen(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the organization and all its data.
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

export default SystemOrganizations;

// ----- Forms -----
interface OrgFormProps {
  submitLabel: string;
  onSubmit: (data: CreateOrganizationRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const OrgForm = ({ submitLabel, onSubmit, onCancel, isLoading }: OrgFormProps) => {
  const [form, setForm] = useState<CreateOrganizationRequest>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "+256",
    org_name: "",
    address: "",
    company_reg_id: "",
    tin: "",
    wallet_currency: 1, // Default to UGX
    wallet_pin: ""
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!form.org_name || !form.email || !form.first_name || !form.last_name || !form.username || !form.password) {
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Organization Name *</Label>
          <Input 
            value={form.org_name} 
            onChange={(e) => setForm({ ...form, org_name: e.target.value })}
            placeholder="Tech Solutions Ltd"
          />
        </div>
        <div>
          <Label>Address *</Label>
          <Input 
            value={form.address} 
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Business Street, Kampala"
          />
        </div>
        <div>
          <Label>Company Registration ID</Label>
          <Input 
            value={form.company_reg_id} 
            onChange={(e) => setForm({ ...form, company_reg_id: e.target.value })}
            placeholder="REG123456"
          />
        </div>
        <div>
          <Label>TIN Number</Label>
          <Input 
            value={form.tin} 
            onChange={(e) => setForm({ ...form, tin: e.target.value })}
            placeholder="TIN123456789"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Admin User Details</h3>
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
              placeholder="john@techsolutions.com"
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
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Wallet Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Wallet Currency</Label>
            <Input 
              type="number"
              value={form.wallet_currency} 
              onChange={(e) => setForm({ ...form, wallet_currency: parseInt(e.target.value) || 1 })}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground mt-1">1 = UGX, 2 = USD</p>
          </div>
          <div>
            <Label>Wallet PIN *</Label>
            <Input 
              type="password"
              maxLength={4}
              value={form.wallet_pin} 
              onChange={(e) => setForm({ ...form, wallet_pin: e.target.value })}
              placeholder="1234"
            />
            <p className="text-xs text-muted-foreground mt-1">4-digit PIN for wallet access</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !form.org_name || !form.email || !form.first_name || !form.last_name || !form.username || !form.password}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
};

interface OrgEditFormProps {
  initial: Organization;
  submitLabel: string;
  onSubmit: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

const OrgEditForm = ({ initial, submitLabel, onSubmit, onCancel }: OrgEditFormProps) => {
  const [form, setForm] = useState<Partial<Organization>>({
    name: initial.name,
    address: initial.address,
    company_reg_id: initial.company_reg_id,
    tin: initial.tin,
    adminName: initial.adminName,
    phone: initial.phone,
    email: initial.email,
    members: initial.members,
    walletBalance: initial.walletBalance,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Organization Name</Label>
          <Input value={form.name as string} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address as string} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <Label>Company Registration ID</Label>
          <Input value={form.company_reg_id as string} onChange={(e) => setForm({ ...form, company_reg_id: e.target.value })} />
        </div>
        <div>
          <Label>TIN Number</Label>
          <Input value={form.tin as string} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
        </div>
        <div>
          <Label>Admin Name</Label>
          <Input value={form.adminName as string} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone as string} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(form)}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );
};

interface TopUpFormProps {
  org: Organization;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

const TopUpForm = ({ org, onSubmit, onCancel }: TopUpFormProps) => {
  const [amount, setAmount] = useState<number>(50000);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Current balance: UGX {org.walletBalance.toLocaleString()}</p>
      <div>
        <Label>Amount (UGX)</Label>
        <Input type="number" value={String(amount)} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(amount)}>Top up</Button>
      </DialogFooter>
    </div>
  );
};