import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  DollarSign,
  Wallet,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, PettyCashExpense, PettyCashFundRequest, BillPayment } from "@/services/organizationService";

interface ApprovalItem {
  id: string;
  type: 'transaction' | 'funding' | 'bill';
  requester: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  receipt?: string;
  department?: string;
  currentBalance?: number;
  requestedBalance?: number;
  originalData: PettyCashExpense | PettyCashFundRequest | BillPayment;
}

const OrgApprovals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [pendingTransactions, setPendingTransactions] = useState<ApprovalItem[]>([]);
  const [pendingFunding, setPendingFunding] = useState<ApprovalItem[]>([]);
  const [pendingBills, setPendingBills] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch petty cash wallet
        const walletsResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 1
        });

        const walletId = walletsResponse.results.length > 0 ? walletsResponse.results[0].id : null;
        const transactions: ApprovalItem[] = [];
        const funding: ApprovalItem[] = [];

        if (walletId) {
          // Fetch pending expenses
          const expensesResponse = await organizationService.getPettyCashExpenses({
            petty_cash_wallet: walletId,
            limit: 100
          });

          expensesResponse.results.forEach(expense => {
            if (!expense.is_approved) {
              transactions.push({
                id: expense.id,
                type: 'transaction',
                requester: expense.requestor_name || (expense.updated_by?.first_name && expense.updated_by?.last_name
                  ? `${expense.updated_by.first_name} ${expense.updated_by.last_name}`
                  : expense.updated_by?.username || "Unknown"),
                amount: expense.amount,
                description: expense.description || "Petty cash expense",
                date: expense.created_at.split('T')[0],
                category: expense.category || "Other",
                receipt: expense.receipt_number,
                department: "Operations",
                originalData: expense
              });
            }
          });

          // Fetch pending fund requests
          const fundRequestsResponse = await organizationService.getPettyCashFundRequests({
            petty_cash_wallet: walletId,
            limit: 100
          });

          fundRequestsResponse.results.forEach(fundRequest => {
            if (!fundRequest.is_approved) {
              const currentBalance = fundRequest.petty_cash_wallet.balance || 0;
              funding.push({
                id: fundRequest.id,
                type: 'funding',
                requester: fundRequest.requestor_name || (fundRequest.updated_by?.first_name && fundRequest.updated_by?.last_name
                  ? `${fundRequest.updated_by.first_name} ${fundRequest.updated_by.last_name}`
                  : fundRequest.updated_by?.username || "Unknown"),
                amount: fundRequest.amount,
                description: fundRequest.reason || "Petty cash fund request",
                date: fundRequest.created_at.split('T')[0],
                currentBalance,
                requestedBalance: currentBalance + fundRequest.amount,
                department: "Finance",
                originalData: fundRequest
              });
            }
          });
        }

        // Fetch pending bill payments
        const billPaymentsResponse = await organizationService.getBillPayments({
          organization: user.organizationId,
          status: "pending",
          limit: 100
        });

        const bills: ApprovalItem[] = [];
        billPaymentsResponse.results.forEach(bill => {
          if (bill.status === "pending") {
            bills.push({
              id: bill.id,
              type: 'bill',
              requester: "System",
              amount: bill.amount,
              description: `${bill.biller_name} - ${bill.account_number}`,
              date: bill.created_at.split('T')[0],
              category: bill.type || "Bill Payment",
              department: "Finance",
              originalData: bill
            });
          }
        });

        setPendingTransactions(transactions);
        setPendingFunding(funding);
        setPendingBills(bills);
      } catch (error) {
        console.error("Error fetching approvals:", error);
        toast({
          title: "Error",
          description: "Failed to load pending approvals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();
  }, [user?.organizationId]);

  const handleApprove = async (id: string, type: 'transaction' | 'funding' | 'bill') => {
    try {
      const allItems = [...pendingTransactions, ...pendingFunding, ...pendingBills];
      const item = allItems.find(i => i.id === id);
      if (!item) return;

      if (type === 'transaction') {
        const expense = item.originalData as PettyCashExpense;
        await organizationService.updatePettyCashExpense(expense.id, {
          is_approved: true,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          receipt_number: expense.receipt_number,
          requestor_name: expense.requestor_name,
          requestor_phone_number: expense.requestor_phone_number
        });
        setPendingTransactions(prev => prev.filter(t => t.id !== id));
      } else if (type === 'funding') {
        const fundRequest = item.originalData as PettyCashFundRequest;
        await organizationService.updatePettyCashFundRequest(fundRequest.id, {
          is_approved: true,
          amount: fundRequest.amount,
          urgency_level: fundRequest.urgency_level,
          reason: fundRequest.reason,
          requestor_name: fundRequest.requestor_name,
          requestor_phone_number: fundRequest.requestor_phone_number
        });
        setPendingFunding(prev => prev.filter(f => f.id !== id));
      } else if (type === 'bill') {
        const bill = item.originalData as BillPayment;
        await organizationService.updateBillPayment(bill.id, {
          organization: bill.organization.id,
          currency: bill.currency.id,
          biller_name: bill.biller_name,
          account_number: bill.account_number,
          amount: bill.amount,
          status: "successful",
          type: bill.type,
          wallet_type: bill.wallet_type,
          reference: bill.reference
        });
        setPendingBills(prev => prev.filter(b => b.id !== id));
      }

      toast({
        title: "Approved",
        description: `${type === 'transaction' ? 'Transaction' : type === 'funding' ? 'Funding request' : 'Bill payment'} has been approved successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, type: 'transaction' | 'funding' | 'bill') => {
    try {
      const allItems = [...pendingTransactions, ...pendingFunding, ...pendingBills];
      const item = allItems.find(i => i.id === id);
      if (!item) return;

      if (type === 'transaction') {
        const expense = item.originalData as PettyCashExpense;
        await organizationService.updatePettyCashExpense(expense.id, {
          is_approved: false,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          receipt_number: expense.receipt_number,
          requestor_name: expense.requestor_name,
          requestor_phone_number: expense.requestor_phone_number
        });
        setPendingTransactions(prev => prev.filter(t => t.id !== id));
      } else if (type === 'funding') {
        const fundRequest = item.originalData as PettyCashFundRequest;
        await organizationService.updatePettyCashFundRequest(fundRequest.id, {
          is_approved: false,
          amount: fundRequest.amount,
          urgency_level: fundRequest.urgency_level,
          reason: fundRequest.reason,
          requestor_name: fundRequest.requestor_name,
          requestor_phone_number: fundRequest.requestor_phone_number
        });
        setPendingFunding(prev => prev.filter(f => f.id !== id));
      } else if (type === 'bill') {
        const bill = item.originalData as BillPayment;
        await organizationService.updateBillPayment(bill.id, {
          organization: bill.organization.id,
          currency: bill.currency.id,
          biller_name: bill.biller_name,
          account_number: bill.account_number,
          amount: bill.amount,
          status: "failed",
          type: bill.type,
          wallet_type: bill.wallet_type,
          reference: bill.reference
        });
        setPendingBills(prev => prev.filter(b => b.id !== id));
      }

      toast({
        title: "Rejected", 
        description: `${type === 'transaction' ? 'Transaction' : type === 'funding' ? 'Funding request' : 'Bill payment'} has been rejected.`,
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = pendingTransactions.filter(transaction =>
    transaction.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFunding = pendingFunding.filter(funding =>
    funding.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funding.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Approvals"
        subtitle="Review and approve pending transactions and funding requests"
        rightSlot={(
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="w-full sm:w-auto">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto gap-1">
          <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2 px-2 sm:px-4 relative">
            <span className="hidden sm:inline">Transaction</span>
            <span className="sm:hidden">Transactions</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 sm:px-2">
              {pendingTransactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="funding" className="text-xs sm:text-sm py-2 px-2 sm:px-4 relative">
            <span className="hidden sm:inline">Funding</span>
            <span className="sm:hidden">Funding</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 sm:px-2">
              {pendingFunding.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bills" className="text-xs sm:text-sm py-2 px-2 sm:px-4 relative">
            <span className="hidden sm:inline">Bill Payments</span>
            <span className="sm:hidden">Bills</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 sm:px-2">
              {pendingBills.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading approvals...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{transaction.type}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Requested by {transaction.requester} • {transaction.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50 text-xs sm:text-sm w-fit">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <Label className="text-muted-foreground text-xs">Amount</Label>
                          <p className="font-medium text-sm sm:text-base">UGX {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Category</Label>
                          <p className="font-medium text-sm sm:text-base">{transaction.category}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Date</Label>
                          <p className="font-medium text-sm sm:text-base">{transaction.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground text-xs sm:text-sm">Description</Label>
                        <p className="font-medium text-sm sm:text-base break-words">{transaction.description}</p>
                      </div>
                      
                      {transaction.receipt && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="text-muted-foreground text-xs sm:text-sm">Receipt:</Label>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs sm:text-sm">
                            {transaction.receipt}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => handleApprove(transaction.id, 'transaction')}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Approve</span>
                        <span className="sm:hidden">✓</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(transaction.id, 'transaction')}
                        className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reject</span>
                        <span className="sm:hidden">✗</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm hidden sm:flex">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm hidden sm:flex">
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
              
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No pending transactions</h3>
                    <p className="text-muted-foreground">All transaction requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="funding">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading approvals...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFunding.map((funding) => (
              <Card key={funding.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">Funding Request</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Requested by {funding.requester} • {funding.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50 text-xs sm:text-sm w-fit">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <Label className="text-muted-foreground text-xs">Requested Amount</Label>
                          <p className="font-medium text-sm sm:text-base">UGX {funding.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Current Balance</Label>
                          <p className="font-medium text-sm sm:text-base">UGX {funding.currentBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Date</Label>
                          <p className="font-medium text-sm sm:text-base">{funding.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground text-xs sm:text-sm">Justification</Label>
                        <p className="font-medium text-sm sm:text-base break-words">{funding.description}</p>
                      </div>
                      
                      <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                          <span>New Balance After Approval:</span>
                          <span className="font-bold text-green-600">
                            UGX {funding.requestedBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => handleApprove(funding.id, 'funding')}
                        className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Approve</span>
                        <span className="sm:hidden">✓</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(funding.id, 'funding')}
                        className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reject</span>
                        <span className="sm:hidden">✗</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm hidden sm:flex">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm hidden sm:flex">
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
              
              {filteredFunding.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No pending funding requests</h3>
                    <p className="text-muted-foreground">All funding requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bills">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading approvals...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingBills.filter(bill =>
                bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.category?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((bill) => (
                <Card key={bill.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base">Bill Payment</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {bill.requester} • {bill.department}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-orange-600 bg-orange-50 text-xs sm:text-sm w-fit">
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <Label className="text-muted-foreground text-xs">Amount</Label>
                            <p className="font-medium text-sm sm:text-base">UGX {bill.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Category</Label>
                            <p className="font-medium text-sm sm:text-base">{bill.category}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Date</Label>
                            <p className="font-medium text-sm sm:text-base">{bill.date}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground text-xs sm:text-sm">Description</Label>
                          <p className="font-medium text-sm sm:text-base break-words">{bill.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 lg:w-48">
                        <Button 
                          onClick={() => handleApprove(bill.id, 'bill')}
                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleReject(bill.id, 'bill')}
                          className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✗</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingBills.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No pending bill payments</h3>
                    <p className="text-muted-foreground">All bill payment requests have been processed.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgApprovals;