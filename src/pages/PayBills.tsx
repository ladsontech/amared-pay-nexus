import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, DollarSign, Receipt, AlertCircle, CheckCircle, RefreshCw, Loader2, Zap, Droplets, Tv, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService, BillPayment } from '@/services/organizationService';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PayBillsForm from '@/components/PayBillsForm';

const PayBills: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wallets, fetchWallets, fetchPettyCashWallets, pettyCashWallets: hookPettyCashWallets } = useOrganization();
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string>('');

  // Store category and provider from URL for passing to PayBillsForm
  const [initialCategory, setInitialCategory] = useState<string | undefined>();
  const [initialProvider, setInitialProvider] = useState<string | undefined>();

  const billTypes = [
    { 
      id: "water", 
      name: "Water", 
      icon: Droplets,
    },
    { 
      id: "electricity", 
      name: "Electricity", 
      icon: Zap,
    },
    { 
      id: "tv", 
      name: "TV", 
      icon: Tv,
    },
    { 
      id: "tax", 
      name: "Tax", 
      icon: Building2,
    }
  ];

  // Check if we have category and provider from desktop navigation
  useEffect(() => {
    const category = searchParams.get('category');
    const provider = searchParams.get('provider');
    const cardNumber = searchParams.get('cardNumber');
    const isMobile = window.innerWidth < 768;
    
    // Only auto-open dialog on desktop, not mobile
    if (category && provider && !isMobile) {
      // Store the values and open the form dialog
      setInitialCategory(category);
      setInitialProvider(provider);
      setIsCreateDialogOpen(true);
      // Clear the URL params
      setSearchParams({});
    } else if (category && provider && isMobile) {
      // On mobile, clear params and let user navigate through pages
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

  const handleBillTypeSelect = (billId: string) => {
    setSelectedBill(billId);
    // Navigate to provider selection on mobile, open form on desktop
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      navigate(`/org/pay-bills/provider-selection?category=${billId}`);
    } else {
      setIsCreateDialogOpen(true);
      setInitialCategory(billId);
      setInitialProvider(undefined);
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
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Pay Bills</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage and pay your organization's bills from available funding sources</p>
        </div>

        {/* Wallet Balances - Two Column Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-6">
          {/* Main Wallet Card */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6 pt-3 sm:pt-6">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="p-1 sm:p-2 rounded-lg bg-blue-100 flex-shrink-0">
                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">Main Wallet</CardTitle>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{mainWallet?.currency?.name || 'Currency'}</p>
                  </div>
                </div>
                {mainWallet && (
                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 flex-shrink-0">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              {walletsLoading ? (
                <div className="flex items-center gap-1 sm:gap-2 py-3 sm:py-6">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin text-blue-600" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Loading...</span>
                </div>
              ) : mainWallet ? (
                <>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 break-words">
                    {formatCurrency(mainBalance, mainCurrency)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                    <span className="truncate">Available</span>
                  </div>
                </>
              ) : (
                <div className="py-3 sm:py-6">
                  <div className="text-xs sm:text-sm md:text-base text-gray-500 mb-1">No wallet</div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Contact admin</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Petty Cash Wallet Card */}
          <Card className={`border shadow-sm hover:shadow-md transition-shadow ${hasPettyCashWallet ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6 pt-3 sm:pt-6">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className={`p-1 sm:p-2 rounded-lg flex-shrink-0 ${hasPettyCashWallet ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${hasPettyCashWallet ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">Petty Cash</CardTitle>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                      {hasPettyCashWallet ? (pettyCashWallet?.currency?.name || 'Currency') : 'Not configured'}
                    </p>
                  </div>
                </div>
                {hasPettyCashWallet ? (
                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 flex-shrink-0">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 border-gray-300 text-gray-500 flex-shrink-0">
                    Not Set
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
              {walletsLoading ? (
                <div className="flex items-center gap-1 sm:gap-2 py-3 sm:py-6">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin text-gray-600" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">Loading...</span>
                </div>
              ) : hasPettyCashWallet ? (
                <>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 break-words">
                    {formatCurrency(pettyCashBalance, pettyCurrency)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                    <span className="truncate">Available</span>
                  </div>
                </>
              ) : (
                <div className="py-3 sm:py-6">
                  <div className="text-xs sm:text-sm md:text-base text-gray-500 mb-1">Not set up</div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Contact admin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bill Type Selection Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select Bill Type</h2>
            <p className="text-sm text-gray-600">Choose a bill category to proceed with payment</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {billTypes.map((bill) => {
              const IconComponent = bill.icon;
              const isSelected = selectedBill === bill.id;
              return (
                <Card
                  key={bill.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                  onClick={() => handleBillTypeSelect(bill.id)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <span className={`text-sm sm:text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {bill.name}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bill Payments History - Bottom of Page */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Bill Payments History</CardTitle>
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
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                            {payment.biller_name}
                          </h3>
                          <Badge className={`${getStatusColor(payment.status)} text-xs px-2 py-0.5`}>
                            {(payment.status || 'pending').toUpperCase()}
                          </Badge>
                          {payment.type && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
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
                        <p className="text-xs text-gray-500 mt-1">
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
            setSelectedBill('');
          }}
          initialCategory={initialCategory}
          initialProvider={initialProvider}
          initialAccountNumber={undefined}
        />
      </div>
    </div>
  );
};

export default PayBills;
