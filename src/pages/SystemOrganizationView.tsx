import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building, Wallet, Users, Mail, Phone, Shield, Calendar, LogIn, Edit, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, Organization, Staff, Wallet as WalletType, WalletTransaction } from "@/services/organizationService";

const SystemOrganizationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { impersonateOrganization } = useAuth();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrganizationData();
    }
  }, [id]);

  const fetchOrganizationData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch organization details
      const orgData = await organizationService.getOrganization(id);
      setOrganization(orgData);

      // Fetch staff members
      const staffData = await organizationService.getStaffList({ organization: id });
      setStaff(staffData.results);

      // Fetch wallet
      const walletsData = await organizationService.getWallets({ organization: id });
      if (walletsData.results.length > 0) {
        const walletData = walletsData.results[0];
        setWallet(walletData);

        // Fetch wallet transactions
        const txData = await organizationService.getWalletTransactions({ wallet: walletData.id });
        setTransactions(txData.results);
      }
    } catch (error: any) {
      console.error("Error fetching organization data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "owner": return "bg-purple-100 text-purple-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "member": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "owner": return <Shield className="h-4 w-4" />;
      case "manager": return <Users className="h-4 w-4" />;
      case "member": return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Organization not found</h2>
          <Button onClick={() => navigate("/system/organizations")}>
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (data: { name: string; address?: string; company_reg_id?: string; tin?: string }) => {
    if (!organization) return;
    
    try {
      const updatedOrg = await organizationService.updateOrganization(organization.id, data);
      setOrganization(updatedOrg);
      toast({ title: "Success", description: "Organization updated successfully" });
      setEditOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update organization", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async () => {
    if (!organization) return;
    
    try {
      setIsDeleting(true);
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`https://bulksrv.almaredagencyuganda.com/organizations/org/${organization.id}/`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Delete endpoint not available or failed');
      }

      toast({ title: "Success", description: "Organization deleted successfully" });
      setDeleteOpen(false);
      navigate("/system/organizations");
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete organization. The delete endpoint may not be available.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header Section - App-like Mobile Design */}
      <div className="space-y-4">
        {/* Mobile Header - Clean App Design */}
        <div className="sm:hidden space-y-4">
          {/* Top Navigation Bar */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
              onClick={() => navigate("/system/organizations")}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{organization.name}</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4 text-gray-700" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 text-xs font-medium">
              Active
            </Badge>
            <p className="text-xs text-gray-500">View and manage organization details</p>
          </div>

          {/* Primary Action Button - App Style */}
          <Button 
            variant="default" 
            size="lg" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg rounded-xl"
            onClick={async () => {
              try {
                if (!organization?.id || !organization?.name) {
                  throw new Error('Invalid organization data');
                }

                console.log('Starting impersonation for:', organization.id, organization.name);
                await impersonateOrganization(organization.id, organization.name);
                
                const impersonating = localStorage.getItem('impersonating');
                const storedUser = localStorage.getItem('user');
                
                if (impersonating !== 'true' || !storedUser) {
                  throw new Error('Failed to set impersonation state');
                }

                console.log('Impersonation state set, redirecting...');
                
                toast({
                  title: "Impersonating Organization",
                  description: `Now viewing as ${organization.name}. You can make changes just like the organization owner.`,
                });

                await new Promise(resolve => setTimeout(resolve, 300));
                window.location.href = "/org/dashboard";
              } catch (error) {
                console.error("Error during impersonation:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to impersonate organization";
                toast({
                  title: "Error",
                  description: errorMessage + ". Please try again.",
                  variant: "destructive",
                  duration: 5000,
                });
              }
            }}
          >
            <LogIn className="h-5 w-5 mr-2" />
            Login as Organization
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="outline" size="sm" onClick={() => navigate("/system/organizations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">{organization.name}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-slate-100 flex-shrink-0"
                onClick={() => setEditOpen(true)}
                title="Edit organization"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">View and manage organization details</p>
            </div>
          </div>
          
          {/* Desktop Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs sm:text-sm"
              onClick={async () => {
                try {
                  if (!organization?.id || !organization?.name) {
                    throw new Error('Invalid organization data');
                  }

                  console.log('Starting impersonation for:', organization.id, organization.name);
                  await impersonateOrganization(organization.id, organization.name);
                  
                  const impersonating = localStorage.getItem('impersonating');
                  const storedUser = localStorage.getItem('user');
                  
                  if (impersonating !== 'true' || !storedUser) {
                    throw new Error('Failed to set impersonation state');
                  }

                  console.log('Impersonation state set, redirecting...');
                  
                  toast({
                    title: "Impersonating Organization",
                    description: `Now viewing as ${organization.name}. You can make changes just like the organization owner.`,
                  });

                  await new Promise(resolve => setTimeout(resolve, 300));
                  window.location.href = "/org/dashboard";
                } catch (error) {
                  console.error("Error during impersonation:", error);
                  const errorMessage = error instanceof Error ? error.message : "Failed to impersonate organization";
                  toast({
                    title: "Error",
                    description: errorMessage + ". Please try again.",
                    variant: "destructive",
                    duration: 5000,
                  });
                }
              }}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login as Organization
            </Button>
            <Badge className="bg-green-100 text-green-800 w-fit">Active</Badge>
          </div>
        </div>
      </div>

      {/* Organization Details Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{staff.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {wallet?.currency?.symbol || ''} {wallet?.balance?.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{wallet?.currency?.name || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{transactions.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Status</CardTitle>
            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">Active</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs sm:text-sm py-2">Staff ({staff.length})</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">Transactions ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
                  <p className="text-sm font-mono">{organization.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company Registration ID</p>
                  <p className="text-sm">{organization.company_reg_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TIN</p>
                  <p className="text-sm">{organization.tin || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">{organization.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{new Date(organization.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {wallet && (
            <Card className="border border-slate-100 bg-white">
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Balance</p>
                    <p className="text-lg font-bold">{wallet.currency.symbol} {wallet.balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Currency</p>
                    <p className="text-sm">{wallet.currency.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PIN Set</p>
                    <Badge className={wallet.is_pin_set ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {wallet.is_pin_set ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{new Date(wallet.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No staff members found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Email</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm">Role</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{member.user.username}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-1 min-w-0">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="break-all">{member.user.email}</span>
                              </div>
                              {member.user.is_email_verified && (
                                <Badge variant="outline" className="text-xs w-fit">Verified</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-1">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span>{member.user.phone_number}</span>
                              </div>
                              {member.user.is_phone_verified && (
                                <Badge variant="outline" className="text-xs w-fit">Verified</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge className={getRoleColor(member.role)}>
                              <div className="flex items-center space-x-1">
                                {getRoleIcon(member.role)}
                                <span>{member.role || 'member'}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transactions found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Title</TableHead>
                        <TableHead className="text-xs sm:text-sm">Type</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Currency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs sm:text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{tx.title || 'N/A'}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge className={tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-xs sm:text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'} {tx.currency.symbol} {tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{tx.currency.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Button at Bottom */}
      <div className="pt-4 border-t border-slate-200">
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full sm:w-auto text-xs sm:text-sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Organization
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details.</DialogDescription>
          </DialogHeader>
          {organization && (
            <OrgEditForm 
              initial={organization} 
              onSubmit={handleUpdate} 
              onCancel={() => setEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{organization?.name}"? This action cannot be undone and will permanently remove the organization and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Edit Form Component
interface OrgEditFormProps {
  initial: Organization;
  onSubmit: (data: { name: string; address?: string; company_reg_id?: string; tin?: string }) => void;
  onCancel: () => void;
}

const OrgEditForm = ({ initial, onSubmit, onCancel }: OrgEditFormProps) => {
  const [form, setForm] = useState({
    name: initial.name,
    address: initial.address || "",
    company_reg_id: initial.company_reg_id || "",
    tin: initial.tin || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Organization Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div>
        <Label>Company Registration ID</Label>
        <Input value={form.company_reg_id} onChange={(e) => setForm({ ...form, company_reg_id: e.target.value })} />
      </div>
      <div>
        <Label>TIN</Label>
        <Input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};

export default SystemOrganizationView;
