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
import { Plus, Search, Filter, Download, Eye, CreditCard, Upload, Trash2, Check, AlertCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";

// Add shared bank names used for selection
const BANK_NAMES = [
  "Stanbic Bank",
  "Centenary Bank",
  "DFCU Bank",
  "Equity Bank",
];

interface BulkPayment {
  id: string;
  amount: number;
  recipients: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  description: string;
}

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
  const [payments, setPayments] = useState<BulkPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bankPaymentRows, setBankPaymentRows] = useState<PaymentRow[]>([]);
  const [mobilePaymentRows, setMobilePaymentRows] = useState<PaymentRow[]>([]);
  const [bulkDescription, setBulkDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching bulk payments
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updatePaymentRow = (type: "bank" | "mobile", id: string, field: keyof PaymentRow, value: any) => {
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

  const handleSubmitBulkPayment = (type: "bank" | "mobile") => {
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

    // Add new payment to the list
    const newPayment: BulkPayment = {
      id: `BP${Date.now()}`,
      amount: filledRows.reduce((sum, row) => sum + row.amount, 0),
      recipients: filledRows.length,
      status: "pending",
      createdAt: new Date().toISOString(),
      description: bulkDescription || `${type} bulk payment`,
    };

    setPayments(prev => [newPayment, ...prev]);
    
    toast({
      title: "Bulk Payment Submitted",
      description: `${type === "bank" ? "Bank" : "Mobile money"} payment for ${filledRows.length} recipients submitted for approval`,
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
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bulk Payments</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and monitor your bulk payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission("view_department_reports") && (
            <Button variant="outline" asChild>
              <Link to="/org/reports?tab=bulk-payments" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>View Bulk Payments Report</span>
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
                <Card key={payment.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] shadow-md border-0 bg-gradient-to-br from-card to-card/80">
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
                        <span className="text-sm sm:text-base font-medium">UGX {payment.amount.toLocaleString()}</span>
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
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card className="shadow-md border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Bank Bulk Payments</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBankPaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `bank-new-${Date.now()}-${i}`, recipientName: '', recipientAccount: '', bankName: '', amount: 0, description: '', verified: false }))])}>
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add 5 Rows</span>
                    <span className="sm:hidden">Add 5</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCSVUpload(e, "bank")}
                    className="hidden"
                    id="bank-csv-upload"
                  />
                  <label htmlFor="bank-csv-upload">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Upload CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                  </label>
                </div>
              </CardTitle>
              <CardDescription>
                Create bulk payments to bank accounts. Upload CSV or enter manually.
                CSV format: Name, Account Number, Amount, Description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Description</Label>
                  <Input
                    placeholder="e.g., Monthly salary payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                  />
                </div>
                 
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Recipient Name</TableHead>
                          <TableHead className="min-w-[160px]">Bank Name</TableHead>
                          <TableHead className="min-w-[180px]">Bank Account</TableHead>
                          <TableHead className="min-w-[120px]">Amount (UGX)</TableHead>
                          <TableHead className="min-w-[150px]">Description</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {bankPaymentRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input
                              placeholder="Enter name"
                              value={row.recipientName}
                              onChange={(e) => updatePaymentRow("bank", row.id, "recipientName", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.bankName || ''}
                              onValueChange={(value) => updatePaymentRow("bank", row.id, "bankName", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANK_NAMES.map(name => (
                                  <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Account number"
                              value={row.recipientAccount || ''}
                              onChange={(e) => updatePaymentRow("bank", row.id, "recipientAccount", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount || ''}
                              onChange={(e) => updatePaymentRow("bank", row.id, "amount", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Payment description"
                              value={row.description}
                              onChange={(e) => updatePaymentRow("bank", row.id, "description", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            {row.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : row.recipientName && row.recipientAccount ? (
                              <Badge variant="outline" className="text-orange-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline">Empty</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {row.recipientName && row.recipientAccount && !row.verified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyPaymentRow("bank", row.id)}
                                  className="text-green-600"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePaymentRow("bank", row.id)}
                                className="text-red-600"
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total recipients: {bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium">
                      Total amount: UGX {bankPaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("bank")} className="w-full sm:w-auto">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("bank")}
                      disabled={bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto"
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
          <Card className="shadow-md border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Mobile Money Bulk Payments</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setMobilePaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `mobile-new-${Date.now()}-${i}`, recipientName: '', phoneNumber: '+256', mobileProvider: 'Unknown' as const, amount: 0, description: '', verified: false }))])}>
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add 5 Rows</span>
                    <span className="sm:hidden">Add 5</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCSVUpload(e, "mobile")}
                    className="hidden"
                    id="mobile-csv-upload"
                  />
                  <label htmlFor="mobile-csv-upload">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Upload CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                  </label>
                </div>
              </CardTitle>
              <CardDescription>
                Create bulk payments to mobile money accounts. Upload CSV or enter manually.
                CSV format: Name, Phone Number, Amount, Description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Description</Label>
                  <Input
                    placeholder="e.g., Commission payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                  />
                </div>
                 
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Recipient Name</TableHead>
                          <TableHead className="min-w-[130px]">Phone Number</TableHead>
                          <TableHead className="min-w-[100px]">Provider</TableHead>
                          <TableHead className="min-w-[120px]">Amount (UGX)</TableHead>
                          <TableHead className="min-w-[150px]">Description</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {mobilePaymentRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input
                              placeholder="Enter name"
                              value={row.recipientName}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "recipientName", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="+256701234567"
                              value={row.phoneNumber || '+256'}
                              onChange={(e) => {
                                const value = e.target.value;
                                updatePaymentRow("mobile", row.id, "phoneNumber", value);
                                updatePaymentRow("mobile", row.id, "mobileProvider", detectMobileProvider(value));
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={row.mobileProvider === "MTN" ? "bg-yellow-100 text-yellow-800" : row.mobileProvider === "Airtel" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                              {row.mobileProvider || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount || ''}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "amount", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Payment description"
                              value={row.description}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "description", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            {row.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : row.recipientName && row.phoneNumber ? (
                              <Badge variant="outline" className="text-orange-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline">Empty</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {row.recipientName && row.phoneNumber && !row.verified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyPaymentRow("mobile", row.id)}
                                  className="text-green-600"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePaymentRow("mobile", row.id)}
                                className="text-red-600"
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total recipients: {mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium">
                      Total amount: UGX {mobilePaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("mobile")} className="w-full sm:w-auto">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("mobile")}
                      disabled={mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto"
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