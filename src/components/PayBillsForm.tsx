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
          {/* Payment Source Selection - Enhanced */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Payment Source</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all border-2 ${
                  paymentSource === "wallet" 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => setPaymentSource("wallet")}
              >
                <CardContent className="p-4 text-center">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-black">Main Wallet</p>
                  <p className="text-lg font-bold text-blue-600">UGX {(walletBalance / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600">Available balance</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all border-2 ${
                  paymentSource === "petty_cash" 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => setPaymentSource("petty_cash")}
              >
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-black">Petty Cash</p>
                  <p className="text-lg font-bold text-blue-600">UGX {(pettyCashBalance / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600">Available balance</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Selected Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                Paying from: <span className="font-semibold text-black">
                  {paymentSource === "wallet" ? "Main Wallet" : "Petty Cash"}
                </span>
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

          {/* Bill Type Selection - Enhanced */}
          <div className="space-y-2">
            <Label>Select Bill Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {billTypes.map((bill) => (
                <Card
                  key={bill.id}
                  className={`cursor-pointer transition-all border ${
                    selectedBill === bill.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedBill(bill.id)}
                >
                  <CardContent className="p-3 text-center">
                    <bill.icon className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-xs font-medium text-black">{bill.name}</p>
                    <p className="text-xs text-gray-600">{bill.provider}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
      </Dialog>
    );
};

export default PayBillsForm;