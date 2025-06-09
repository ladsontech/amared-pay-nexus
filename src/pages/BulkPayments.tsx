
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download, Eye, CreditCard } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface BulkPayment {
  id: string;
  amount: number;
  recipients: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  description: string;
}

const BulkPayments = () => {
  const [payments, setPayments] = useState<BulkPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching bulk payments from /payments/bulk-payments/
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          setPayments([
            {
              id: "BP001",
              amount: 250000,
              recipients: 150,
              status: "completed",
              createdAt: "2024-01-15T10:30:00Z",
              description: "Monthly Salary Payment",
            },
            {
              id: "BP002",
              amount: 75000,
              recipients: 50,
              status: "processing",
              createdAt: "2024-01-14T14:20:00Z",
              description: "Vendor Payments Q1",
            },
            {
              id: "BP003",
              amount: 180000,
              recipients: 120,
              status: "pending",
              createdAt: "2024-01-13T09:15:00Z",
              description: "Commission Payments",
            },
            {
              id: "BP004",
              amount: 45000,
              recipients: 30,
              status: "failed",
              createdAt: "2024-01-12T16:45:00Z",
              description: "Bonus Distribution",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bulk payments",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchPayments();
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bulk Payments</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and monitor your bulk payment transactions
            </p>
          </div>
          <Button className="flex items-center space-x-2 text-sm sm:text-base">
            <Plus className="h-4 w-4" />
            <span>Create Bulk Payment</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search payments..."
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
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">{payment.id}</CardTitle>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{payment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Amount</span>
                      <span className="text-sm sm:text-base font-medium">${payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Recipients</span>
                      <span className="text-sm sm:text-base font-medium">{payment.recipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Created</span>
                      <span className="text-sm sm:text-base font-medium">
                        {new Date(payment.createdAt).toLocaleDateString()}
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

        {filteredPayments.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <div className="text-muted-foreground">
                <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No bulk payments found</h3>
                <p className="text-sm sm:text-base">Create your first bulk payment to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BulkPayments;
