import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Zap, 
  Droplets, 
  Tv, 
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService } from '@/services/organizationService';
import { useNavigate } from 'react-router-dom';

interface EnhancedPayBillsFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BillCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  providers: BillProvider[];
}

interface BillProvider {
  id: string;
  name: string;
  accountFormat: string;
  minAmount?: number;
  maxAmount?: number;
  fees?: number;
}

const EnhancedPayBillsForm: React.FC<EnhancedPayBillsFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState<'wallet' | 'petty-cash'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [balances, setBalances] = useState({ wallet: 0, 'petty-cash': 0 });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
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

  useEffect(() => {
    const fetchBalances = async () => {
      if (!user?.organizationId || !isOpen) return;

      try {
        setIsLoadingBalances(true);

        // Fetch main wallet
        const walletsResponse = await organizationService.getWallets({
          organization: user.organizationId,
          limit: 1
        });

        if (walletsResponse.results.length > 0) {
          setBalances(prev => ({ ...prev, wallet: walletsResponse.results[0].balance || 0 }));
        }

        // Fetch petty cash wallet
        const pettyCashWalletsResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 1
        });

        if (pettyCashWalletsResponse.results.length > 0) {
          setBalances(prev => ({ ...prev, 'petty-cash': pettyCashWalletsResponse.results[0].balance || 0 }));
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
  }, [user?.organizationId, isOpen]);

  const billCategories: BillCategory[] = [
    {
      id: 'water',
      name: 'Water',
      icon: Droplets,
      color: 'text-blue-600 bg-blue-100',
      providers: [
        { id: 'nwsc', name: 'NWSC', accountFormat: 'Customer Number XXXXXXX', minAmount: 10000, maxAmount: 1000000, fees: 800 }
      ]
    },
    {
      id: 'electricity',
      name: 'Electricity',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100',
      providers: [
        { id: 'uedcl_postpaid', name: 'UEDCL Post Paid', accountFormat: 'Meter Number XXXXXXXXXX', minAmount: 5000, maxAmount: 2000000, fees: 1000 },
        { id: 'uedcl_light', name: 'UEDCL Light', accountFormat: 'Meter Number XXXXXXXXXX', minAmount: 5000, maxAmount: 2000000, fees: 1000 }
      ]
    },
    {
      id: 'tv',
      name: 'TV',
      icon: Tv,
      color: 'text-purple-600 bg-purple-100',
      providers: [
        { id: 'dstv', name: 'DSTV', accountFormat: 'SmartCard XXXXXXXXXX', minAmount: 15000, maxAmount: 500000, fees: 500 },
        { id: 'startimes', name: 'STARTIMES', accountFormat: 'SmartCard XXXXXXXXXX', minAmount: 6000, maxAmount: 150000, fees: 300 },
        { id: 'gotv', name: 'GOTV', accountFormat: 'IUC Number XXXXXXXXX', minAmount: 8000, maxAmount: 200000, fees: 300 },
        { id: 'azam_tv', name: 'AZAM TV', accountFormat: 'SmartCard XXXXXXXXXX', minAmount: 10000, maxAmount: 200000, fees: 300 }
      ]
    },
    {
      id: 'tax',
      name: 'Tax',
      icon: Building,
      color: 'text-green-600 bg-green-100',
      providers: [
        { id: 'ura', name: 'URA', accountFormat: 'TIN XXXXXXXXXX', minAmount: 10000, fees: 2000 },
        { id: 'kcca', name: 'KCCA', accountFormat: 'Property ID XXXX', minAmount: 25000, fees: 1000 }
      ]
    }
  ];

  const selectedCategoryData = billCategories.find(cat => cat.id === selectedCategory);
  const selectedProviderData = selectedCategoryData?.providers.find(prov => prov.id === selectedProvider);

  // Mock customer lookup
  const handleAccountLookup = async () => {
    if (!accountNumber || !selectedProvider) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockCustomerData = {
      'nwsc': { name: 'TECH SOLUTIONS LTD', balance: 85000, dueDate: '2024-02-20' },
      'uedcl_postpaid': { name: 'KAMPALA OFFICE COMPLEX', balance: 125000, dueDate: '2024-02-15' },
      'uedcl_light': { name: 'KAMPALA OFFICE COMPLEX', balance: 125000, dueDate: '2024-02-15' },
      'dstv': { name: 'JOHN DOE', package: 'Compact Plus', balance: 65000, dueDate: '2024-02-10' },
      'startimes': { name: 'JOHN DOE', package: 'Nova', balance: 45000, dueDate: '2024-02-10' },
      'gotv': { name: 'JOHN DOE', package: 'Jinja', balance: 35000, dueDate: '2024-02-10' },
      'azam_tv': { name: 'JOHN DOE', package: 'Premium', balance: 55000, dueDate: '2024-02-10' },
      'ura': { name: 'BUSINESS ENTERPRISES LTD', tin: accountNumber, status: 'Active' },
      'kcca': { name: 'BUSINESS ENTERPRISES LTD', propertyId: accountNumber, status: 'Active' }
    };

    setCustomerInfo(mockCustomerData[selectedProvider as keyof typeof mockCustomerData] || null);
  };

  const handlePayBill = async () => {
    if (!selectedCategory || !selectedProvider || !accountNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseInt(amount);
    const balance = balances[paymentSource];
    const fees = selectedProviderData?.fees || 0;
    const totalAmount = numAmount + fees;

    if (totalAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `Total amount (UGX ${totalAmount.toLocaleString()}) exceeds available balance.`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (!user?.organizationId) {
        throw new Error("Organization ID not found");
      }

      // Get currency from wallet
      const walletsResponse = await organizationService.getWallets({
        organization: user.organizationId,
        limit: 1
      });

      if (walletsResponse.results.length === 0) {
        throw new Error("No wallet found for organization");
      }

      const currencyId = walletsResponse.results[0].currency.id;
      const walletId = walletsResponse.results[0].id;

      // Get petty cash wallet if using petty cash
      let pettyCashWalletId: string | undefined;
      if (paymentSource === 'petty-cash') {
        const pettyCashWalletsResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 1
        });
        if (pettyCashWalletsResponse.results.length > 0) {
          pettyCashWalletId = pettyCashWalletsResponse.results[0].id;
        }
      }

      // Map category to bill type
      const billTypeMap: Record<string, "electricity" | "water" | "internet" | "airtime" | undefined> = {
        'water': 'water',
        'electricity': 'electricity',
        'tv': undefined,
        'tax': undefined,
      };

      const billType = billTypeMap[selectedCategory] || undefined;

      // Create bill payment
      await organizationService.createBillPayment({
        organization: user.organizationId,
        currency: currencyId,
        biller_name: selectedProviderData?.name || selectedCategoryData?.name || "",
        account_number: accountNumber,
        amount: numAmount,
        status: "pending",
        type: billType,
        wallet_type: paymentSource === 'wallet' ? 'main_wallet' : 'petty_cash_wallet',
        reference: `${selectedProvider || selectedCategory}-${Date.now()}`
      });
      
      toast({
        title: "Payment Sent for Approval",
        description: `Bill payment of UGX ${numAmount.toLocaleString()} has been submitted for manager approval.`,
      });

      // Reset form
      setSelectedCategory('');
      setSelectedProvider('');
      setAccountNumber('');
      setAmount('');
      setCustomerInfo(null);
      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalAmount = () => {
    const baseAmount = parseInt(amount) || 0;
    const fees = selectedProviderData?.fees || 0;
    return baseAmount + fees;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg md:text-xl">Pay Bills - Enhanced Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Payment Source Selection */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Select Payment Source</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <Button
                  type="button"
                  variant={paymentSource === 'wallet' ? 'default' : 'outline'}
                  onClick={() => setPaymentSource('wallet')}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">Main Wallet</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold">
                      {isLoadingBalances ? 'Loading...' : `UGX ${balances.wallet.toLocaleString()}`}
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={paymentSource === 'petty-cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentSource('petty-cash')}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 h-auto gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">Petty Cash</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold">
                      {isLoadingBalances ? 'Loading...' : `UGX ${balances['petty-cash'].toLocaleString()}`}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bill Category Selection */}
          <div className="space-y-2 sm:space-y-4">
            <Label className="text-xs sm:text-sm font-medium">Select Bill Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {billCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => {
                      if (isMobile) {
                        // Navigate to provider selection page on mobile
                        navigate(`/org/pay-bills/provider-selection?category=${category.id}`);
                        onClose();
                      } else {
                        setSelectedCategory(category.id);
                        setSelectedProvider('');
                        setCustomerInfo(null);
                      }
                    }}
                    className="flex flex-col items-center p-2.5 sm:p-4 h-auto space-y-1.5 sm:space-y-2"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center leading-tight">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Provider Selection as Cards */}
          {selectedCategoryData && !isMobile && (
            <div className="space-y-2 sm:space-y-4">
              <Label className="text-xs sm:text-sm font-medium">Select Service Provider</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {selectedCategoryData.providers.map((provider) => {
                  const IconComponent = selectedCategoryData.icon;
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
                          <div className={`p-2 rounded-lg ${selectedCategoryData.color}`}>
                            <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-center">{provider.name}</span>
                          {provider.fees && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs mt-1">
                              Fee: UGX {provider.fees.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Details */}
          {selectedProviderData && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Account Number/ID</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder={selectedProviderData.accountFormat}
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setCustomerInfo(null);
                    }}
                    className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                  />
                  <Button 
                    onClick={handleAccountLookup} 
                    disabled={!accountNumber}
                    className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                  >
                    Lookup
                  </Button>
                </div>
              </div>

              {customerInfo && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-2.5 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-green-800">Account Found</span>
                    </div>
                    <div className="space-y-1 text-[10px] sm:text-xs md:text-sm">
                      <div><strong>Name:</strong> {customerInfo.name}</div>
                      {customerInfo.balance && (
                        <div><strong>Outstanding Balance:</strong> UGX {customerInfo.balance.toLocaleString()}</div>
                      )}
                      {customerInfo.dueDate && (
                        <div><strong>Due Date:</strong> {customerInfo.dueDate}</div>
                      )}
                      {customerInfo.package && (
                        <div><strong>Package:</strong> {customerInfo.package}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Amount (UGX)</Label>
                <Input
                  type="number"
                  placeholder={`Min: ${selectedProviderData.minAmount?.toLocaleString() || 'N/A'}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xs sm:text-sm h-9 sm:h-10"
                />
                {selectedProviderData.minAmount && parseInt(amount) < selectedProviderData.minAmount && amount && (
                  <div className="text-[10px] sm:text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Minimum amount: UGX {selectedProviderData.minAmount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {selectedProviderData && amount && parseInt(amount) > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-2.5 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Payment Summary</h4>
                <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs md:text-sm">
                  <div className="flex justify-between items-center">
                    <span>Bill Amount:</span>
                    <span className="font-medium">UGX {parseInt(amount).toLocaleString()}</span>
                  </div>
                  {selectedProviderData.fees && (
                    <div className="flex justify-between items-center">
                      <span>Service Fee:</span>
                      <span className="font-medium">UGX {selectedProviderData.fees.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-1.5 sm:pt-2 flex justify-between items-center font-medium">
                    <span>Total Amount:</span>
                    <span>UGX {getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Payment Source Balance:</span>
                    <span>UGX {balances[paymentSource].toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Balance After Payment:</span>
                    <span className={`font-medium ${balances[paymentSource] - getTotalAmount() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      UGX {(balances[paymentSource] - getTotalAmount()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayBill}
              disabled={
                !selectedCategory || 
                !selectedProvider || 
                !accountNumber || 
                !amount || 
                isProcessing ||
                getTotalAmount() > balances[paymentSource] ||
                (selectedProviderData?.minAmount && parseInt(amount) < selectedProviderData.minAmount)
              }
              className="flex-1 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Pay Bill - UGX {getTotalAmount().toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPayBillsForm;