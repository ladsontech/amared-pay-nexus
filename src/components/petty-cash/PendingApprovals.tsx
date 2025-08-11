import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, User, Phone } from "lucide-react";

interface PendingRequest {
  id: string;
  requestorName: string;
  mobileNumber: string;
  type: "expense" | "addition";
  amount: number;
  category: string;
  description: string;
  receipt?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const PendingApprovals = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching pending requests
    const fetchRequests = async () => {
      setTimeout(() => {
        setRequests([
          {
            id: "REQ001",
            requestorName: "John Doe",
            mobileNumber: "+256701234567",
            type: "expense",
            amount: 50000,
            category: "Office Supplies",
            description: "Purchase of printer paper and ink cartridges for the office",
            receipt: "REC-001",
            submittedAt: "2024-01-15T10:30:00Z",
            status: "pending"
          },
          {
            id: "REQ002",
            requestorName: "Jane Smith",
            mobileNumber: "+256789012345",
            type: "expense",
            amount: 25000,
            category: "Travel",
            description: "Taxi fare for client meeting downtown",
            submittedAt: "2024-01-15T14:20:00Z",
            status: "pending"
          },
          {
            id: "REQ003",
            requestorName: "Mike Johnson",
            mobileNumber: "+256712345678",
            type: "addition",
            amount: 100000,
            category: "Cash Addition",
            description: "Monthly petty cash fund replenishment",
            submittedAt: "2024-01-14T09:15:00Z",
            status: "pending"
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string, action: "approve" | "reject") => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === "approve" ? "approved" : "rejected" }
          : req
      ));

      toast({
        title: `Request ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `The request has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
        variant: action === "approve" ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingRequests = requests.filter(req => req.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Approvals ({pendingRequests.length})
        </CardTitle>
        <CardDescription>
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
              <Card key={request.id} className="border-l-4 border-l-yellow-500">
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
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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