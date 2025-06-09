
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  QrCode, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Share
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface PaymentLink {
  id: string;
  amount: number;
  reference: string;
  paymentReason: string;
  link: string;
  status: "active" | "completed" | "expired";
  createdAt: string;
  totalPayees: number;
  successfulPayments: number;
  pendingPayments: number;
}

const PaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([
    {
      id: "PL001",
      amount: 5000,
      reference: "SCHOOL_FEES_2024",
      paymentReason: "School Fees Payment for Q1 2024",
      link: "https://pay.almaredpay.com/link/PL001",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      totalPayees: 50,
      successfulPayments: 30,
      pendingPayments: 20,
    },
    {
      id: "PL002",
      amount: 2500,
      reference: "MEMBERSHIP_FEE",
      paymentReason: "Annual Membership Fee",
      link: "https://pay.almaredpay.com/link/PL002",
      status: "completed",
      createdAt: "2024-01-10T14:20:00Z",
      totalPayees: 25,
      successfulPayments: 25,
      pendingPayments: 0,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
    paymentReason: "",
  });

  const { toast } = useToast();

  const handleCreateLink = () => {
    if (!formData.amount || !formData.reference || !formData.paymentReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newLink: PaymentLink = {
      id: `PL${String(paymentLinks.length + 1).padStart(3, '0')}`,
      amount: parseFloat(formData.amount),
      reference: formData.reference,
      paymentReason: formData.paymentReason,
      link: `https://pay.almaredpay.com/link/PL${String(paymentLinks.length + 1).padStart(3, '0')}`,
      status: "active",
      createdAt: new Date().toISOString(),
      totalPayees: 0,
      successfulPayments: 0,
      pendingPayments: 0,
    };

    setPaymentLinks([newLink, ...paymentLinks]);
    setFormData({ amount: "", reference: "", paymentReason: "" });
    setShowCreateForm(false);

    toast({
      title: "Payment Link Created",
      description: "Your payment collection link has been generated successfully.",
    });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Payment link has been copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "expired":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Payment Links</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create collection links for multiple payees
            </p>
          </div>
          <Button 
            className="w-full sm:w-auto flex items-center space-x-2" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4" />
            <span>Create Payment Link</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentLinks.length}</div>
              <p className="text-xs text-muted-foreground">Active collection links</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentLinks.reduce((sum, link) => sum + link.totalPayees, 0)}
              </div>
              <p className="text-xs text-muted-foreground">All-time payees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paymentLinks.reduce((sum, link) => sum + link.successfulPayments, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${paymentLinks.reduce((sum, link) => sum + (link.amount * link.successfulPayments), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Payment Link Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Payment Link</CardTitle>
              <CardDescription>
                Generate a collection link that multiple payees can use to make payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount per Payment</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Code</Label>
                  <Input
                    id="reference"
                    placeholder="SCHOOL_FEES_2024"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReason">Payment Reason</Label>
                <Textarea
                  id="paymentReason"
                  placeholder="Describe what this payment is for..."
                  value={formData.paymentReason}
                  onChange={(e) => setFormData({ ...formData, paymentReason: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCreateLink} className="flex-1">
                  Create Payment Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Links List */}
        <div className="space-y-4">
          {paymentLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-lg">{link.reference}</h3>
                      <Badge className={`${getStatusColor(link.status)} w-fit`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(link.status)}
                          <span className="capitalize">{link.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{link.paymentReason}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">${link.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Payees</p>
                        <p className="font-medium">{link.totalPayees}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Successful</p>
                        <p className="font-medium text-green-600">{link.successfulPayments}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-medium text-yellow-600">{link.pendingPayments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.link)}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>QR Code</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Share className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {paymentLinks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No payment links yet</h3>
                <p>Create your first payment collection link to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentLinks;
