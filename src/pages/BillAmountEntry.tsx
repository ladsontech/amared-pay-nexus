import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Droplets, Zap, Wallet, DollarSign, Tv, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { organizationService } from '@/services/organizationService';
import { useToast } from '@/hooks/use-toast';

// Helper function to get provider logo path
const getProviderLogo = (providerId: string): string | null => {
  const logoMap: Record<string, string> = {
    'nwsc': '/images/BILLS_LOGOS/NWSC.png',
    'uedcl_postpaid': '/images/BILLS_LOGOS/UEDCL.png',
    'uedcl_light': '/images/BILLS_LOGOS/UEDCL.png',
    'dstv': '/images/BILLS_LOGOS/DSTV.png',
    'startimes': '/images/BILLS_LOGOS/STARTIMES.png',
    'gotv': '/images/BILLS_LOGOS/ZUKU.png', // Using ZUKU as GOTV logo (if GOTV logo exists, replace this)
    'azam_tv': '/images/BILLS_LOGOS/AZAM.png',
    'ura': '/images/BILLS_LOGOS/URA.png',
    'kcca': '/images/BILLS_LOGOS/KCCA.png',
  };
  return logoMap[providerId] || null;
};

const BillAmountEntry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { wallets, fetchWallets, fetchPettyCashWallets, pettyCashWallets: hookPettyCashWallets } = useOrganization();
  
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const accountNumber = searchParams.get('accountNumber') || searchParams.get('cardNumber');
  const district = searchParams.get('district');
  
  const [amount, setAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState<'main_wallet' | 'petty_cash_wallet'>('main_wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletsLoading, setWalletsLoading] = useState(false);

  // Provider configurations
  const providerConfigs: Record<string, { name: string }> = {
    // Water Providers
    'nwsc': { name: 'NWSC' },
    // Electricity Providers
    'uedcl_postpaid': { name: 'UEDCL Post Paid' },
    'uedcl_light': { name: 'UEDCL Light' },
    // TV Providers
    'dstv': { name: 'DSTV' },
    'startimes': { name: 'STARTIMES' },
    'gotv': { name: 'GOTV' },
    'azam_tv': { name: 'AZAM TV' },
    // Tax Providers
    'ura': { name: 'URA' },
    'kcca': { name: 'KCCA' },
  };

  const providerConfig = provider ? providerConfigs[provider] : null;
  
  // Determine icon based on category
  const getIconComponent = () => {
    if (category === 'water') return Droplets;
    if (category === 'electricity') return Zap;
    if (category === 'tv') return Tv;
    if (category === 'tax') return Building2;
    return Droplets;
  };
  const IconComponent = getIconComponent();

  useEffect(() => {
    const loadWallets = async () => {
      if (!user?.organizationId) return;
      try {
        setWalletsLoading(true);
        await Promise.all([
          fetchWallets(),
          fetchPettyCashWallets()
        ]);
      } catch (error) {
        console.error('Error loading wallets:', error);
      } finally {
        setWalletsLoading(false);
      }
    };
    loadWallets();
  }, [user?.organizationId, fetchWallets, fetchPettyCashWallets]);

  if (!category || !provider || !accountNumber || !providerConfig) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Missing information</p>
          <Button onClick={() => navigate('/org/pay-bills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pay Bills
          </Button>
        </div>
      </div>
    );
  }

  const mainWallet = wallets.find(w => !w.petty_cash_wallet);
  const pettyCashWallet = hookPettyCashWallets && hookPettyCashWallets.length > 0 ? hookPettyCashWallets[0] : null;
  
  const mainBalance = mainWallet?.balance ?? 0;
  const pettyCashBalance = pettyCashWallet?.balance ?? 0;
  const selectedBalance = paymentSource === "main_wallet" ? mainBalance : pettyCashBalance;
  const selectedCurrency = paymentSource === "main_wallet" 
    ? (mainWallet?.currency?.symbol || mainWallet?.currency?.name || "UGX")
    : (pettyCashWallet?.currency?.symbol || pettyCashWallet?.currency?.name || "UGX");

  const numAmount = parseFloat(amount) || 0;
  const canAfford = numAmount > 0 && numAmount <= selectedBalance;
  const remainingBalance = selectedBalance - numAmount;

  const handleSubmit = async () => {
    if (!amount || !canAfford || isProcessing) return;

    setIsProcessing(true);
    try {
      if (!user?.organizationId) {
        throw new Error('Organization ID not found');
      }

      const wallet = paymentSource === "main_wallet" ? mainWallet : pettyCashWallet;
      if (!wallet) {
        throw new Error(`${paymentSource === "main_wallet" ? "Main" : "Petty Cash"} wallet not found`);
      }

      // Create bill payment
      await organizationService.createBillPayment({
        organization: user.organizationId,
        wallet: wallet.id,
        wallet_type: paymentSource === "main_wallet" ? "wallet" : "petty_cash_wallet",
        type: category,
        biller_name: providerConfig.name,
        account_number: accountNumber,
        amount: numAmount,
        currency: wallet.currency?.id || 1,
      });

      // Navigate back to pay bills page with success
      navigate('/org/pay-bills?success=true');
    } catch (error: any) {
      console.error('Payment error:', error);
      // Show error toast (you may want to add toast here)
      alert(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams({ category, provider });
              if (district) params.append('district', district);
              navigate(`/org/pay-bills/account-entry?${params.toString()}`);
            }}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            {getProviderLogo(provider || '') ? (
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1.5">
                <img 
                  src={getProviderLogo(provider || '') || ''} 
                  alt={providerConfig.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <h1 className="text-lg font-semibold text-gray-900">{providerConfig.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-8 pb-20 space-y-6">
        {/* Payment Source Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment Source</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={paymentSource === "main_wallet" ? "default" : "outline"}
              onClick={() => setPaymentSource("main_wallet")}
              disabled={!mainWallet || walletsLoading}
              className="flex flex-col items-start justify-between p-4 h-auto gap-2"
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Main Wallet</span>
              </div>
              {mainWallet && !walletsLoading && (
                <span className="text-sm font-bold text-right">
                  {mainWallet?.currency?.symbol || "UGX"} {mainBalance.toLocaleString()}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant={paymentSource === "petty_cash_wallet" ? "default" : "outline"}
              onClick={() => setPaymentSource("petty_cash_wallet")}
              disabled={!pettyCashWallet || walletsLoading}
              className="flex flex-col items-start justify-between p-4 h-auto gap-2"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Petty Cash</span>
              </div>
              {pettyCashWallet && !walletsLoading && (
                <span className="text-sm font-bold text-right">
                  {pettyCashWallet?.currency?.symbol || "UGX"} {pettyCashBalance.toLocaleString()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Account Info Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Provider:</span>
              <span className="font-medium">{providerConfig.name}</span>
            </div>
            {district && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Area:</span>
                <span className="font-medium">{district}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Account:</span>
              <span className="font-medium">{accountNumber}</span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Amount ({selectedCurrency})</Label>
          <Input
            type="number"
            placeholder="Enter bill amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white h-12 text-base"
            min={1}
          />
          {amount && !canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Insufficient balance
              </p>
              <p className="text-xs text-red-600 mt-1">
                Available: {selectedCurrency} {selectedBalance.toLocaleString()} | Required: {selectedCurrency} {numAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        {amount && canAfford && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-sm font-semibold text-black mb-2">Payment Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-black">{selectedCurrency} {numAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Source:</span>
                <span className="font-medium text-black">
                  {paymentSource === "main_wallet" ? "Main Wallet" : "Petty Cash"}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="font-bold text-green-700">{selectedCurrency} {remainingBalance.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!amount || !canAfford || isProcessing || walletsLoading}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Pay Bill'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillAmountEntry;

