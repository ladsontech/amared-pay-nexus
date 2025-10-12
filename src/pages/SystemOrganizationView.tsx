import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building, Wallet, Users, Mail, Phone, Shield, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationService, Organization, Staff, Wallet as WalletType, WalletTransaction } from "@/services/organizationService";

const SystemOrganizationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/system/organizations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{organization.name}</h1>
            <p className="text-sm text-muted-foreground">View and manage organization details</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">Active</Badge>
      </div>

      {/* Organization Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet?.currency?.symbol || ''} {wallet?.balance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">{wallet?.currency?.name || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Members ({staff.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.user.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{member.user.email}</span>
                            {member.user.is_email_verified && (
                              <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{member.user.phone_number}</span>
                            {member.user.is_phone_verified && (
                              <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(member.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span>{member.role || 'member'}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{tx.title || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'credit' ? '+' : '-'} {tx.currency.symbol} {tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{tx.currency.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemOrganizationView;
