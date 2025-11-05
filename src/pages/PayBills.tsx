import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, DollarSign, Receipt, AlertCircle, CheckCircle, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService, BillPayment, CreateBillPaymentRequest, Wallet as WalletType } from '@/services/organizationService';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import PayBillsForm from '@/components/PayBillsForm';

const PayBills: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organization, wallets, fetchWallets, fetchPettyCashWallets, pettyCashWallets: hookPettyCashWallets } = useOrganization();
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [walletsLoading, setWalletsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<CreateBillPaymentRequest, 'organization' | 'currency'>>({
    biller_name: '',
    account_number: '',
    amount: 0,
    type: undefined,
    wallet_type: 'main_wallet',
    reference: '',
    status: 'pending',
  });

  // Store category and provider from URL for passing to PayBillsForm
  const [initialCategory, setInitialCategory] = useState<string | undefined>();
  const [initialProvider, setInitialProvider] = useState<string | undefined>();

  // Check if we have category and provider from mobile navigation
  useEffect(() => {
    const category = searchParams.get('category');
    const provider = searchParams.get('provider');
    const cardNumber = searchParams.get('cardNumber');
    if (category && provider) {
      // Store the values and open the form dialog
      setInitialCategory(category);
      setInitialProvider(provider);
      setIsCreateDialogOpen(true);
      // If cardNumber is provided (from CardNumberEntry), set it in form data
      if (cardNumber) {
        setFormData(prev => ({
          ...prev,
          account_number: cardNumber
        }));
      }
      // Clear the URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch bill payments and refresh wallets
  useEffect(() => {
    fetchBillPayments();
    refreshWallets();
  }, [user?.organizationId, refreshKey]);

  const refreshWallets = async () => {
    if (!user?.organizationId) return;

    try {
      setWalletsLoading(true);
      // Refresh both wallets and petty cash wallets
      await Promise.all([
        fetchWallets(),
        fetchPettyCashWallets()
      ]);
    } catch (error) {
      console.error('Error refreshing wallets:', error);
    } finally {
      setWalletsLoading(false);
    }
  };

  const fetchBillPayments = async () => {
    if (!user?.organizationId) return;

    try {
      setIsLoading(true);
      const response = await organizationService.getBillPayments({
        organization: user.organizationId,
        limit: 100,
      });
      setBillPayments(response.results);
    } catch (error: any) {
      console.error('Error fetching bill payments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load bill payments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.organizationId) {
      toast({
        title: 'Error',
        description: 'Organization ID not found',
        variant: 'destructive',
      });
      return;
    }

    // Find the selected wallet
    let selectedWallet: any;
    if (formData.wallet_type === 'main_wallet') {
      selectedWallet = wallets.find(w => !w.petty_cash_wallet);
    } else {
      selectedWallet = hookPettyCashWallets && hookPettyCashWallets.length > 0 ? hookPettyCashWallets[0] : null;
    }

    if (!selectedWallet) {
      const walletType = formData.wallet_type === 'main_wallet' ? 'main' : 'petty cash';
      toast({
        title: 'Wallet Not Found',
        description: `No ${walletType} wallet found. ${formData.wallet_type === 'petty_cash_wallet' ? 'Please contact your administrator to set up a petty cash wallet, or use the main wallet instead.' : 'Please contact your administrator.'}`,
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    // Check balance
    const balance = selectedWallet.balance || 0;
    if (formData.amount > balance) {
      toast({
        title: 'Insufficient Funds',
        description: `Available balance: ${selectedWallet.currency?.symbol || 'UGX'} ${balance.toLocaleString()}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateBillPaymentRequest = {
        organization: user.organizationId,
        currency: selectedWallet.currency.id,
        biller_name: formData.biller_name.trim(),
        account_number: formData.account_number.trim(),
        amount: formData.amount,
        type: formData.type || null,
        wallet_type: formData.wallet_type,
        reference: formData.reference?.trim() || null,
        status: formData.status || 'pending',
      };

      await organizationService.createBillPayment(payload);

      toast({
        title: 'Success',
        description: 'Bill payment created successfully',
      });

      // Reset form
      setFormData({
        biller_name: '',
        account_number: '',
        amount: 0,
        type: undefined,
        wallet_type: 'main_wallet',
        reference: '',
        status: 'pending',
      });

      setIsCreateDialogOpen(false);
      setRefreshKey(prev => prev + 1);
      // Refresh wallets to get updated balances
      await refreshWallets();
    } catch (error: any) {
      console.error('Error creating bill payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create bill payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, symbol?: string) => {
    return `${symbol || 'UGX'} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'successful': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'water': return 'Water';
      case 'electricity': return 'Electricity';
      case 'tv': return 'TV';
      case 'tax': return 'Tax';
      default: return 'Other';
    }
  };

  // Get wallet balances - use real API data
  const mainWallet = wallets.find(w => !w.petty_cash_wallet);
  const pettyCashWallet = hookPettyCashWallets && hookPettyCashWallets.length > 0 ? hookPettyCashWallets[0] : null;

  // Get balances from API - ensure we're using the actual balance values
  const mainBalance = mainWallet?.balance ?? 0;
  const pettyCashBalance = pettyCashWallet?.balance ?? 0;
  const mainCurrency = mainWallet?.currency?.symbol || mainWallet?.currency?.name || 'UGX';
  const pettyCurrency = pettyCashWallet?.currency?.symbol || pettyCashWallet?.currency?.name || 'UGX';
  const hasPettyCashWallet = !!pettyCashWallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Pay Bills</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage and pay your organization's bills from available funding sources</p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Create Bill Payment</span>
              <span className="sm:hidden">New Payment</span>
            </Button>
          </div>
        </div>

        {/* Wallet Balances - Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Main Wallet Card */}
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-blue-100">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">Main Wallet</CardTitle>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{mainWallet?.currency?.name || 'Currency'}</p>
                  </div>
                </div>
                {mainWallet && (
                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {walletsLoading ? (
                <div className="flex items-center gap-2 py-4 sm:py-6">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-600" />
                  <span className="text-xs sm:text-sm text-gray-600">Loading balance...</span>
                </div>
              ) : mainWallet ? (
                <>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(mainBalance, mainCurrency)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Available balance</span>
                  </div>
                </>
              ) : (
                <div className="py-4 sm:py-6">
                  <div className="text-sm sm:text-base text-gray-500 mb-2">No wallet found</div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Please contact your administrator</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Petty Cash Wallet Card */}
          <Card className={`border-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br ${hasPettyCashWallet ? 'from-green-50 to-white border-green-200' : 'from-gray-50 to-white border-gray-200'}`}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-2.5 rounded-lg ${hasPettyCashWallet ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <DollarSign className={`h-4 w-4 sm:h-5 sm:w-5 ${hasPettyCashWallet ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">Petty Cash</CardTitle>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      {hasPettyCashWallet ? (pettyCashWallet?.currency?.name || 'Currency') : 'Not configured'}
                    </p>
                  </div>
                </div>
                {hasPettyCashWallet ? (
                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 border-gray-300 text-gray-500">
                    Not Set
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {walletsLoading ? (
                <div className="flex items-center gap-2 py-4 sm:py-6">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-600" />
                  <span className="text-xs sm:text-sm text-gray-600">Loading balance...</span>
                </div>
              ) : hasPettyCashWallet ? (
                <>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(pettyCashBalance, pettyCurrency)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Available balance</span>
                  </div>
                </>
              ) : (
                <div className="py-4 sm:py-6">
                  <div className="text-sm sm:text-base text-gray-500 mb-2">Petty cash wallet not set up</div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Contact your administrator to set up petty cash</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bill Payments List */}
      <Card className="shadow-lg border-2 border-gray-200">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Bill Payments</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage your bill payment history</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                await fetchBillPayments();
                await refreshWallets();
              }}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                <p className="text-xs sm:text-sm text-gray-500">Loading bill payments...</p>
              </div>
            </div>
          ) : billPayments.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">No bill payments found</p>
              <p className="text-xs sm:text-sm text-gray-400">Create your first bill payment to get started</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {billPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                          {payment.biller_name}
                        </h3>
                        <Badge className={`${getStatusColor(payment.status)} text-[10px] sm:text-xs px-2 py-0.5`}>
                          {(payment.status || 'pending').toUpperCase()}
                        </Badge>
                        {payment.type && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                            {getTypeLabel(payment.type)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-700">Account:</span>
                          <span className="truncate">{payment.account_number}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-700">Wallet:</span>
                          <span>{payment.wallet_type === 'petty_cash_wallet' ? 'Petty Cash' : 'Main Wallet'}</span>
                        </div>
                        {payment.reference && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-700">Reference:</span>
                            <span className="truncate">{payment.reference}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-700">Date:</span>
                          <span>{new Date(payment.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 sm:text-right">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency.symbol)}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {new Date(payment.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Bills Form Dialog */}
      <PayBillsForm 
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setInitialCategory(undefined);
          setInitialProvider(undefined);
          setFormData(prev => ({
            ...prev,
            account_number: ''
          }));
        }}
        initialCategory={initialCategory}
        initialProvider={initialProvider}
        initialAccountNumber={formData.account_number}
      />
      </div>
    </div>
  );
};

export default PayBills;
