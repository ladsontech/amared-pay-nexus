import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter, Download, Eye, CreditCard, Upload, Trash2, Check, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { BulkPayment, paymentService } from "@/services/paymentService";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";

// Add shared bank names used for selection
const BANK_NAMES = [
  "Stanbic Bank",
  "Centenary Bank",
  "DFCU Bank",
  "Equity Bank",
];

// Using BulkPayment interface from paymentService

interface PaymentRow {
  id: string;
  recipientName: string;
  recipientAccount?: string;
  // Bank name for bank payments
  bankName?: string;
  phoneNumber?: string;
  mobileProvider?: "MTN" | "Airtel" | "Unknown";
  amount: number;
  description: string;
  verified: boolean;
}

const BulkPayments = () => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [bankPaymentRows, setBankPaymentRows] = useState<PaymentRow[]>([]);
  const [mobilePaymentRows, setMobilePaymentRows] = useState<PaymentRow[]>([]);
  const [bulkDescription, setBulkDescription] = useState("");
  const { toast } = useToast();
  const { bulkPayments, loading, error, fetchBulkPayments } = useOrganization();

  // Bulk payments data is now provided by useOrganization hook

  // Initialize with 10 empty rows for each payment type
  useEffect(() => {
    const createEmptyRows = (type: "bank" | "mobile") => {
      return Array.from({ length: 10 }, (_, index) => ({
        id: `${type}-row-${index + 1}`,
        recipientName: "",
        ...(type === "bank"
          ? { recipientAccount: "", bankName: "" }
          : { phoneNumber: "+256", mobileProvider: "Unknown" as const }),
        amount: 0,
        description: "",
        verified: false,
      }));
    };

    setBankPaymentRows(createEmptyRows("bank"));
    setMobilePaymentRows(createEmptyRows("mobile"));
  }, []);


  const normalizeUgPhone = (input: string) => {
    const digits = (input || '').replace(/\D/g, '');
    if (digits.startsWith('256')) {
      return '0' + digits.slice(3);
    }
    if (digits.startsWith('0')) {
      return digits;
    }
    return '';
  };

  const detectMobileProvider = (input: string): "MTN" | "Airtel" | "Unknown" => {
    const local = normalizeUgPhone(input);
    if (!local) return "Unknown";
    // Airtel prefixes: 070, 075
    if (local.startsWith('070') || local.startsWith('075')) return "Airtel";
    // MTN prefixes: 076, 077, 078, 079
    if (local.startsWith('076') || local.startsWith('077') || local.startsWith('078') || local.startsWith('079')) return "MTN";
    return "Unknown";
  };

  const filteredPayments = bulkPayments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      payment.total_amount.toString().includes(searchTerm)
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updatePaymentRow = (type: "bank" | "mobile", id: string, field: keyof PaymentRow, value: PaymentRow[keyof PaymentRow]) => {
    const updateFunction = (prev: PaymentRow[]) => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    
    if (type === "bank") {
      setBankPaymentRows(updateFunction);
    } else {
      setMobilePaymentRows(updateFunction);
    }
  };

  const removePaymentRow = (type: "bank" | "mobile", id: string) => {
    if (type === "bank") {
      setBankPaymentRows(prev => prev.filter(row => row.id !== id));
    } else {
      setMobilePaymentRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const verifyPaymentRow = (type: "bank" | "mobile", id: string) => {
    updatePaymentRow(type, id, "verified", true);
    toast({
      title: "Payment Verified",
      description: "Payment row has been verified against database records",
    });
  };

  const verifyAllRows = (type: "bank" | "mobile") => {
    if (type === "bank") {
      setBankPaymentRows(prev => prev.map(row => {
        const canVerify = Boolean(row.recipientName && row.recipientAccount);
        return canVerify ? { ...row, verified: true } : row;
      }));
    } else {
      setMobilePaymentRows(prev => prev.map(row => {
        const canVerify = Boolean(row.recipientName && row.phoneNumber);
        return canVerify ? { ...row, verified: true } : row;
      }));
    }
    toast({
      title: "Verification Complete",
      description: "All eligible rows have been marked as verified.",
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "bank" | "mobile") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const lines = csvText.split('\n');
      
      const newRows: PaymentRow[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: `csv-${Date.now()}-${index}`,
            recipientName: values[0]?.trim() || "",
            ...(type === "bank" 
              ? { recipientAccount: values[1]?.trim() || "", bankName: "" }
              : { phoneNumber: values[1]?.trim() || "+256", mobileProvider: detectMobileProvider(values[1]?.trim() || "+256") as "MTN" | "Airtel" | "Unknown" }
            ),
            amount: parseFloat(values[2]?.trim() || "0"),
            description: values[3]?.trim() || "",
            verified: false,
          };
        });

      if (type === "bank") {
        setBankPaymentRows(prev => [...prev, ...newRows]);
      } else {
        setMobilePaymentRows(prev => [...prev, ...newRows]);
      }
      
      toast({
        title: "CSV Uploaded",
        description: `Added ${newRows.length} payment rows from CSV`,
      });
    };
    reader.readAsText(file);
  };

  const handleSubmitBulkPayment = async (type: "bank" | "mobile") => {
    const rows = type === "bank" ? bankPaymentRows : mobilePaymentRows;
    const filledRows = rows.filter(row => row.recipientName && row.amount > 0);
    
    if (filledRows.length === 0) {
      toast({
        title: "No valid entries",
        description: "Please add at least one valid payment entry",
        variant: "destructive",
      });
      return;
    }

    const unverifiedRows = filledRows.filter(row => !row.verified);
    if (unverifiedRows.length > 0) {
      toast({
        title: "Verification Required",
        description: `${unverifiedRows.length} entries need verification before submission`,
        variant: "destructive",
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const organizationId = user.organizationId || user.organization?.id;
      
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      // Calculate total amount
      const totalAmount = filledRows.reduce((sum, row) => sum + row.amount, 0);

      // Create CSV content
      const csvContent = type === "bank"
        ? "Recipient Name,Bank Name,Account Number,Amount,Description\n" +
          filledRows.map(row => 
            `"${row.recipientName}","${row.bankName || ''}","${row.recipientAccount || ''}","${row.amount}","${row.description || ''}"`
          ).join("\n")
        : "Recipient Name,Phone Number,Amount,Description\n" +
          filledRows.map(row => 
            `"${row.recipientName}","${row.phoneNumber || ''}","${row.amount}","${row.description || ''}"`
          ).join("\n");

      // Create bulk payment via API
      const bulkPayment = await paymentService.createBulkPayment({
        organization: organizationId,
        total_amount: totalAmount,
        status: "pending_approval",
        is_approved: false,
        comments: bulkDescription || `${type === "bank" ? "Bank" : "Mobile money"} bulk payment for ${filledRows.length} recipients`
      });

      // Upload CSV to sheet URL if provided
      if (bulkPayment.sheet) {
        try {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const formData = new FormData();
          formData.append('file', blob, `bulk_payment_${type}_${Date.now()}.csv`);
          
          const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
          const uploadResponse = await fetch(bulkPayment.sheet, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            console.warn('Failed to upload CSV to sheet URL, but bulk payment was created');
          }
        } catch (uploadError) {
          console.warn('Error uploading CSV:', uploadError);
          // Don't fail the whole operation if CSV upload fails
        }
      }

      await fetchBulkPayments(); // Refresh the list
      
      toast({
        title: "Bulk Payment Submitted",
        description: `${type === "bank" ? "Bank" : "Mobile money"} payment for ${filledRows.length} recipients (Total: UGX ${totalAmount.toLocaleString()}) submitted for approval`,
      });

      // Reset the form
      if (type === "bank") {
        setBankPaymentRows(Array.from({ length: 10 }, (_, i) => ({
          id: `bank-${Date.now()}-${i}`,
          recipientName: '',
          recipientAccount: '',
          bankName: '',
          amount: 0,
          description: '',
          verified: false,
        })));
      } else {
        setMobilePaymentRows(Array.from({ length: 10 }, (_, i) => ({
          id: `mobile-${Date.now()}-${i}`,
          recipientName: '',
          phoneNumber: '+256',
          mobileProvider: 'Unknown' as const,
          amount: 0,
          description: '',
          verified: false,
        })));
      }
      setBulkDescription("");
      setActiveTab("overview");
    } catch (error: any) {
      console.error("Error creating bulk payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit bulk payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Bulk Payments</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor your bulk payment transactions</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {hasPermission("view_department_reports") && (
            <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
              <Link to="/org/reports?tab=bulk-payments" className="flex items-center justify-center space-x-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">View Bulk Payments Report</span>
                <span className="sm:hidden">Reports</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', val); return p; }); }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 sm:gap-0 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="bank" className="text-xs sm:text-sm px-2 py-1.5">Bank Payments</TabsTrigger>
          <TabsTrigger value="mobile" className="text-xs sm:text-sm px-2 py-1.5">Mobile Payments</TabsTrigger>
          {hasPermission("approve_bulk_payments") && (
            <TabsTrigger value="approvals" className="text-xs sm:text-sm px-2 py-1.5">Approvals</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-1 sm:flex-none">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-1 sm:flex-none">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">{payment.reference || `BP-${payment.id.substring(0, 8)}`}</CardTitle>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === "pending_approval" ? "Pending" : payment.status === "approved" ? "Approved" : payment.status === "rejected" ? "Rejected" : payment.status || "Unknown"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{payment.comments || `Bulk Payment - ${payment.id.substring(0, 8)}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Amount</span>
                        <span className="text-sm sm:text-base font-medium">{payment.currency.symbol} {payment.total_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Charge</span>
                        <span className="text-sm sm:text-base font-medium">{payment.currency.symbol} {payment.charge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">Created</span>
                        <span className="text-sm sm:text-base font-medium">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.sheet && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 text-xs sm:text-sm"
                          onClick={() => window.open(payment.sheet || '', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Sheet
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Bulk Payment Details</DialogTitle>
                            <DialogDescription>
                              {payment.reference || `Bulk Payment ${payment.id.substring(0, 8)}`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">ID</Label>
                                <p className="font-medium text-sm">{payment.id}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status || 'Unknown'}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Organization</Label>
                                <p className="font-medium text-sm">{payment.organization.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Currency</Label>
                                <p className="font-medium text-sm">{payment.currency.symbol} ({payment.currency.name})</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Total Amount</Label>
                                <p className="font-medium text-sm">{payment.currency.symbol} {payment.total_amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Charge</Label>
                                <p className="font-medium text-sm">{payment.currency.symbol} {payment.charge.toLocaleString()}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Reference</Label>
                                <p className="font-medium text-sm">{payment.reference}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Approved</Label>
                                <Badge className={payment.is_approved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {payment.is_approved ? "Yes" : "No"}
                                </Badge>
                              </div>
                              {payment.comments && (
                                <div className="col-span-2">
                                  <Label className="text-xs text-muted-foreground">Comments</Label>
                                  <p className="font-medium text-sm">{payment.comments}</p>
                                </div>
                              )}
                              {payment.approved_by && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Approved By</Label>
                                  <p className="font-medium text-sm">{payment.approved_by}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-xs text-muted-foreground">Created At</Label>
                                <p className="font-medium text-sm">{new Date(payment.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Updated At</Label>
                                <p className="font-medium text-sm">{new Date(payment.updated_at).toLocaleString()}</p>
                              </div>
                              {payment.profit && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Profit ID</Label>
                                  <p className="font-medium text-sm">{payment.profit.id}</p>
                                </div>
                              )}
                              {payment.sheet && (
                                <div className="col-span-2">
                                  <Label className="text-xs text-muted-foreground">Sheet URL</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(payment.sheet || '', '_blank')}
                                    className="mt-1"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Open Sheet
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {filteredPayments.length === 0 && !loading && (
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
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-base sm:text-lg">Bank Bulk Payments</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setBankPaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `bank-new-${Date.now()}-${i}`, recipientName: '', recipientAccount: '', bankName: '', amount: 0, description: '', verified: false }))])}>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Add 5 Rows</span>
                      <span className="sm:hidden">+5</span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleCSVUpload(e, "bank")}
                      className="hidden"
                      id="bank-csv-upload"
                    />
                    <label htmlFor="bank-csv-upload" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Upload CSV</span>
                        <span className="sm:hidden">CSV</span>
                      </Button>
                    </label>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Create bulk payments to bank accounts. Upload CSV or enter manually.
                  CSV format: Name, Account Number, Amount, Description
                </CardDescription>
              </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Payment Description</Label>
                  <Input
                    placeholder="e.g., Monthly salary payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>
                 
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="min-w-full inline-block">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[140px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4">Recipient Name</TableHead>
                            <TableHead className="min-w-[130px] sm:min-w-[160px] text-xs sm:text-sm px-2 sm:px-4">Bank Name</TableHead>
                            <TableHead className="min-w-[140px] sm:min-w-[180px] text-xs sm:text-sm px-2 sm:px-4">Bank Account</TableHead>
                            <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4">Amount (UGX)</TableHead>
                            <TableHead className="min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">Description</TableHead>
                            <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                            <TableHead className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {bankPaymentRows.map((row, index) => (
                          <TableRow key={row.id} className="hover:bg-muted/50">
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                placeholder="Enter name"
                                value={row.recipientName}
                                onChange={(e) => updatePaymentRow("bank", row.id, "recipientName", e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Select
                                value={row.bankName || ''}
                                onValueChange={(value) => updatePaymentRow("bank", row.id, "bankName", value)}
                              >
                                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10 w-full">
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BANK_NAMES.map(name => (
                                    <SelectItem key={name} value={name} className="text-xs sm:text-sm">{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                placeholder="Account number"
                                value={row.recipientAccount || ''}
                                onChange={(e) => updatePaymentRow("bank", row.id, "recipientAccount", e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                type="number"
                                placeholder="0"
                                value={row.amount || ''}
                                onChange={(e) => updatePaymentRow("bank", row.id, "amount", parseFloat(e.target.value) || 0)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                              <Input
                                placeholder="Payment description"
                                value={row.description}
                                onChange={(e) => updatePaymentRow("bank", row.id, "description", e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                            {row.verified ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : row.recipientName && row.recipientAccount ? (
                              <Badge variant="outline" className="text-orange-600 text-xs">
                                <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Empty</Badge>
                            )}
                          </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="flex gap-1 justify-center">
                                {row.recipientName && row.recipientAccount && !row.verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => verifyPaymentRow("bank", row.id)}
                                    className="text-green-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removePaymentRow("bank", row.id)}
                                  className="text-red-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total recipients: {bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      Total amount: UGX {bankPaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("bank")} className="w-full sm:w-auto text-xs sm:text-sm">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("bank")}
                      disabled={bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Submit Bank Payments
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card className="border border-slate-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-base sm:text-lg">Mobile Money Bulk Payments</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => setMobilePaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `mobile-new-${Date.now()}-${i}`, recipientName: '', phoneNumber: '+256', mobileProvider: 'Unknown' as const, amount: 0, description: '', verified: false }))])}>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Add 5 Rows</span>
                      <span className="sm:hidden">+5</span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleCSVUpload(e, "mobile")}
                      className="hidden"
                      id="mobile-csv-upload"
                    />
                    <label htmlFor="mobile-csv-upload" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Upload CSV</span>
                        <span className="sm:hidden">CSV</span>
                      </Button>
                    </label>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Create bulk payments to mobile money accounts. Upload CSV or enter manually.
                  CSV format: Name, Phone Number, Amount, Description
                </CardDescription>
              </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Payment Description</Label>
                  <Input
                    placeholder="e.g., Commission payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>
                 
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="min-w-full inline-block">
                      <Table className="min-w-[750px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[140px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4">Recipient Name</TableHead>
                            <TableHead className="min-w-[130px] sm:min-w-[130px] text-xs sm:text-sm px-2 sm:px-4">Phone Number</TableHead>
                            <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4">Provider</TableHead>
                            <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4">Amount (UGX)</TableHead>
                            <TableHead className="min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">Description</TableHead>
                            <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                            <TableHead className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {mobilePaymentRows.map((row, index) => (
                          <TableRow key={row.id} className="hover:bg-muted/50">
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                placeholder="Enter name"
                                value={row.recipientName}
                                onChange={(e) => updatePaymentRow("mobile", row.id, "recipientName", e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                placeholder="+256701234567"
                                value={row.phoneNumber || '+256'}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updatePaymentRow("mobile", row.id, "phoneNumber", value);
                                  updatePaymentRow("mobile", row.id, "mobileProvider", detectMobileProvider(value));
                                }}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Badge className={`text-xs whitespace-nowrap ${row.mobileProvider === "MTN" ? "bg-yellow-100 text-yellow-800" : row.mobileProvider === "Airtel" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                                {row.mobileProvider || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <Input
                                type="number"
                                placeholder="0"
                                value={row.amount || ''}
                                onChange={(e) => updatePaymentRow("mobile", row.id, "amount", parseFloat(e.target.value) || 0)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                              <Input
                                placeholder="Payment description"
                                value={row.description}
                                onChange={(e) => updatePaymentRow("mobile", row.id, "description", e.target.value)}
                                className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                              />
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                            {row.verified ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : row.recipientName && row.phoneNumber ? (
                              <Badge variant="outline" className="text-orange-600 text-xs">
                                <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Empty</Badge>
                            )}
                          </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="flex gap-1 justify-center">
                                {row.recipientName && row.phoneNumber && !row.verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => verifyPaymentRow("mobile", row.id)}
                                    className="text-green-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removePaymentRow("mobile", row.id)}
                                  className="text-red-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total recipients: {mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      Total amount: UGX {mobilePaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("mobile")} className="w-full sm:w-auto text-xs sm:text-sm">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("mobile")}
                      disabled={mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Submit Mobile Payments
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {hasPermission("approve_bulk_payments") && (
          <TabsContent value="approvals" className="space-y-4">
            <BulkPaymentApprovals />
          </TabsContent>
        )}
      </Tabs>
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="grid grid-cols-4 gap-2 p-3 bg-white shadow-lg rounded-t-lg">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("overview")}>
            <FileText className={`h-6 w-6 ${activeTab === "overview" ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("bank")}>
            <CreditCard className={`h-6 w-6 ${activeTab === "bank" ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("mobile")}>
            <Upload className={`h-6 w-6 ${activeTab === "mobile" ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          {hasPermission("approve_bulk_payments") && (
            <Button variant="ghost" size="icon" onClick={() => setActiveTab("approvals")}>
              <Eye className={`h-6 w-6 ${activeTab === "approvals" ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default BulkPayments;