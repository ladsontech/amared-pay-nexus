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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";

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
  phoneNumber?: string;
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
  const [paymentType, setPaymentType] = useState<"bank" | "mobile">("bank");
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
        ...(type === "bank" ? { recipientAccount: "" } : { phoneNumber: "+256" }),
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPaymentRow = (type: "bank" | "mobile") => {
    const newRow: PaymentRow = {
      id: `${type}-row-${Date.now()}`,
      recipientName: "",
      ...(type === "bank" ? { recipientAccount: "" } : { phoneNumber: "+256" }),
      amount: 0,
      description: "",
      verified: false,
    };
    
    if (type === "bank") {
      setBankPaymentRows(prev => [...prev, newRow]);
    } else {
      setMobilePaymentRows(prev => [...prev, newRow]);
    }
  };

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
      description: "Payment row has been verified successfully",
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      const newRows: PaymentRow[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: `csv-${Date.now()}-${index}`,
            recipientName: values[0]?.trim() || "",
            ...(paymentType === "bank" 
              ? { recipientAccount: values[1]?.trim() || "" }
              : { phoneNumber: values[1]?.trim() || "+256" }
            ),
            amount: parseFloat(values[2]?.trim() || "0"),
            description: values[3]?.trim() || "",
            verified: false,
          };
        });

      if (paymentType === "bank") {
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

  const verifyAllPayments = (type: "bank" | "mobile") => {
    if (type === "bank") {
      setBankPaymentRows(prev => prev.map(row => ({ ...row, verified: true })));
    } else {
      setMobilePaymentRows(prev => prev.map(row => ({ ...row, verified: true })));
    }
    toast({
      title: "All Payments Verified",
      description: "All payment rows have been verified",
    });
  };

  const initiatePayments = () => {
    const currentRows = paymentType === "bank" ? bankPaymentRows : mobilePaymentRows;
    const filledRows = currentRows.filter(row => row.recipientName && row.amount > 0);
    const unverifiedRows = filledRows.filter(row => !row.verified);
    
    if (unverifiedRows.length > 0) {
      toast({
        title: "Verification Required",
        description: "Please verify all payment rows before initiating",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payments Initiated",
      description: `${paymentType === "bank" ? "Bank" : "Mobile"} bulk payment with ${filledRows.length} recipients has been submitted for approval`,
    });
    
    // Reset form
    if (paymentType === "bank") {
      setBankPaymentRows(Array.from({ length: 10 }, (_, index) => ({
        id: `bank-row-${index + 1}`,
        recipientName: "",
        recipientAccount: "",
        amount: 0,
        description: "",
        verified: false,
      })));
    } else {
      setMobilePaymentRows(Array.from({ length: 10 }, (_, index) => ({
        id: `mobile-row-${index + 1}`,
        recipientName: "",
        phoneNumber: "+256",
        amount: 0,
        description: "",
        verified: false,
      })));
    }
    setBulkDescription("");
    setActiveTab("overview");
  };

  const currentRows = paymentType === "bank" ? bankPaymentRows : mobilePaymentRows;
  const filledRows = currentRows.filter(row => row.recipientName && row.amount > 0);
  const totalAmount = filledRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bulk Payments</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and monitor your bulk payment transactions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', val); return p; }); }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto gap-1 sm:gap-0">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="create" className="text-xs sm:text-sm">Create Payment</TabsTrigger>
          {hasPermission("approve_bulk_payments") && (
            <TabsTrigger value="approvals" className="text-xs sm:text-sm">Approvals</TabsTrigger>
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

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Create Bulk Payment
              </CardTitle>
              <CardDescription>
                Add payment details manually or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={paymentType === "bank" ? "default" : "outline"}
                    onClick={() => setPaymentType("bank")}
                    className="flex-1"
                  >
                    Bank Transfer
                  </Button>
                  <Button
                    variant={paymentType === "mobile" ? "default" : "outline"}
                    onClick={() => setPaymentType("mobile")}
                    className="flex-1"
                  >
                    Mobile Money
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-description">Payment Description</Label>
                <Textarea
                  id="bulk-description"
                  placeholder="Enter description for this bulk payment batch..."
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => addPaymentRow(paymentType)} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Payment Row
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </Button>
                </div>

                {filledRows.length > 0 && (
                  <Button onClick={() => verifyAllPayments(paymentType)} variant="outline" className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Verify All
                  </Button>
                )}
              </div>

              {currentRows.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient Name</TableHead>
                          <TableHead>{paymentType === "bank" ? "Account Number" : "Phone Number"}</TableHead>
                          <TableHead>Amount (UGX)</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <Input
                                value={row.recipientName}
                                onChange={(e) => updatePaymentRow(paymentType, row.id, "recipientName", e.target.value)}
                                placeholder="Recipient name"
                                className="min-w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={paymentType === "bank" ? row.recipientAccount || "" : row.phoneNumber || ""}
                                onChange={(e) => updatePaymentRow(
                                  paymentType, 
                                  row.id, 
                                  paymentType === "bank" ? "recipientAccount" : "phoneNumber", 
                                  e.target.value
                                )}
                                placeholder={paymentType === "bank" ? "Account number" : "Phone number"}
                                className="min-w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={row.amount}
                                onChange={(e) => updatePaymentRow(paymentType, row.id, "amount", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="min-w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.description}
                                onChange={(e) => updatePaymentRow(paymentType, row.id, "description", e.target.value)}
                                placeholder="Payment description"
                                className="min-w-32"
                              />
                            </TableCell>
                            <TableCell>
                              {row.verified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {!row.verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => verifyPaymentRow(paymentType, row.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removePaymentRow(paymentType, row.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Total Recipients: {filledRows.length}</p>
                      <p className="text-lg font-bold">Total Amount: UGX {totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Payment Type: {paymentType === "bank" ? "Bank Transfer" : "Mobile Money"}</p>
                    </div>
                    <Button onClick={initiatePayments} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Initiate Payments
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {hasPermission("approve_bulk_payments") && (
          <TabsContent value="approvals" className="space-y-4">
            <BulkPaymentApprovals />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BulkPayments;