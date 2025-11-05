import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Banknote, Search, Filter, Download, Eye, AlertCircle, Check, FileText, History, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/hooks/useOrganization";

interface BankDeposit {
  id: string;
  amount: number;
  bankAccount: string;
  depositType: "cash" | "check" | "transfer";
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  description: string;
  requestedBy: string;
}

interface DepositApproval {
  id: string;
  requester: string;
  amount: number;
  depositType: string;
  bankAccount: string;
  description: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
  urgency: "low" | "medium" | "high";
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

const OrgDeposits = () => {
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "deposit";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);
  const [approvals, setApprovals] = useState<DepositApproval[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    amount: 0,
    bankAccount: "",
    depositType: "cash" as "cash" | "check" | "transfer",
    description: "",
  });
  const { toast } = useToast();
  const { wallets } = useOrganization();

  // Fetch bank accounts from organization settings
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!user?.organizationId) return;
      
      try {
        // Fetch organization details to get bank accounts
        const org = await organizationService.getOrganization(user.organizationId);
        // For now, we'll use mock bank accounts structure
        // In production, this would come from the organization's bank account settings
        setBankAccounts([
          {
            id: "bank-1",
            bankName: "Stanbic Bank",
            accountNumber: "***4567",
            accountName: org.name || "Organization Account",
            isDefault: true,
          },
          {
            id: "bank-2",
            bankName: "Centenary Bank",
            accountNumber: "***8901",
            accountName: org.name || "Organization Account",
            isDefault: false,
          },
        ]);
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
      }
    };

    fetchBankAccounts();
  }, [user?.organizationId]);

  // Fetch deposits - using wallet transactions as deposit records
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!user?.organizationId) return;

      try {
        setIsLoading(true);
        // Fetch wallet transactions that represent deposits
        const response = await organizationService.getWalletTransactions({
          organization: user.organizationId,
          limit: 100,
        });

        // Filter and map transactions to deposits
        // Assuming deposits are credit transactions with specific titles
        const depositTransactions = response.results
          .filter((tx: any) => tx.type === "credit" && tx.title?.toLowerCase().includes("deposit"))
          .map((tx: any, index: number) => ({
            id: tx.id || `DEP${String(index + 1).padStart(3, "0")}`,
            amount: tx.amount,
            bankAccount: bankAccounts[0]?.bankName ? `${bankAccounts[0].bankName} - ${bankAccounts[0].accountNumber}` : "Bank Account",
            depositType: "transfer" as const,
            status: "completed" as const,
            createdAt: tx.created_at,
            description: tx.title || "Bank deposit",
            requestedBy: user?.name || "User",
          }));

        setDeposits(depositTransactions);

        // If user has permission, fetch approvals
        if (hasPermission("approve_bank_deposits")) {
          // For now, approvals are shown from pending deposits
          // In production, this would come from a dedicated approvals endpoint
          const pendingDeposits = depositTransactions
            .filter((d: BankDeposit) => d.status === "pending")
            .map((d: BankDeposit, index: number) => ({
              id: d.id,
              requester: d.requestedBy,
              amount: d.amount,
              depositType: d.depositType.charAt(0).toUpperCase() + d.depositType.slice(1),
              bankAccount: d.bankAccount,
              description: d.description,
              requestedDate: d.createdAt,
              status: "pending" as const,
              urgency: index === 0 ? "high" as const : "medium" as const,
            }));
          setApprovals(pendingDeposits);
        }
      } catch (error: any) {
        console.error("Error fetching deposits:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load deposits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [user?.organizationId, bankAccounts, hasPermission, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepositTypeColor = (type: string) => {
    switch (type) {
      case "cash":
        return "bg-green-50 text-green-700 border-green-200";
      case "check":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "transfer":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredDeposits = deposits.filter(
    (deposit) => {
      const matchesSearch = 
        deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const handleCreateDeposit = async () => {
    if (!newDeposit.amount || !newDeposit.bankAccount || !newDeposit.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user?.organizationId) {
      toast({
        title: "Error",
        description: "Organization ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a wallet transaction representing the deposit request
      // In production, this would call a dedicated bank deposit API endpoint
      // For now, we'll simulate the creation by adding it to the local state
      // TODO: Replace with actual API call when bank deposit endpoint is available
      const mainWallet = wallets.find((w) => !w.petty_cash_wallet);
      if (!mainWallet) {
        throw new Error("No main wallet found");
      }

      // Simulate API call - in production, this would be:
      // await organizationService.createBankDeposit({
      //   organization: user.organizationId,
      //   amount: newDeposit.amount,
      //   bank_account: newDeposit.bankAccount,
      //   deposit_type: newDeposit.depositType,
      //   description: newDeposit.description,
      // });
      
      // Add to local state for immediate feedback
      const newDepositRecord: BankDeposit = {
        id: `DEP${String(deposits.length + 1).padStart(3, "0")}`,
        amount: newDeposit.amount,
        bankAccount: bankAccounts.find(a => a.id === newDeposit.bankAccount)?.bankName 
          ? `${bankAccounts.find(a => a.id === newDeposit.bankAccount)?.bankName} - ${bankAccounts.find(a => a.id === newDeposit.bankAccount)?.accountNumber}`
          : "Bank Account",
        depositType: newDeposit.depositType,
        status: "pending",
        createdAt: new Date().toISOString(),
        description: newDeposit.description,
        requestedBy: user?.name || "User",
      };
      setDeposits([newDepositRecord, ...deposits]);

      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted for approval",
      });

      // Reset form and close dialog
      setNewDeposit({
        amount: 0,
        bankAccount: "",
        depositType: "cash",
        description: "",
      });
      setIsDepositDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating deposit:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit deposit request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === depositId
            ? { ...approval, status: "approved" as const }
            : approval
        )
      );
      toast({
        title: "Deposit Approved",
        description: `Deposit ${depositId} has been approved successfully`,
      });
      // In production, this would call an API to approve the deposit
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve deposit",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      setApprovals((prev) =>
        prev.map((approval) =>
          approval.id === depositId
            ? { ...approval, status: "rejected" as const }
            : approval
        )
      );
      toast({
        title: "Deposit Rejected",
        description: `Deposit ${depositId} has been rejected`,
        variant: "destructive",
      });
      // In production, this would call an API to reject the deposit
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject deposit",
        variant: "destructive",
      });
    }
  };

  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const processedApprovals = approvals.filter((approval) => approval.status !== "pending");

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Bank Deposits" 
        subtitle="Manage and track your bank deposit transactions"
        rightSlot={
          <Button 
            onClick={() => setIsDepositDialogOpen(true)} 
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Deposit to Bank
          </Button>
        }
      />

      <Tabs 
        value={activeTab} 
        onValueChange={(val) => { 
          setActiveTab(val); 
          setSearchParams(prev => { 
            const p = new URLSearchParams(prev); 
            p.set('tab', val); 
            return p; 
          }); 
        }} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto gap-1 sm:gap-0">
          <TabsTrigger value="deposit" className="text-xs sm:text-sm">Deposit to Bank</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
        </TabsList>

        {/* Deposit to Bank Tab */}
        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Create Bank Deposit
              </CardTitle>
              <CardDescription>
                Submit a new bank deposit request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Deposit Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={newDeposit.amount || ""}
                    onChange={(e) => setNewDeposit({...newDeposit, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositType">Deposit Type *</Label>
                  <Select 
                    value={newDeposit.depositType} 
                    onValueChange={(value: "cash" | "check" | "transfer") => setNewDeposit({...newDeposit, depositType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Deposit</SelectItem>
                      <SelectItem value="check">Check Deposit</SelectItem>
                      <SelectItem value="transfer">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account *</Label>
                <Select 
                  value={newDeposit.bankAccount} 
                  onValueChange={(value) => setNewDeposit({...newDeposit, bankAccount: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter deposit description..."
                  value={newDeposit.description}
                  onChange={(e) => setNewDeposit({...newDeposit, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateDeposit} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Submit Deposit Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab (includes approvals) */}
        <TabsContent value="history" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search deposits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Approvals Section (if user has permission) */}
          {hasPermission("approve_bank_deposits") && pendingApprovals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Pending Approvals</CardTitle>
                <CardDescription>Deposit requests awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <Card key={approval.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm sm:text-base">{approval.id}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Requested by: <span className="font-medium">{approval.requester}</span>
                          </p>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">Amount:</span> UGX {approval.amount.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">Bank Account:</span> {approval.bankAccount}
                          </p>
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">Description:</span> {approval.description}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Requested: {new Date(approval.requestedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(approval.id)}
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(approval.id)}
                            size="sm"
                            className="text-xs sm:text-sm"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Deposits List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDeposits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDeposits.map((deposit) => (
                <Card key={deposit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">{deposit.id}</CardTitle>
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{deposit.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Amount</span>
                        <span className="text-sm sm:text-base font-medium">UGX {deposit.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Bank Account</span>
                        <span className="text-sm sm:text-base font-medium">{deposit.bankAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Type</span>
                        <Badge className={getDepositTypeColor(deposit.depositType)} variant="outline">
                          {deposit.depositType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Requested By</span>
                        <span className="text-sm sm:text-base font-medium">{deposit.requestedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Created</span>
                        <span className="text-sm sm:text-base font-medium">
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <div className="text-muted-foreground">
                  <Banknote className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No deposits found</h3>
                  <p className="text-sm sm:text-base">Create your first bank deposit to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processed Approvals */}
          {hasPermission("approve_bank_deposits") && processedApprovals.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Processed Approvals</CardTitle>
                <CardDescription>Recently processed deposit approvals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {processedApprovals.slice(0, 5).map((approval) => (
                  <Card key={approval.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm sm:text-base">{approval.id}</span>
                            <Badge className={approval.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {approval.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {approval.requester} • UGX {approval.amount.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(approval.requestedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog (for mobile) */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bank Deposit</DialogTitle>
            <DialogDescription>
              Submit a new bank deposit request for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-amount">Deposit Amount *</Label>
              <Input
                id="dialog-amount"
                type="number"
                placeholder="Enter amount"
                value={newDeposit.amount || ""}
                onChange={(e) => setNewDeposit({...newDeposit, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-depositType">Deposit Type *</Label>
              <Select 
                value={newDeposit.depositType} 
                onValueChange={(value: "cash" | "check" | "transfer") => setNewDeposit({...newDeposit, depositType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash Deposit</SelectItem>
                  <SelectItem value="check">Check Deposit</SelectItem>
                  <SelectItem value="transfer">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-bankAccount">Bank Account *</Label>
              <Select 
                value={newDeposit.bankAccount} 
                onValueChange={(value) => setNewDeposit({...newDeposit, bankAccount: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-description">Description *</Label>
              <Textarea
                id="dialog-description"
                placeholder="Enter deposit description..."
                value={newDeposit.description}
                onChange={(e) => setNewDeposit({...newDeposit, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDepositDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDeposit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrgDeposits;
