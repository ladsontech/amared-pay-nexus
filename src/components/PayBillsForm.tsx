import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet, DollarSign, Zap, Wifi, Droplets, Home } from "lucide-react";

interface PayBillsFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PayBillsForm = ({ isOpen, onClose }: PayBillsFormProps) => {
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentSource, setPaymentSource] = useState<"wallet" | "petty_cash">("wallet");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock balances - in real app, these would come from context/API
  const walletBalance = 12300000;
  const pettyCashBalance = 850000;

  const billTypes = [
    { 
      id: "electricity", 
      name: "Electricity", 
      icon: Zap, 
      provider: "UMEME",
      accountLabel: "Meter Number",
      placeholder: "Enter meter number"
    },
    { 
      id: "internet", 
      name: "Internet", 
      icon: Wifi, 
      provider: "MTN/Airtel",
      accountLabel: "Account Number",
      placeholder: "Enter account number"
    },
    { 
      id: "water", 
      name: "Water", 
      icon: Droplets, 
      provider: "NWSC",
      accountLabel: "Customer Number",
      placeholder: "Enter customer number"
    },
    { 
      id: "rent", 
      name: "Rent", 
      icon: Home, 
      provider: "Property Management",
      accountLabel: "Property ID",
      placeholder: "Enter property ID"
    }
  ];

  const selectedBillType = billTypes.find(bill => bill.id === selectedBill);
  const selectedBalance = paymentSource === "wallet" ? walletBalance : pettyCashBalance;
  const canAfford = amount ? parseFloat(amount) <= selectedBalance : true;
  const remainingBalance = amount ? selectedBalance - parseFloat(amount) : selectedBalance;

  const handlePayBill = async () => {
    if (!selectedBill || !amount || !accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Balance",
        description: `Insufficient ${paymentSource === "wallet" ? "wallet" : "petty cash"} balance for this payment`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bill Payment Successful",
        description: `${selectedBillType?.name} bill of UGX ${parseFloat(amount).toLocaleString()} has been paid successfully`,
        className: "border-green-200 bg-green-50 text-green-800",
      });

      // Reset form
      setSelectedBill("");
      setAmount("");
      setAccountNumber("");
      setPaymentSource("wallet");
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process bill payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pay Bills
          </DialogTitle>
          <DialogDescription>
            Pay utility bills and services using your available funds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Source Selection */}
          <div>
            <Label className="text-sm font-medium">Payment Source *</Label>
            <Select value={paymentSource} onValueChange={(value: "wallet" | "petty_cash") => setPaymentSource(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span>Main Wallet - UGX {(walletBalance / 1000000).toFixed(1)}M</span>
                  </div>
                </SelectItem>
                <SelectItem value="petty_cash">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Petty Cash - UGX {(pettyCashBalance / 1000).toFixed(0)}K</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bill Type Selection */}
          <div className="space-y-2">
            <Label>Select Bill Type</Label>
            <Select value={selectedBill} onValueChange={setSelectedBill}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {billTypes.map((bill) => (
                  <SelectItem key={bill.id} value={bill.id}>
                    <div className="flex items-center gap-2">
                      <bill.icon className="h-4 w-4 text-blue-600" />
                      <span>{bill.name} - {bill.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                Available Balance:
              </span>
              <span className="font-bold text-blue-600">
                UGX {selectedBalance.toLocaleString()}
              </span>
            </div>
            {amount && canAfford && (
              <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-blue-200">
                <span className="text-gray-700">Balance after payment:</span>
                <span className="font-bold text-black">UGX {remainingBalance.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Account Number */}
          {selectedBillType && (
            <div className="space-y-2">
              <Label>{selectedBillType.accountLabel}</Label>
              <Input
                placeholder={selectedBillType.placeholder}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-white"
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (UGX)</Label>
            <Input
              type="number"
              placeholder="Enter bill amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white"
            />
            {amount && !canAfford && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ Insufficient {paymentSource === "wallet" ? "wallet" : "petty cash"} balance
                </p>
                <p className="text-xs text-red-600">
                  Available: UGX {selectedBalance.toLocaleString()} | Required: UGX {parseFloat(amount).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Confirmation */}
          {amount && canAfford && selectedBill && accountNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-black mb-2">Payment Summary</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-medium text-black">{selectedBillType?.name} ({selectedBillType?.provider})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-black">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-black">UGX {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Source:</span>
                  <span className="font-medium text-black">
                    {paymentSource === "wallet" ? "Main Wallet" : "Petty Cash"}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-green-300">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-bold text-green-700">UGX {remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayBill} 
            disabled={!selectedBill || !amount || !accountNumber || !canAfford || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Pay UGX ${amount ? parseFloat(amount).toLocaleString() : '0'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillsForm;