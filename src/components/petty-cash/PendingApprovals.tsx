import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, PettyCashTransaction, PettyCashExpense, PettyCashFundRequest } from "@/services/organizationService";

interface PendingRequest {
  id: string;
  requestorName: string;
  mobileNumber: string;
  type: "expense" | "addition" | "fund_request";
  amount: number;
  category: string;
  description: string;
  receipt?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  originalData: PettyCashTransaction | PettyCashExpense | PettyCashFundRequest;
}

const PendingApprovals = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch petty cash wallet for the organization
        const walletsResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 1
        });
        
        if (walletsResponse.results.length === 0) {
          setRequests([]);
          setIsLoading(false);
          return;
        }

        const walletId = walletsResponse.results[0].id;

        // Fetch pending transactions
        const transactionsResponse = await organizationService.getPettyCashTransactions({
          petty_cash_wallet: walletId,
          status: "pending_approval",
          limit: 100
        });

        // Fetch pending expenses
        const expensesResponse = await organizationService.getPettyCashExpenses({
          petty_cash_wallet: walletId,
          limit: 100
        });

        // Fetch pending fund requests
        const fundRequestsResponse = await organizationService.getPettyCashFundRequests({
          petty_cash_wallet: walletId,
          limit: 100
        });

        // Combine and format requests
        const formattedRequests: PendingRequest[] = [];

        // Add transactions with pending approval
        transactionsResponse.results.forEach(transaction => {
          if (transaction.status === "pending_approval") {
            formattedRequests.push({
              id: transaction.id,
              requestorName: transaction.updated_by?.first_name && transaction.updated_by?.last_name 
                ? `${transaction.updated_by.first_name} ${transaction.updated_by.last_name}`
                : transaction.updated_by?.username || "Unknown",
              mobileNumber: transaction.updated_by?.phone_number || "",
              type: transaction.type === "credit" ? "addition" : "expense",
              amount: Math.abs(transaction.amount),
              category: transaction.type === "credit" ? "Cash Addition" : "Expense",
              description: transaction.title || `${transaction.type === "credit" ? "Cash addition" : "Expense"}`,
              submittedAt: transaction.created_at,
              status: "pending",
              originalData: transaction
            });
          }
        });

        // Add expenses that are not approved
        expensesResponse.results.forEach(expense => {
          if (!expense.is_approved) {
            formattedRequests.push({
              id: expense.id,
              requestorName: expense.requestor_name || (expense.updated_by?.first_name && expense.updated_by?.last_name 
                ? `${expense.updated_by.first_name} ${expense.updated_by.last_name}`
                : expense.updated_by?.username || "Unknown"),
              mobileNumber: expense.requestor_phone_number || expense.updated_by?.phone_number || "",
              type: "expense",
              amount: expense.amount,
              category: expense.category || "Other",
              description: expense.description || "Petty cash expense",
              receipt: expense.receipt_number || undefined,
              submittedAt: expense.created_at,
              status: "pending",
              originalData: expense
            });
          }
        });

        // Add fund requests that are not approved
        fundRequestsResponse.results.forEach(fundRequest => {
          if (!fundRequest.is_approved) {
            formattedRequests.push({
              id: fundRequest.id,
              requestorName: fundRequest.requestor_name || (fundRequest.updated_by?.first_name && fundRequest.updated_by?.last_name 
                ? `${fundRequest.updated_by.first_name} ${fundRequest.updated_by.last_name}`
                : fundRequest.updated_by?.username || "Unknown"),
              mobileNumber: fundRequest.requestor_phone_number || fundRequest.updated_by?.phone_number || "",
              type: "fund_request",
              amount: fundRequest.amount,
              category: "Fund Request",
              description: fundRequest.reason || "Petty cash fund request",
              submittedAt: fundRequest.created_at,
              status: "pending",
              originalData: fundRequest
            });
          }
        });

        setRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        toast({
          title: "Error",
          description: "Failed to load pending requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user?.organizationId]);

  const handleApproval = async (requestId: string, action: "approve" | "reject") => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const status = action === "approve" ? "approved" : "rejected";

      // Update based on type
      if (request.type === "expense" && "is_approved" in request.originalData) {
        // Update expense
        const expense = request.originalData as PettyCashExpense;
        await organizationService.updatePettyCashExpense(expense.id, {
          is_approved: status === "approved",
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          receipt_number: expense.receipt_number,
          requestor_name: expense.requestor_name,
          requestor_phone_number: expense.requestor_phone_number
        });
      } else if (request.type === "fund_request") {
        // Update fund request
        const fundRequest = request.originalData as PettyCashFundRequest;
        await organizationService.updatePettyCashFundRequest(fundRequest.id, {
          is_approved: status === "approved",
          amount: fundRequest.amount,
          urgency_level: fundRequest.urgency_level,
          reason: fundRequest.reason,
          requestor_name: fundRequest.requestor_name,
          requestor_phone_number: fundRequest.requestor_phone_number
        });
      }

      setRequests(prev => prev.filter(req => req.id !== requestId));

      toast({
        title: `Request ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `The request has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
        variant: action === "approve" ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error processing approval:", error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (_status: string) => {
    return "bg-blue-100 text-blue-800";
  };

  const pendingRequests = requests.filter(req => req.status === "pending");

  return (
    <Card className="bg-blue-50 border border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Approvals ({pendingRequests.length})
        </CardTitle>
        <CardDescription className="text-blue-700">
          Review and approve petty cash requests from your organization members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">All requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <Badge variant={request.type === "expense" ? "destructive" : "default"}>
                          {request.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{request.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{request.requestorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{request.mobileNumber}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold">UGX {request.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{request.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm">{request.description}</p>
                      
                      {request.receipt && (
                        <p className="text-xs text-muted-foreground">
                          Receipt: {request.receipt}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()} at {new Date(request.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(request.id, "approve")} 
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleApproval(request.id, "reject")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;