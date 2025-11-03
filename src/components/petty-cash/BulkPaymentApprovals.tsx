import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle, XCircle, Clock, User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService, BulkPayment } from "@/services/paymentService";

const BulkPaymentApprovals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [payments, setPayments] = useState<BulkPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await paymentService.getBulkPayments({
          organization: user.organizationId,
          status: "pending_approval",
          limit: 100
        });

        // Also get approved/rejected for history
        const allResponse = await paymentService.getBulkPayments({
          organization: user.organizationId,
          limit: 100
        });

        setPayments(allResponse.results);
      } catch (error) {
        console.error("Error fetching bulk payments:", error);
        toast({
          title: "Error",
          description: "Failed to load bulk payments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [user?.organizationId]);

  const handleApprove = async (paymentId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await paymentService.updateBulkPayment(paymentId, {
        status: "approved",
        is_approved: true,
        approved_by: user.id
      });

      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: "approved" as const, is_approved: true }
            : payment
        )
      );
      
      toast({
        title: "Bulk Payment Approved",
        description: `Payment ${paymentId.substring(0, 8)} has been approved successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve bulk payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await paymentService.updateBulkPayment(paymentId, {
        status: "rejected",
        is_approved: false
      });

      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: "rejected" as const, is_approved: false }
            : payment
        )
      );
      
      toast({
        title: "Bulk Payment Rejected",
        description: `Payment ${paymentId.substring(0, 8)} has been rejected`,
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject bulk payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending_approval":
        return <Badge variant="secondary" className="flex items-center space-x-1"><Clock className="h-3 w-3" /><span>Pending</span></Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /><span>Approved</span></Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center space-x-1"><XCircle className="h-3 w-3" /><span>Rejected</span></Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const pendingPayments = payments.filter(payment => payment.status === "pending_approval" || (!payment.is_approved && !payment.status));
  const processedPayments = payments.filter(payment => payment.status !== "pending_approval" && (payment.is_approved || payment.status === "approved" || payment.status === "rejected"));

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Send className="h-5 w-5 text-primary" />
          <span>Pending Bulk Payment Approvals ({pendingPayments.length})</span>
        </h3>
        
        {isLoading ? (
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-muted-foreground">Loading bulk payments...</p>
            </CardContent>
          </Card>
        ) : pendingPayments.length === 0 ? (
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No pending bulk payment approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="bg-blue-50 border border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">{payment.reference || `Bulk Payment ${payment.id.substring(0, 8)}`}</CardTitle>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <CardDescription>{payment.comments || `Bulk payment for ${payment.organization.name}`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Organization:</span>
                      <span className="font-medium">{payment.organization.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{payment.currency.symbol} {payment.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Charge:</span>
                      <span className="font-medium">{payment.currency.symbol} {payment.charge.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {payment.sheet && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.sheet || '', '_blank')}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        View Sheet
                      </Button>
                    </div>
                  )}
                  
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
            {processedPayments.slice(0, 10).map((payment) => (
              <Card key={payment.id} className="opacity-75 bg-blue-50 border border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">{payment.reference || `Bulk Payment ${payment.id.substring(0, 8)}`}</CardTitle>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <CardDescription>{payment.comments || `Bulk payment for ${payment.organization.name}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Organization:</span>
                      <span className="font-medium">{payment.organization.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{payment.currency.symbol} {payment.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Charge:</span>
                      <span className="font-medium">{payment.currency.symbol} {payment.charge.toLocaleString()}</span>
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