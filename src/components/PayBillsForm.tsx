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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pay Bills
          </DialogTitle>
          <DialogDescription>
            Pay utility bills using your wallet or petty cash balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Source Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Card 
              className={`cursor-pointer transition-all ${
                paymentSource === "wallet" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentSource("wallet")}
            >
              <CardContent className="p-3 text-center">
                <Wallet className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">Wallet</p>
                <p className="text-xs text-gray-600">UGX {(walletBalance / 1000000).toFixed(1)}M</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all ${
                paymentSource === "petty_cash" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentSource("petty_cash")}
            >
              <CardContent className="p-3 text-center">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">Petty Cash</p>
                <p className="text-xs text-gray-600">UGX {(pettyCashBalance / 1000).toFixed(0)}K</p>
              </CardContent>
            </Card>
          </div>

          {/* Bill Type Selection */}
          <div className="space-y-2">
            <Label>Bill Type</Label>
            <Select value={selectedBill} onValueChange={setSelectedBill}>
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {billTypes.map((bill) => (
                  <SelectItem key={bill.id} value={bill.id}>
                    <div className="flex items-center gap-2">
                      <bill.icon className="h-4 w-4" />
                      <span>{bill.name} ({bill.provider})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Number */}
          {selectedBillType && (
            <div className="space-y-2">
              <Label>{selectedBillType.accountLabel}</Label>
              <Input
                placeholder={selectedBillType.placeholder}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (UGX)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount && !canAfford && (
              <p className="text-xs text-red-600">
                Insufficient {paymentSource === "wallet" ? "wallet" : "petty cash"} balance
              </p>
            )}
          </div>

          {/* Balance Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Available Balance:</span>
              <span className="font-medium">UGX {selectedBalance.toLocaleString()}</span>
            </div>
            {amount && canAfford && (
              <div className="flex justify-between text-sm mt-1">
                <span>Balance After Payment:</span>
                <span className="font-medium">UGX {(selectedBalance - parseFloat(amount)).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayBill} 
            disabled={!selectedBill || !amount || !accountNumber || !canAfford || isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillsForm;