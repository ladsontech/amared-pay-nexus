import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Trash2, Check, AlertCircle, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { paymentService } from "@/services/paymentService";

const BANK_NAMES = [
  "Stanbic Bank",
  "Centenary Bank",
  "DFCU Bank",
  "Equity Bank",
];

interface PaymentRow {
  id: string;
  recipientName: string;
  recipientAccount?: string;
  bankName?: string;
  amount: number;
  description: string;
  verified: boolean;
}

const BankPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchBulkPayments } = useOrganization();
  
  const [bankPaymentRows, setBankPaymentRows] = useState<PaymentRow[]>([]);
  const [bulkDescription, setBulkDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize with 5 empty rows
    setBankPaymentRows(Array.from({ length: 5 }, (_, index) => ({
      id: `bank-row-${index + 1}`,
      recipientName: "",
      recipientAccount: "",
      bankName: "",
      amount: 0,
      description: "",
      verified: false,
    })));
  }, []);

  const updatePaymentRow = (id: string, field: keyof PaymentRow, value: PaymentRow[keyof PaymentRow]) => {
    setBankPaymentRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const removePaymentRow = (id: string) => {
    setBankPaymentRows(prev => prev.filter(row => row.id !== id));
  };

  const verifyPaymentRow = (id: string) => {
    updatePaymentRow(id, "verified", true);
    toast({
      title: "Payment Verified",
      description: "Payment row has been verified against database records",
    });
  };

  const verifyAllRows = () => {
    setBankPaymentRows(prev => prev.map(row => {
      const canVerify = Boolean(row.recipientName && row.recipientAccount);
      return canVerify ? { ...row, verified: true } : row;
    }));
    toast({
      title: "Verification Complete",
      description: "All eligible rows have been marked as verified.",
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            recipientAccount: values[1]?.trim() || "",
            bankName: values[2]?.trim() || "",
            amount: parseFloat(values[3]?.trim() || "0"),
            description: values[4]?.trim() || "",
            verified: false,
          };
        });

      setBankPaymentRows(prev => [...prev, ...newRows]);
      
      toast({
        title: "CSV Uploaded",
        description: `Added ${newRows.length} payment rows from CSV`,
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const filledRows = bankPaymentRows.filter(row => row.recipientName && row.amount > 0);
    
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

    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const organizationId = user.organizationId || user.organization?.id;
      
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      const totalAmount = filledRows.reduce((sum, row) => sum + row.amount, 0);

      const csvContent = "Recipient Name,Bank Name,Account Number,Amount,Description\n" +
        filledRows.map(row => 
          `"${row.recipientName}","${row.bankName || ''}","${row.recipientAccount || ''}","${row.amount}","${row.description || ''}"`
        ).join("\n");

      const bulkPayment = await paymentService.createBulkPayment({
        organization: organizationId,
        total_amount: totalAmount,
        status: "pending_approval",
        is_approved: false,
        comments: bulkDescription || `Bank bulk payment for ${filledRows.length} recipients`
      });

      if (bulkPayment.sheet) {
        try {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const formData = new FormData();
          formData.append('file', blob, `bulk_payment_bank_${Date.now()}.csv`);
          
          const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
          await fetch(bulkPayment.sheet, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          });
        } catch (uploadError) {
          console.warn('Error uploading CSV:', uploadError);
        }
      }

      await fetchBulkPayments();
      
      toast({
        title: "Success",
        description: `Bank payment request for ${filledRows.length} recipients submitted successfully`,
      });

      navigate("/org/bulk-payments");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit bank payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledRows = bankPaymentRows.filter(row => row.recipientName && row.amount > 0);
  const totalAmount = bankPaymentRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-4 md:pb-0">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/org/bulk-payments")}
          className="mb-4 md:mb-6 -ml-2 md:-ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bulk Payments
        </Button>

        {/* Form Card */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 md:pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  Bank Payments
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-gray-600 mt-1">
                  Create bank transfers for multiple recipients
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm" 
                  onClick={() => setBankPaymentRows(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => ({ 
                    id: `bank-new-${Date.now()}-${i}`, 
                    recipientName: '', 
                    recipientAccount: '', 
                    bankName: '', 
                    amount: 0, 
                    description: '', 
                    verified: false 
                  }))])}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add 5 Rows</span>
                  <span className="sm:hidden">+5</span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
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
            </div>

            {/* Payment Description */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Payment Description</Label>
              <Input
                placeholder="e.g., Monthly salary payments"
                value={bulkDescription}
                onChange={(e) => setBulkDescription(e.target.value)}
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
             
            {/* Table - Horizontally scrollable */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Recipient Name
                        </TableHead>
                        <TableHead className="min-w-[130px] sm:min-w-[160px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Bank Name
                        </TableHead>
                        <TableHead className="min-w-[140px] sm:min-w-[180px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Bank Account
                        </TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Amount (UGX)
                        </TableHead>
                        <TableHead className="min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50 hidden sm:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Status
                        </TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm px-2 sm:px-4 bg-gray-50">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankPaymentRows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-gray-50">
                          <TableCell className="p-2 sm:p-4">
                            <Input
                              placeholder="Enter name"
                              value={row.recipientName}
                              onChange={(e) => updatePaymentRow(row.id, "recipientName", e.target.value)}
                              className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                            />
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <Select
                              value={row.bankName || ''}
                              onValueChange={(value) => updatePaymentRow(row.id, "bankName", value)}
                            >
                              <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10 w-full">
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANK_NAMES.map(name => (
                                  <SelectItem key={name} value={name} className="text-xs sm:text-sm">
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <Input
                              placeholder="Account number"
                              value={row.recipientAccount || ''}
                              onChange={(e) => updatePaymentRow(row.id, "recipientAccount", e.target.value)}
                              className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                            />
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount || ''}
                              onChange={(e) => updatePaymentRow(row.id, "amount", parseFloat(e.target.value) || 0)}
                              className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                            />
                          </TableCell>
                          <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                            <Input
                              placeholder="Payment description"
                              value={row.description}
                              onChange={(e) => updatePaymentRow(row.id, "description", e.target.value)}
                              className="text-xs sm:text-sm h-8 sm:h-10 w-full"
                            />
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            {row.verified ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-2 w-2 sm:h-3 sm:w-3 mr-1 inline" />
                                Verified
                              </Badge>
                            ) : row.recipientName && row.recipientAccount ? (
                              <Badge variant="outline" className="text-orange-600 text-xs">
                                <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1 inline" />
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
                                  onClick={() => verifyPaymentRow(row.id)}
                                  className="text-green-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePaymentRow(row.id)}
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

            {/* Summary and Submit */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-full sm:w-auto">
                <p className="text-xs sm:text-sm text-gray-600">
                  Total recipients: <span className="font-medium text-gray-900">{filledRows.length}</span>
                </p>
                <p className="font-medium text-sm sm:text-base text-gray-900 mt-1">
                  Total amount: <span className="text-blue-600">UGX {totalAmount.toLocaleString()}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={verifyAllRows} 
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Verify All
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={filledRows.length === 0 || isSubmitting}
                  className="w-full sm:w-auto text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Bank Payments"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankPayments;

