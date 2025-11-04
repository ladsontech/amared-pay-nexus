import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet, DollarSign, Zap, Wifi, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { organizationService } from "@/services/organizationService";

interface PayBillsFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PayBillsForm = ({ isOpen, onClose }: PayBillsFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallets } = useOrganization();
  const [selectedBill, setSelectedBill] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentSource, setPaymentSource] = useState<"main_wallet" | "petty_cash_wallet">("main_wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pettyCashWallets, setPettyCashWallets] = useState<any[]>([]);

  // Fetch real wallet balances
  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.organizationId) return;
      
      try {
        // Fetch main wallets
        const walletsResponse = await organizationService.getWallets({
          organization: user.organizationId,
          limit: 10
        });
        
        // Fetch petty cash wallets
        const pettyCashResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 10
        });
        
        setPettyCashWallets(pettyCashResponse.results);
      } catch (error) {
        console.error("Error fetching wallets:", error);
      }
    };

    if (isOpen) {
      fetchWallets();
    }
  }, [user?.organizationId, isOpen]);

  // Get main wallet (non-petty cash wallet) - fetch directly from API
  const [mainWallets, setMainWallets] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMainWallets = async () => {
      if (!user?.organizationId || !isOpen) return;
      
      try {
        const response = await organizationService.getWallets({
          organization: user.organizationId,
          limit: 10
        });
        setMainWallets(response.results);
      } catch (error) {
        console.error("Error fetching main wallets:", error);
      }
    };

    fetchMainWallets();
  }, [user?.organizationId, isOpen]);

  // Get main wallet (non-petty cash wallet)
  const mainWallet = mainWallets.find(w => !w.petty_cash_wallet);
  const pettyCashWallet = pettyCashWallets[0];

  // Get balances from API - ensure we're using real values
  const walletBalance = mainWallet?.balance ?? 0;
  const pettyCashBalance = pettyCashWallet?.balance ?? 0;
  const selectedBalance = paymentSource === "main_wallet" ? walletBalance : pettyCashBalance;
  const selectedCurrency = paymentSource === "main_wallet" 
    ? (mainWallet?.currency?.symbol || mainWallet?.currency?.name || "UGX")
    : (pettyCashWallet?.currency?.symbol || pettyCashWallet?.currency?.name || "UGX");

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
      id: "airtime", 
      name: "Airtime", 
      icon: Receipt, 
      provider: "Mobile Network",
      accountLabel: "Phone Number",
      placeholder: "Enter phone number"
    }
  ];

  const selectedBillType = billTypes.find(bill => bill.id === selectedBill);
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

    if (!user?.organizationId) {
      toast({
        title: "Error",
        description: "Organization ID not found",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Balance",
        description: `Insufficient ${paymentSource === "main_wallet" ? "wallet" : "petty cash"} balance for this payment`,
        variant: "destructive",
      });
      return;
    }

    // Ensure we have the selected wallet
    const selectedWallet = paymentSource === "main_wallet" ? mainWallet : pettyCashWallet;
    if (!selectedWallet) {
      toast({
        title: "Error",
        description: `No ${paymentSource === "main_wallet" ? "main" : "petty cash"} wallet found. Please ensure your organization has a wallet set up.`,
        variant: "destructive",
      });
      return;
    }

    // Validate currency exists
    if (!selectedWallet.currency || !selectedWallet.currency.id) {
      toast({
        title: "Error",
        description: "Wallet currency information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create bill payment
      await organizationService.createBillPayment({
        organization: user.organizationId,
        currency: selectedWallet.currency.id,
        biller_name: selectedBillType?.provider || selectedBillType?.name || "Unknown",
        account_number: accountNumber.trim(),
        amount: Math.round(parseFloat(amount)),
        type: selectedBill as "electricity" | "water" | "internet" | "airtime" | null,
        wallet_type: paymentSource,
        status: "pending",
        reference: null
      });
      
      toast({
        title: "Bill Payment Submitted",
        description: `${selectedBillType?.name} bill of ${selectedCurrency} ${parseFloat(amount).toLocaleString()} has been submitted successfully`,
      });

      // Reset form
      setSelectedBill("");
      setAmount("");
      setAccountNumber("");
      setPaymentSource("main_wallet");
      onClose();
    } catch (error: any) {
      console.error("Error creating bill payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process bill payment. Please try again.",
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
            <Select value={paymentSource} onValueChange={(value: "main_wallet" | "petty_cash_wallet") => setPaymentSource(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_wallet" disabled={!mainWallet}>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span>Main Wallet - {mainWallet?.currency?.symbol || "UGX"} {walletBalance.toLocaleString()}</span>
                  </div>
                </SelectItem>
                <SelectItem value="petty_cash_wallet" disabled={!pettyCashWallet}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Petty Cash - {pettyCashWallet?.currency?.symbol || "UGX"} {pettyCashBalance.toLocaleString()}</span>
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
                {selectedCurrency} {selectedBalance.toLocaleString()}
              </span>
            </div>
            {amount && canAfford && (
              <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-blue-200">
                <span className="text-gray-700">Balance after payment:</span>
                <span className="font-bold text-black">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
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
            <Label>Amount ({selectedCurrency})</Label>
            <Input
              type="number"
              placeholder="Enter bill amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white"
              min={1}
            />
            {amount && !canAfford && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ Insufficient {paymentSource === "main_wallet" ? "wallet" : "petty cash"} balance
                </p>
                <p className="text-xs text-red-600">
                  Available: {selectedCurrency} {selectedBalance.toLocaleString()} | Required: {selectedCurrency} {parseFloat(amount).toLocaleString()}
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
                  <span className="font-bold text-black">{selectedCurrency} {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Source:</span>
                  <span className="font-medium text-black">
                    {paymentSource === "main_wallet" ? "Main Wallet" : "Petty Cash"}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-green-300">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-bold text-green-700">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
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
              `Pay ${selectedCurrency} ${amount ? parseFloat(amount).toLocaleString() : '0'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillsForm;