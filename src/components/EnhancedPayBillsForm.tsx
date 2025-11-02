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
  Phone, 
  Building, 
  Zap, 
  Droplets, 
  Tv, 
  GraduationCap, 
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService } from '@/services/organizationService';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState<'wallet' | 'petty-cash'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [balances, setBalances] = useState({ wallet: 0, 'petty-cash': 0 });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

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
      id: 'airtime',
      name: 'Airtime & Data',
      icon: Phone,
      color: 'text-blue-600 bg-blue-100',
      providers: [
        { id: 'mtn', name: 'MTN Uganda', accountFormat: '256XXXXXXXXX', minAmount: 500, maxAmount: 500000, fees: 0 },
        { id: 'airtel', name: 'Airtel Uganda', accountFormat: '256XXXXXXXXX', minAmount: 500, maxAmount: 500000, fees: 0 },
        { id: 'utl', name: 'Uganda Telecom', accountFormat: '256XXXXXXXXX', minAmount: 500, maxAmount: 100000, fees: 0 }
      ]
    },
    {
      id: 'government',
      name: 'Government Services',
      icon: Building,
      color: 'text-green-600 bg-green-100',
      providers: [
        { id: 'ura', name: 'Uganda Revenue Authority (URA)', accountFormat: 'TIN XXXXXXXXXX', minAmount: 10000, fees: 2000 },
        { id: 'nssf', name: 'National Social Security Fund (NSSF)', accountFormat: 'NSSF XXXXXXXX', minAmount: 50000, fees: 1500 },
        { id: 'kcca', name: 'Kampala Capital City Authority (KCCA)', accountFormat: 'Property ID XXXX', minAmount: 25000, fees: 1000 }
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100',
      providers: [
        { id: 'umeme', name: 'UMEME (Electricity)', accountFormat: 'Meter Number XXXXXXXXXX', minAmount: 5000, maxAmount: 2000000, fees: 1000 },
        { id: 'nwsc', name: 'NWSC (Water)', accountFormat: 'Customer Number XXXXXXX', minAmount: 10000, maxAmount: 1000000, fees: 800 },
        { id: 'gas', name: 'Gas Stations', accountFormat: 'Account XXXXXXXX', minAmount: 20000, fees: 500 }
      ]
    },
    {
      id: 'entertainment',
      name: 'Pay TV & Entertainment',
      icon: Tv,
      color: 'text-purple-600 bg-purple-100',
      providers: [
        { id: 'dstv', name: 'DSTV Uganda', accountFormat: 'SmartCard XXXXXXXXXX', minAmount: 15000, maxAmount: 500000, fees: 500 },
        { id: 'gotv', name: 'GOTV Uganda', accountFormat: 'IUC Number XXXXXXXXX', minAmount: 8000, maxAmount: 200000, fees: 300 },
        { id: 'startimes', name: 'StarTimes Uganda', accountFormat: 'SmartCard XXXXXXXXXX', minAmount: 6000, maxAmount: 150000, fees: 300 }
      ]
    },
    {
      id: 'education',
      name: 'School Fees & Education',
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-100',
      providers: [
        { id: 'universities', name: 'Universities (General)', accountFormat: 'Student ID XXXXXXXX', minAmount: 100000, fees: 2000 },
        { id: 'primary-schools', name: 'Primary Schools', accountFormat: 'Student ID XXXXX', minAmount: 50000, fees: 1000 },
        { id: 'secondary-schools', name: 'Secondary Schools', accountFormat: 'Student ID XXXXXX', minAmount: 75000, fees: 1500 }
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
      'umeme': { name: 'KAMPALA OFFICE COMPLEX', balance: 125000, dueDate: '2024-02-15' },
      'nwsc': { name: 'TECH SOLUTIONS LTD', balance: 85000, dueDate: '2024-02-20' },
      'dstv': { name: 'JOHN DOE', package: 'Compact Plus', balance: 65000, dueDate: '2024-02-10' },
      'mtn': { name: 'JANE SMITH', number: accountNumber },
      'ura': { name: 'BUSINESS ENTERPRISES LTD', tin: accountNumber, status: 'Active' }
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
        'airtime': 'airtime',
        'utilities': selectedProvider === 'umeme' ? 'electricity' : selectedProvider === 'nwsc' ? 'water' : undefined,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Bills - Enhanced Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Source Selection */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">Select Payment Source</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={paymentSource === 'wallet' ? 'default' : 'outline'}
                  onClick={() => setPaymentSource('wallet')}
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    <span>Main Wallet</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {isLoadingBalances ? 'Loading...' : `UGX ${balances.wallet.toLocaleString()}`}
                    </div>
                  </div>
                </Button>
                <Button
                  variant={paymentSource === 'petty-cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentSource('petty-cash')}
                  className="flex items-center justify-between p-4 h-auto"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Petty Cash</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {isLoadingBalances ? 'Loading...' : `UGX ${balances['petty-cash'].toLocaleString()}`}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bill Category Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select Bill Category</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {billCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedProvider('');
                      setCustomerInfo(null);
                    }}
                    className="flex flex-col items-center p-4 h-auto space-y-2"
                  >
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Provider Selection */}
          {selectedCategoryData && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Service Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategoryData.providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.name}</span>
                        {provider.fees && (
                          <Badge variant="outline" className="ml-2">
                            Fee: UGX {provider.fees.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Account Details */}
          {selectedProviderData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Number/ID</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={selectedProviderData.accountFormat}
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setCustomerInfo(null);
                    }}
                  />
                  <Button onClick={handleAccountLookup} disabled={!accountNumber}>
                    Lookup
                  </Button>
                </div>
              </div>

              {customerInfo && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Account Found</span>
                    </div>
                    <div className="space-y-1 text-sm">
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
                <Label className="text-sm font-medium">Amount (UGX)</Label>
                <Input
                  type="number"
                  placeholder={`Min: ${selectedProviderData.minAmount?.toLocaleString() || 'N/A'}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {selectedProviderData.minAmount && parseInt(amount) < selectedProviderData.minAmount && amount && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Minimum amount: UGX {selectedProviderData.minAmount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {selectedProviderData && amount && parseInt(amount) > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bill Amount:</span>
                    <span>UGX {parseInt(amount).toLocaleString()}</span>
                  </div>
                  {selectedProviderData.fees && (
                    <div className="flex justify-between">
                      <span>Service Fee:</span>
                      <span>UGX {selectedProviderData.fees.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>UGX {getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Source Balance:</span>
                    <span>UGX {balances[paymentSource].toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance After Payment:</span>
                    <span className={balances[paymentSource] - getTotalAmount() < 0 ? 'text-red-600' : 'text-green-600'}>
                      UGX {(balances[paymentSource] - getTotalAmount()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
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
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Pay Bill - UGX ${getTotalAmount().toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPayBillsForm;