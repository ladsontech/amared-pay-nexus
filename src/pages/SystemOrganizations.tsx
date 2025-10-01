
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Users, Building, Wallet, Edit, MoreHorizontal, CreditCard, Ban, Trash2, CheckCircle2 } from "lucide-react";
import SystemAdminLayout from "@/components/SystemAdminLayout";
import { useToast } from "@/hooks/use-toast";

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
}

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | Organization>(null);
  const [topUpOpen, setTopUpOpen] = useState<null | Organization>(null);
  const [confirmDelete, setConfirmDelete] = useState<null | Organization>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
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
            },
            {
              id: "ORG003",
              name: "Startup Hub",
              email: "info@startuphub.com",
              status: "inactive",
              walletBalance: 15000,
              members: 12,
              createdAt: "2024-01-05T09:15:00Z",
              adminName: "Mike Johnson",
              phone: "+256712345678"
            },
            {
              id: "ORG004",
              name: "Creative Studios",
              email: "hello@creativestudios.com",
              status: "suspended",
              walletBalance: 0,
              members: 8,
              createdAt: "2024-01-03T15:45:00Z",
              adminName: "Sarah Wilson",
              phone: "+256734567890"
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrganization = (data: Partial<Organization>) => {
    const newOrg: Organization = {
      id: data.id || `ORG${(organizations.length + 1).toString().padStart(3, "0")}`,
      name: data.name || "New Organization",
      email: data.email || "contact@example.com",
      status: (data.status as Organization["status"]) || "inactive",
      walletBalance: Number(data.walletBalance) || 0,
      members: Number(data.members) || 0,
      createdAt: new Date().toISOString(),
      adminName: data.adminName || "Admin User",
      phone: data.phone || "+256700000000",
    };
    setOrganizations(prev => [newOrg, ...prev]);
    setCreateOpen(false);
    toast({ title: "Organization created", description: `${newOrg.name} added` });
  };

  const handleUpdateOrganization = (id: string, updates: Partial<Organization>) => {
    setOrganizations(prev => prev.map(org => org.id === id ? { ...org, ...updates } : org));
    setEditOpen(null);
    toast({ title: "Organization updated" });
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
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">System Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage all organizations in the system</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-sm text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {organizations.filter(org => org.status === "active").length}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {organizations.reduce((sum, org) => sum + org.walletBalance, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">System wide</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.reduce((sum, org) => sum + org.members, 0)}
              </div>
              <p className="text-sm text-muted-foreground">All organizations</p>
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
              <Card key={org.id} className="border border-slate-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>ID:</strong> {org.id}</p>
                            <p><strong>Email:</strong> {org.email}</p>
                          </div>
                          <div>
                            <p><strong>Admin:</strong> {org.adminName}</p>
                            <p><strong>Phone:</strong> {org.phone}</p>
                          </div>
                          <div>
                            <p><strong>Created:</strong> {new Date(org.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-3">
                          <div className="flex items-center space-x-1">
                            <Wallet className="h-4 w-4 text-green-600" />
                            <span className="font-medium">UGX {org.walletBalance.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{org.members} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditOpen(org)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTopUpOpen(org)}>
                            <CreditCard className="h-4 w-4 mr-2" /> Top up wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(org)}>
                            {org.status === "active" ? (
                              <Ban className="h-4 w-4 mr-2" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            {org.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setConfirmDelete(org)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
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
      </div>
      
      {/* Create Organization Dialog */}
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>Set up a new tenant organization.</DialogDescription>
        </DialogHeader>
        <OrgForm onSubmit={handleCreateOrganization} onCancel={() => setCreateOpen(false)} submitLabel="Create" />
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
          <OrgForm
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
            This action cannot be undone. This will permanently remove the organization and its demo data.
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

export default AdminOrganizations;

// ----- Forms -----
interface OrgFormProps {
  initial?: Partial<Organization>;
  submitLabel: string;
  onSubmit: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

const OrgForm = ({ initial, submitLabel, onSubmit, onCancel }: OrgFormProps) => {
  const [form, setForm] = useState<Partial<Organization>>({
    id: initial?.id || "",
    name: initial?.name || "",
    email: initial?.email || "",
    adminName: initial?.adminName || "",
    phone: initial?.phone || "",
    status: initial?.status || "active",
    walletBalance: initial?.walletBalance ?? 0,
    members: initial?.members ?? 0,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Name</label>
          <Input value={form.name as string} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input value={form.email as string} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Admin name</label>
          <Input value={form.adminName as string} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <Input value={form.phone as string} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Members</label>
          <Input type="number" value={String(form.members ?? 0)} onChange={(e) => setForm({ ...form, members: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm">Initial Wallet (UGX)</label>
          <Input type="number" value={String(form.walletBalance ?? 0)} onChange={(e) => setForm({ ...form, walletBalance: Number(e.target.value) })} />
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
        <label className="text-sm">Amount (UGX)</label>
        <Input type="number" value={String(amount)} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(amount)}>Top up</Button>
      </DialogFooter>
    </div>
  );
};
