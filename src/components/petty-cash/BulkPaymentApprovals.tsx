import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkPayment {
  id: string;
  requester: string;
  amount: number;
  currency: string;
  description: string;
  requestDate: string;
  urgency: "High" | "Medium" | "Low";
  status: "pending" | "approved" | "rejected";
  recipients: number;
}

const BulkPaymentApprovals = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<BulkPayment[]>([
    {
      id: "BP001",
      requester: "John Doe",
      amount: 500000,
      currency: "UGX",
      description: "Monthly salary payments for department staff",
      requestDate: "2024-01-15",
      urgency: "High",
      status: "pending",
      recipients: 25
    },
    {
      id: "BP002",
      requester: "Jane Smith",
      amount: 250000,
      currency: "UGX",
      description: "Vendor payments for office supplies",
      requestDate: "2024-01-14",
      urgency: "Medium",
      status: "pending",
      recipients: 5
    },
    {
      id: "BP003",
      requester: "Mike Johnson",
      amount: 750000,
      currency: "UGX",
      description: "Project contractor payments",
      requestDate: "2024-01-13",
      urgency: "Low",
      status: "approved",
      recipients: 8
    }
  ]);

  const handleApprove = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: "approved" as const }
          : payment
      )
    );
    
    toast({
      title: "Bulk Payment Approved",
      description: `Payment ${paymentId} has been approved successfully`,
    });
  };

  const handleReject = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: "rejected" as const }
          : payment
      )
    );
    
    toast({
      title: "Bulk Payment Rejected",
      description: `Payment ${paymentId} has been rejected`,
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center space-x-1"><Clock className="h-3 w-3" /><span>Pending</span></Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /><span>Approved</span></Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center space-x-1"><XCircle className="h-3 w-3" /><span>Rejected</span></Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "High":
        return <Badge variant="destructive">{urgency}</Badge>;
      case "Medium":
        return <Badge variant="secondary">{urgency}</Badge>;
      case "Low":
        return <Badge variant="outline">{urgency}</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const pendingPayments = payments.filter(payment => payment.status === "pending");
  const processedPayments = payments.filter(payment => payment.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Send className="h-5 w-5 text-primary" />
          <span>Pending Bulk Payment Approvals ({pendingPayments.length})</span>
        </h3>
        
        {pendingPayments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No pending bulk payment approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">Bulk Payment {payment.id}</CardTitle>
                      {getUrgencyBadge(payment.urgency)}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <CardDescription>{payment.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Requester:</span>
                      <span className="font-medium">{payment.requester}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{payment.currency} {payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(payment.requestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Recipients:</span>
                      <span className="font-medium">{payment.recipients}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReject(payment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApprove(payment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Payments */}
      {processedPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Processed Payments</h3>
          <div className="grid grid-cols-1 gap-4">
            {processedPayments.map((payment) => (
              <Card key={payment.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">Bulk Payment {payment.id}</CardTitle>
                      {getUrgencyBadge(payment.urgency)}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <CardDescription>{payment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Requester:</span>
                      <span className="font-medium">{payment.requester}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{payment.currency} {payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(payment.requestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Recipients:</span>
                      <span className="font-medium">{payment.recipients}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkPaymentApprovals;