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
import { Plus, Search, Filter, Download, Eye, CreditCard, Upload, Trash2, Check, AlertCircle, FileText, Users, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";
import PayBillsForm from "@/components/PayBillsForm";

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

interface PaymentRecipient {
  id: string;
  name: string;
  account: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  processedAt?: string;
  failureReason?: string;
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
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<BulkPayment | null>(null);
  const [paymentRecipients, setPaymentRecipients] = useState<PaymentRecipient[]>([]);
  const [showPayBills, setShowPayBills] = useState(false);

  // Mock recipient data for demonstration
  const mockRecipients: Record<string, PaymentRecipient[]> = {
    "BP001": [
      { id: "R001", name: "John Doe", account: "1234567890", amount: 1500000, status: "completed", processedAt: "2024-01-15T10:35:00Z" },
      { id: "R002", name: "Jane Smith", account: "0987654321", amount: 1200000, status: "completed", processedAt: "2024-01-15T10:36:00Z" },
      { id: "R003", name: "Bob Wilson", account: "1122334455", amount: 1800000, status: "failed", failureReason: "Invalid account number" },
      { id: "R004", name: "Alice Brown", account: "5566778899", amount: 1400000, status: "pending" },
      { id: "R005", name: "Charlie Davis", account: "9988776655", amount: 1600000, status: "completed", processedAt: "2024-01-15T10:38:00Z" }
    ],
    "BP002": [
      { id: "R006", name: "Vendor A Ltd", account: "1111222233", amount: 500000, status: "completed", processedAt: "2024-01-14T14:25:00Z" },
      { id: "R007", name: "Vendor B Co", account: "4444555566", amount: 300000, status: "pending" },
      { id: "R008", name: "Vendor C Inc", account: "7777888899", amount: 750000, status: "completed", processedAt: "2024-01-14T14:27:00Z" }
    ],
    "BP003": [
      { id: "R009", name: "Agent 1", account: "+256701234567", amount: 150000, status: "pending" },
      { id: "R010", name: "Agent 2", account: "+256789012345", amount: 200000, status: "pending" },
      { id: "R011", name: "Agent 3", account: "+256700111222", amount: 180000, status: "pending" }
    ]
  };

  useEffect(() => {
    // Simulate fetching bulk payments
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setPayments([
            {
              id: "BP001",
              amount: 8500000,
              recipients: 5,
              status: "completed",
              createdAt: "2024-01-15T10:30:00Z",
              description: "Monthly Salary Payment",
            },
            {
              id: "BP002",
              amount: 1550000,
              recipients: 3,
              status: "processing",
              createdAt: "2024-01-14T14:20:00Z",
              description: "Vendor Payments Q1",
            },
            {
              id: "BP003",
              amount: 530000,
              recipients: 3,
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
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-blue-50 text-blue-600";
      case "pending":
        return "bg-gray-100 text-gray-800";
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

  const handleViewRecipients = (payment: BulkPayment) => {
    setSelectedPaymentDetails(payment);
    setPaymentRecipients(mockRecipients[payment.id] || []);
  };

  const getRecipientStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Bulk Payments</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage and monitor your bulk payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission("view_department_reports") && (
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link to="/org/reports/bulk-payments" className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Reports</span>
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPayBills(true)} className="text-xs">
            <Receipt className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Pay Bills</span>
            <span className="sm:hidden">Bills</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', val); return p; }); }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs px-2 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="bank" className="text-xs px-2 py-1.5">Bank</TabsTrigger>
          <TabsTrigger value="mobile" className="text-xs px-2 py-1.5">Mobile</TabsTrigger>
          {hasPermission("approve_bulk_payments") && (
            <TabsTrigger value="approvals" className="text-xs px-2 py-1.5">Approvals</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Filter className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow border border-gray-200 bg-white">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-black">{payment.id}</CardTitle>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-gray-600 line-clamp-2">{payment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-medium text-black">UGX {(payment.amount / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Recipients</span>
                        <span className="font-medium text-black">{payment.recipients}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Created</span>
                        <span className="font-medium text-black">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs h-7"
                          onClick={() => handleViewRecipients(payment)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Recipients
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPayments.length === 0 && !isLoading && (
            <Card className="border border-gray-200">
              <CardContent className="text-center py-6">
                <div className="text-gray-600">
                  <CreditCard className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <h3 className="text-sm font-medium mb-1 text-black">No bulk payments found</h3>
                  <p className="text-xs">Create your first bulk payment to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bank" className="space-y-3">
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="p-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="text-black">Bank Bulk Payments</span>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={() => setBankPaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `bank-new-${Date.now()}-${i}`, recipientName: '', recipientAccount: '', bankName: '', amount: 0, description: '', verified: false }))])} className="text-xs h-7">
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Add 5</span>
                    <span className="sm:hidden">+5</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCSVUpload(e, "bank")}
                    className="hidden"
                    id="bank-csv-upload"
                  />
                  <label htmlFor="bank-csv-upload">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <Upload className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">CSV</span>
                      <span className="sm:hidden">↑</span>
                    </Button>
                  </label>
                </div>
              </CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Create bulk payments to bank accounts. CSV format: Name, Account, Amount, Description
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Payment Description</Label>
                  <Input
                    placeholder="e.g., Monthly salary payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                 
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px] text-xs p-2">Name</TableHead>
                          <TableHead className="min-w-[100px] text-xs p-2">Bank</TableHead>
                          <TableHead className="min-w-[120px] text-xs p-2">Account</TableHead>
                          <TableHead className="min-w-[80px] text-xs p-2">Amount</TableHead>
                          <TableHead className="min-w-[100px] text-xs p-2">Description</TableHead>
                          <TableHead className="min-w-[70px] text-xs p-2">Status</TableHead>
                          <TableHead className="min-w-[80px] text-xs p-2">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {bankPaymentRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Enter name"
                              value={row.recipientName}
                              onChange={(e) => updatePaymentRow("bank", row.id, "recipientName", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Select
                              value={row.bankName || ''}
                              onValueChange={(value) => updatePaymentRow("bank", row.id, "bankName", value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANK_NAMES.map(name => (
                                  <SelectItem key={name} value={name} className="text-xs">{name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Account number"
                              value={row.recipientAccount || ''}
                              onChange={(e) => updatePaymentRow("bank", row.id, "recipientAccount", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount || ''}
                              onChange={(e) => updatePaymentRow("bank", row.id, "amount", parseFloat(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Description"
                              value={row.description}
                              onChange={(e) => updatePaymentRow("bank", row.id, "description", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            {row.verified ? (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Check className="h-2 w-2 mr-1" />
                                OK
                              </Badge>
                            ) : row.recipientName && row.recipientAccount ? (
                              <Badge variant="outline" className="text-gray-600 text-xs">
                                <AlertCircle className="h-2 w-2 mr-1" />
                                Wait
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Empty</Badge>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-1">
                              {row.recipientName && row.recipientAccount && !row.verified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyPaymentRow("bank", row.id)}
                                  className="text-blue-600 h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePaymentRow("bank", row.id)}
                                className="text-red-600 h-6 w-6 p-0"
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">
                      Recipients: {bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium text-sm text-black">
                      Total: UGX {bankPaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("bank")} className="w-full sm:w-auto text-xs h-8">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("bank")}
                      disabled={bankPaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto text-xs h-8"
                    >
                      Submit Bank Payments
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-3">
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="p-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="text-black">Mobile Money Bulk Payments</span>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={() => setMobilePaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ id: `mobile-new-${Date.now()}-${i}`, recipientName: '', phoneNumber: '+256', mobileProvider: 'Unknown' as const, amount: 0, description: '', verified: false }))])} className="text-xs h-7">
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Add 5</span>
                    <span className="sm:hidden">+5</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleCSVUpload(e, "mobile")}
                    className="hidden"
                    id="mobile-csv-upload"
                  />
                  <label htmlFor="mobile-csv-upload">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <Upload className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">CSV</span>
                      <span className="sm:hidden">↑</span>
                    </Button>
                  </label>
                </div>
              </CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Create bulk payments to mobile money accounts. CSV format: Name, Phone, Amount, Description
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Payment Description</Label>
                  <Input
                    placeholder="e.g., Commission payments"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                 
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px] text-xs p-2">Name</TableHead>
                          <TableHead className="min-w-[100px] text-xs p-2">Phone</TableHead>
                          <TableHead className="min-w-[70px] text-xs p-2">Provider</TableHead>
                          <TableHead className="min-w-[80px] text-xs p-2">Amount</TableHead>
                          <TableHead className="min-w-[100px] text-xs p-2">Description</TableHead>
                          <TableHead className="min-w-[70px] text-xs p-2">Status</TableHead>
                          <TableHead className="min-w-[80px] text-xs p-2">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {mobilePaymentRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Enter name"
                              value={row.recipientName}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "recipientName", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="+256701234567"
                              value={row.phoneNumber || '+256'}
                              onChange={(e) => {
                                const value = e.target.value;
                                updatePaymentRow("mobile", row.id, "phoneNumber", value);
                                updatePaymentRow("mobile", row.id, "mobileProvider", detectMobileProvider(value));
                              }}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge className={row.mobileProvider === "MTN" ? "bg-blue-100 text-blue-800 text-xs" : row.mobileProvider === "Airtel" ? "bg-gray-100 text-gray-800 text-xs" : "bg-gray-100 text-gray-800 text-xs"}>
                              {row.mobileProvider || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount || ''}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "amount", parseFloat(e.target.value) || 0)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Description"
                              value={row.description}
                              onChange={(e) => updatePaymentRow("mobile", row.id, "description", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            {row.verified ? (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Check className="h-2 w-2 mr-1" />
                                OK
                              </Badge>
                            ) : row.recipientName && row.phoneNumber ? (
                              <Badge variant="outline" className="text-gray-600 text-xs">
                                <AlertCircle className="h-2 w-2 mr-1" />
                                Wait
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Empty</Badge>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-1">
                              {row.recipientName && row.phoneNumber && !row.verified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyPaymentRow("mobile", row.id)}
                                  className="text-blue-600 h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePaymentRow("mobile", row.id)}
                                className="text-red-600 h-6 w-6 p-0"
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">
                      Recipients: {mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length}
                    </p>
                    <p className="font-medium text-sm text-black">
                      Total: UGX {mobilePaymentRows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => verifyAllRows("mobile")} className="w-full sm:w-auto text-xs h-8">
                      Verify All
                    </Button>
                    <Button 
                      onClick={() => handleSubmitBulkPayment("mobile")}
                      disabled={mobilePaymentRows.filter(row => row.recipientName && row.amount > 0).length === 0}
                      className="w-full sm:w-auto text-xs h-8"
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
          <TabsContent value="approvals" className="space-y-3">
            <BulkPaymentApprovals />
          </TabsContent>
        )}
      </Tabs>

      {/* Recipients Detail Modal */}
      <Dialog open={!!selectedPaymentDetails} onOpenChange={(open) => !open && setSelectedPaymentDetails(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Users className="h-4 w-4 text-blue-600" />
              Payment Recipients - {selectedPaymentDetails?.id}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedPaymentDetails?.description} • {paymentRecipients.length} recipients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-bold text-blue-600">
                  {paymentRecipients.filter(r => r.status === "completed").length}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-800">
                  {paymentRecipients.filter(r => r.status === "pending").length}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-lg font-bold text-red-600">
                  {paymentRecipients.filter(r => r.status === "failed").length}
                </p>
              </div>
            </div>

            {/* Recipients Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-medium p-2">Recipient</TableHead>
                    <TableHead className="text-xs font-medium p-2">Account</TableHead>
                    <TableHead className="text-xs font-medium p-2">Amount</TableHead>
                    <TableHead className="text-xs font-medium p-2">Status</TableHead>
                    <TableHead className="text-xs font-medium p-2">Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRecipients.map((recipient) => (
                    <TableRow key={recipient.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs font-medium p-2 text-black">{recipient.name}</TableCell>
                      <TableCell className="text-xs font-mono p-2 text-gray-600">{recipient.account}</TableCell>
                      <TableCell className="text-xs p-2 text-black">UGX {recipient.amount.toLocaleString()}</TableCell>
                      <TableCell className="p-2">
                        <Badge className={getRecipientStatusColor(recipient.status)}>
                          {recipient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 p-2">
                        {recipient.processedAt 
                          ? new Date(recipient.processedAt).toLocaleString()
                          : recipient.failureReason || "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Bills Modal */}
      <PayBillsForm isOpen={showPayBills} onClose={() => setShowPayBills(false)} />

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 p-2">
        <div className="grid grid-cols-4 gap-1">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("overview")}
            className="flex flex-col items-center gap-1 h-12 text-xs"
          >
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </Button>
          <Button 
            variant={activeTab === "bank" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("bank")}
            className="flex flex-col items-center gap-1 h-12 text-xs"
          >
            <CreditCard className="h-4 w-4" />
            <span>Bank</span>
          </Button>
          <Button 
            variant={activeTab === "mobile" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("mobile")}
            className="flex flex-col items-center gap-1 h-12 text-xs"
          >
            <Upload className="h-4 w-4" />
            <span>Mobile</span>
          </Button>
          {hasPermission("approve_bulk_payments") && (
            <Button 
              variant={activeTab === "approvals" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveTab("approvals")}
              className="flex flex-col items-center gap-1 h-12 text-xs"
            >
              <Eye className="h-4 w-4" />
              <span>Approvals</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkPayments;