import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, DollarSign, Zap, Droplets, Tv, Building2, CreditCard, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { organizationService } from "@/services/organizationService";
import { useNavigate } from "react-router-dom";

interface PayBillsFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialProvider?: string;
}

const PayBillsForm = ({ isOpen, onClose, initialCategory, initialProvider }: PayBillsFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallets } = useOrganization();
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState(initialCategory || "");
  const [selectedProvider, setSelectedProvider] = useState(initialProvider || "");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentSource, setPaymentSource] = useState<"main_wallet" | "petty_cash_wallet">("main_wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pettyCashWallets, setPettyCashWallets] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update selected values when initial props change
  useEffect(() => {
    if (initialCategory) {
      setSelectedBill(initialCategory);
    }
    if (initialProvider) {
      setSelectedProvider(initialProvider);
      // Reset district when provider changes
      if (initialProvider !== "nwsc") {
        setSelectedDistrict("");
      }
    }
  }, [initialCategory, initialProvider]);

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

  // NWSC Districts
  const nwscDistricts = [
    "Kampala",
    "Entebbe",
    "Jinja",
    "Lugazi",
    "Iganga",
    "Others"
  ];

  const billTypes = [
    { 
      id: "water", 
      name: "Water", 
      icon: Droplets, 
      providers: [
        { id: "nwsc", name: "NWSC", accountLabel: "Meter Number", placeholder: "E.g 1234567879", requiresDistrict: true }
      ]
    },
    { 
      id: "electricity", 
      name: "Electricity", 
      icon: Zap, 
      providers: [
        { id: "uedcl_postpaid", name: "UEDCL Post Paid", accountLabel: "Meter Number", placeholder: "Enter meter number" },
        { id: "uedcl_light", name: "UEDCL Light", accountLabel: "Meter Number", placeholder: "Enter meter number" }
      ]
    },
    { 
      id: "tv", 
      name: "TV", 
      icon: Tv, 
      providers: [
        { id: "dstv", name: "DSTV", accountLabel: "SmartCard Number", placeholder: "Enter SmartCard number" },
        { id: "startimes", name: "STARTIMES", accountLabel: "SmartCard Number", placeholder: "Enter SmartCard number" },
        { id: "gotv", name: "GOTV", accountLabel: "IUC Number", placeholder: "Enter IUC number" },
        { id: "azam_tv", name: "AZAM TV", accountLabel: "SmartCard Number", placeholder: "Enter SmartCard number" }
      ]
    },
    { 
      id: "tax", 
      name: "Tax", 
      icon: Building2, 
      providers: [
        { id: "ura", name: "URA", accountLabel: "TIN Number", placeholder: "Enter TIN number" },
        { id: "kcca", name: "KCCA", accountLabel: "Property ID", placeholder: "Enter property ID" }
      ]
    }
  ];

  const selectedBillType = billTypes.find(bill => bill.id === selectedBill);
  const selectedProviderData = selectedBillType?.providers.find(p => p.id === selectedProvider);
  const canAfford = amount ? parseFloat(amount) <= selectedBalance : true;
  const remainingBalance = amount ? selectedBalance - parseFloat(amount) : selectedBalance;

  const handlePayBill = async () => {
    // Check if NWSC requires district
    const needsDistrict = selectedProvider === "nwsc" && !selectedDistrict;
    if (!selectedBill || !selectedProvider || !amount || !accountNumber || needsDistrict) {
      toast({
        title: "Missing Information",
        description: needsDistrict ? "Please select area and enter meter number" : "Please fill in all required fields",
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
      // Map bill type to API type
      const apiTypeMap: Record<string, "electricity" | "water" | "internet" | "airtime" | null> = {
        "water": "water",
        "electricity": "electricity",
        "tv": null,
        "tax": null
      };
      
      // Create bill payment
      await organizationService.createBillPayment({
        organization: user.organizationId,
        currency: selectedWallet.currency.id,
        biller_name: selectedProviderData?.name || selectedBillType?.name || "Unknown",
        account_number: accountNumber.trim(),
        amount: Math.round(parseFloat(amount)),
        type: apiTypeMap[selectedBill] || null,
        wallet_type: paymentSource,
        status: "pending",
        reference: null
      });
      
      toast({
        title: "Bill Payment Submitted",
        description: `${selectedProviderData?.name || selectedBillType?.name} bill of ${selectedCurrency} ${parseFloat(amount).toLocaleString()} has been submitted successfully`,
      });

      // Reset form
      setSelectedBill("");
      setSelectedProvider("");
      setSelectedDistrict("");
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

  // On mobile, render as full page, on desktop as dialog
  if (isMobile && isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="min-h-screen pb-20">
          {/* Mobile Header with Back Button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="flex items-center gap-3 p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Pay Bills</h1>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4 space-y-4">
          {/* Payment Source Selection */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Payment Source *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant={paymentSource === "main_wallet" ? "default" : "outline"}
                onClick={() => setPaymentSource("main_wallet")}
                disabled={!mainWallet}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium">Main Wallet</span>
                </div>
                {mainWallet && (
                  <span className="text-xs sm:text-sm font-bold text-right">
                    {mainWallet?.currency?.symbol || "UGX"} {walletBalance.toLocaleString()}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant={paymentSource === "petty_cash_wallet" ? "default" : "outline"}
                onClick={() => setPaymentSource("petty_cash_wallet")}
                disabled={!pettyCashWallet}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium">Petty Cash</span>
                </div>
                {pettyCashWallet && (
                  <span className="text-xs sm:text-sm font-bold text-right">
                    {pettyCashWallet?.currency?.symbol || "UGX"} {pettyCashBalance.toLocaleString()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Bill Type Selection */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Select Bill Type</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {billTypes.map((bill) => {
                const IconComponent = bill.icon;
                return (
                  <Button
                    key={bill.id}
                    type="button"
                    variant={selectedBill === bill.id ? "default" : "outline"}
                    onClick={() => {
                      if (isMobile) {
                        // Navigate to provider selection page on mobile
                        navigate(`/org/pay-bills/provider-selection?category=${bill.id}`);
                        onClose();
                      } else {
                        setSelectedBill(bill.id);
                        setSelectedProvider("");
                        setSelectedDistrict("");
                      }
                    }}
                    className="flex flex-col items-center p-3 sm:p-4 h-auto gap-2"
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium">{bill.name}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Provider Selection as Cards */}
          {selectedBillType && !isMobile && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Select Provider</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {selectedBillType.providers.map((provider) => {
                  const IconComponent = selectedBillType.icon;
                  return (
                    <Card
                      key={provider.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProvider === provider.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-center">{provider.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-700 font-medium">
                Available Balance:
              </span>
              <span className="font-bold text-blue-600">
                {selectedCurrency} {selectedBalance.toLocaleString()}
              </span>
            </div>
            {amount && canAfford && (
              <div className="flex items-center justify-between text-xs sm:text-sm mt-2 pt-2 border-t border-blue-200">
                <span className="text-gray-700 font-medium">Balance after payment:</span>
                <span className="font-bold text-black">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Account Number */}
          {selectedProviderData && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">{selectedProviderData.accountLabel}</Label>
              <Input
                placeholder={selectedProviderData.placeholder}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-white text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Amount ({selectedCurrency})</Label>
            <Input
              type="number"
              placeholder="Enter bill amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white text-xs sm:text-sm h-9 sm:h-10"
              min={1}
            />
            {amount && !canAfford && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs text-red-700 font-medium mb-1">
                  ⚠️ Insufficient {paymentSource === "main_wallet" ? "wallet" : "petty cash"} balance
                </p>
                <p className="text-[10px] sm:text-xs text-red-600">
                  Available: {selectedCurrency} {selectedBalance.toLocaleString()} | Required: {selectedCurrency} {parseFloat(amount).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Confirmation */}
          {amount && canAfford && selectedBill && selectedProvider && accountNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
              <h4 className="text-xs sm:text-sm font-semibold text-black mb-2">Payment Summary</h4>
              <div className="space-y-1.5 text-[10px] sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-medium text-black text-right">{selectedBillType?.name} - {selectedProviderData?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-black truncate ml-2">{accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-black">{selectedCurrency} {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Source:</span>
                  <span className="font-medium text-black">
                    {paymentSource === "main_wallet" ? "Main Wallet" : "Petty Cash"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-green-300">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-bold text-green-700">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Mobile Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
            <Button 
              onClick={handlePayBill} 
              disabled={!selectedBill || !selectedProvider || !amount || !accountNumber || !canAfford || isProcessing || (selectedProvider === "nwsc" && !selectedDistrict)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-sm h-12"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {selectedCurrency} {amount ? parseFloat(amount).toLocaleString() : '0'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Render as Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            Pay Bills
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Pay utility bills and services using your available funds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Payment Source Selection */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Payment Source *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant={paymentSource === "main_wallet" ? "default" : "outline"}
                onClick={() => setPaymentSource("main_wallet")}
                disabled={!mainWallet}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium">Main Wallet</span>
                </div>
                {mainWallet && (
                  <span className="text-xs sm:text-sm font-bold text-right">
                    {mainWallet?.currency?.symbol || "UGX"} {walletBalance.toLocaleString()}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant={paymentSource === "petty_cash_wallet" ? "default" : "outline"}
                onClick={() => setPaymentSource("petty_cash_wallet")}
                disabled={!pettyCashWallet}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium">Petty Cash</span>
                </div>
                {pettyCashWallet && (
                  <span className="text-xs sm:text-sm font-bold text-right">
                    {pettyCashWallet?.currency?.symbol || "UGX"} {pettyCashBalance.toLocaleString()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Bill Type Selection */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Select Bill Type</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {billTypes.map((bill) => {
                const IconComponent = bill.icon;
                return (
                  <Button
                    key={bill.id}
                    type="button"
                    variant={selectedBill === bill.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedBill(bill.id);
                      setSelectedProvider("");
                      setSelectedDistrict("");
                    }}
                    className="flex flex-col items-center p-3 sm:p-4 h-auto gap-2"
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium">{bill.name}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Provider Selection as Cards */}
          {selectedBillType && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Select Provider</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {selectedBillType.providers.map((provider) => {
                  const IconComponent = selectedBillType.icon;
                  return (
                    <Card
                      key={provider.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProvider === provider.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-center">{provider.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-700 font-medium">
                Available Balance:
              </span>
              <span className="font-bold text-blue-600">
                {selectedCurrency} {selectedBalance.toLocaleString()}
              </span>
            </div>
            {amount && canAfford && (
              <div className="flex items-center justify-between text-xs sm:text-sm mt-2 pt-2 border-t border-blue-200">
                <span className="text-gray-700 font-medium">Balance after payment:</span>
                <span className="font-bold text-black">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Account Number */}
          {selectedProviderData && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">{selectedProviderData.accountLabel}</Label>
              <Input
                placeholder={selectedProviderData.placeholder}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-white text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Amount ({selectedCurrency})</Label>
            <Input
              type="number"
              placeholder="Enter bill amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white text-xs sm:text-sm h-9 sm:h-10"
              min={1}
            />
            {amount && !canAfford && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs text-red-700 font-medium mb-1">
                  ⚠️ Insufficient {paymentSource === "main_wallet" ? "wallet" : "petty cash"} balance
                </p>
                <p className="text-[10px] sm:text-xs text-red-600">
                  Available: {selectedCurrency} {selectedBalance.toLocaleString()} | Required: {selectedCurrency} {parseFloat(amount).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Confirmation */}
          {amount && canAfford && selectedBill && selectedProvider && accountNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
              <h4 className="text-xs sm:text-sm font-semibold text-black mb-2">Payment Summary</h4>
              <div className="space-y-1.5 text-[10px] sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-medium text-black text-right">{selectedBillType?.name} - {selectedProviderData?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-black truncate ml-2">{accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-black">{selectedCurrency} {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Source:</span>
                  <span className="font-medium text-black">
                    {paymentSource === "main_wallet" ? "Main Wallet" : "Petty Cash"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-green-300">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-bold text-green-700">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isProcessing}
            className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayBill} 
            disabled={!selectedBill || !selectedProvider || !amount || !accountNumber || !canAfford || isProcessing || (selectedProvider === "nwsc" && !selectedDistrict)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Pay {selectedCurrency} {amount ? parseFloat(amount).toLocaleString() : '0'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillsForm;