import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, Search, Filter, Download, Eye, Plus, AlertCircle, Check, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import OrganizationDashboardLayout from "@/components/OrganizationDashboardLayout";

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

const DepositApprovals = () => {
  const [approvals, setApprovals] = useState<DepositApproval[]>([
    {
      id: "DA001",
      requester: "Sarah Johnson",
      amount: 500000,
      depositType: "Cash",
      bankAccount: "Stanbic Bank - ***4567",
      description: "Daily cash collection deposit",
      requestedDate: "2024-01-15T10:30:00Z",
      status: "pending",
      urgency: "high",
    },
    {
      id: "DA002", 
      requester: "Mike Chen",
      amount: 250000,
      depositType: "Check",
      bankAccount: "Centenary Bank - ***8901",
      description: "Client payment deposit",
      requestedDate: "2024-01-14T14:20:00Z",
      status: "pending",
      urgency: "medium",
    },
  ]);

  const { toast } = useToast();

  const handleApprove = (depositId: string) => {
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === depositId
          ? { ...approval, status: "approved" as const }
          : approval
      )
    );
    toast({
      title: "Deposit Approved",
      description: `Deposit ${depositId} has been approved successfully`,
    });
  };

  const handleReject = (depositId: string) => {
    setApprovals(prev =>
      prev.map(approval =>
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const pendingApprovals = approvals.filter(approval => approval.status === "pending");
  const processedApprovals = approvals.filter(approval => approval.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Bank Deposit Approvals</h2>
        
        {pendingApprovals.length > 0 ? (
          <div className="grid gap-4 mb-8">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{approval.id}</h3>
                        {getUrgencyBadge(approval.urgency)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested by: <span className="font-medium">{approval.requester}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Amount:</span> UGX {approval.amount.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {approval.depositType}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Bank Account:</span> {approval.bankAccount}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Description:</span> {approval.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(approval.requestedDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(approval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(approval.id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Banknote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No pending deposit approvals</h3>
              <p className="text-muted-foreground">All deposits have been processed.</p>
            </CardContent>
          </Card>
        )}
        
        {processedApprovals.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Processed Deposits</h3>
            <div className="grid gap-4">
              {processedApprovals.slice(0, 5).map((approval) => (
                <Card key={approval.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{approval.id}</span>
                          {getStatusBadge(approval.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {approval.requester} • UGX {approval.amount.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(approval.requestedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrgDeposits = () => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newDeposit, setNewDeposit] = useState({
    amount: 0,
    bankAccount: "",
    depositType: "cash" as "cash" | "check" | "transfer",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching deposits
    const fetchDeposits = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setDeposits([
            {
              id: "DEP001",
              amount: 750000,
              bankAccount: "Stanbic Bank - ***4567",
              depositType: "cash",
              status: "completed",
              createdAt: "2024-01-15T10:30:00Z",
              description: "Daily cash collection",
              requestedBy: "Sarah Johnson",
            },
            {
              id: "DEP002",
              amount: 500000,
              bankAccount: "Centenary Bank - ***8901",
              depositType: "check",
              status: "processing",
              createdAt: "2024-01-14T14:20:00Z",
              description: "Client payment deposit",
              requestedBy: "Mike Chen",
            },
            {
              id: "DEP003",
              amount: 300000,
              bankAccount: "DFCU Bank - ***2345",
              depositType: "transfer",
              status: "pending",
              createdAt: "2024-01-13T09:15:00Z",
              description: "Monthly collections",
              requestedBy: "Lisa Park",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load deposits",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [toast]);

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
    (deposit) =>
      deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeposit = () => {
    if (!newDeposit.amount || !newDeposit.bankAccount || !newDeposit.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deposit Request Submitted",
      description: "Your deposit request has been submitted for approval",
    });

    // Reset form
    setNewDeposit({
      amount: 0,
      bankAccount: "",
      depositType: "cash",
      description: "",
    });
    setActiveTab("overview");
  };

  return (
    <OrganizationDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bank Deposits</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and track your bank deposit transactions
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Button onClick={() => { setActiveTab("create"); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', 'create'); return p; }); }} className="w-full sm:w-auto">
                <Banknote className="h-4 w-4 mr-2" />
                Deposit to Bank
              </Button>
            </div>
          </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', val); return p; }); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto gap-1 sm:gap-0">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="create" className="text-xs sm:text-sm">New Deposit</TabsTrigger>
            {hasPermission("approve_bank_deposits") && (
              <TabsTrigger value="approvals" className="text-xs sm:text-sm">Approvals</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

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
            ) : (
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
                        <Button variant="outline" size="sm" className="w-full mt-4 text-xs sm:text-sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredDeposits.length === 0 && !isLoading && (
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
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  New Bank Deposit
                </CardTitle>
                <CardDescription>
                  Submit a new bank deposit request for approval
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
                      <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                      <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                      <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                      <SelectItem value="equity-1122">Equity Bank - ***1122</SelectItem>
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
                  <Button onClick={handleCreateDeposit} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Deposit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasPermission("approve_bank_deposits") && (
            <TabsContent value="approvals" className="space-y-4">
              <DepositApprovals />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </OrganizationDashboardLayout>
  );
};

export default OrgDeposits;