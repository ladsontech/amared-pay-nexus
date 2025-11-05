import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { organizationService } from "@/services/organizationService";
import { paymentService } from "@/services/paymentService";
import AddTransaction from "@/components/petty-cash/AddTransaction";
import TransactionHistory from "@/components/petty-cash/TransactionHistory";
import PettyCashOverview from "@/components/petty-cash/PettyCashOverview";
import PettyCashReconciliation from "@/components/petty-cash/PettyCashReconciliation";
import PendingApprovals from "@/components/petty-cash/PendingApprovals";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";
import { useSearchParams, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
const PettyCash = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as string || "overview";
  const transactionTypeParam = searchParams.get("type") as "expense" | "addition" | null;
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update activeTab when URL params change (e.g., when navigating from overview cards)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || "overview";
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const {
    toast
  } = useToast();
  const {
    hasPermission
  } = useAuth();
  const {
    wallets,
    pettyCashWallets,
    pettyCashTransactions,
    pettyCashExpenses,
    loading,
    error,
    fetchPettyCashWallets
  } = useOrganization();
  const { user } = useAuth();

  // Calculate current balance from petty cash wallets
  const currentBalance = pettyCashWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);

  // Get main wallet and petty cash wallet for bill payments
  const mainWallet = wallets.find(w => !w.petty_cash_wallet);
  const pettyCashWallet = pettyCashWallets && pettyCashWallets.length > 0 ? pettyCashWallets[0] : null;

  // Get balances from API
  const mainBalance = mainWallet?.balance ?? 0;
  const pettyCashBalance = pettyCashWallet?.balance ?? 0;
  const mainCurrency = mainWallet?.currency?.symbol || mainWallet?.currency?.name || 'UGX';
  const pettyCurrency = pettyCashWallet?.currency?.symbol || pettyCashWallet?.currency?.name || 'UGX';

  // Format balance with abbreviation (e.g., 12.3M, 850K)
  const formatBalance = (amount: number, currency: string = 'UGX') => {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(0)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Load currencies when dialog opens
  const handleOpenCreateWallet = async () => {
    setIsCreateWalletOpen(true);
    setIsLoadingCurrencies(true);
    try {
      const currenciesResponse = await paymentService.getCurrencies();
      setCurrencies(currenciesResponse.results || []);
      // Set default currency if main wallet exists
      if (mainWallet?.currency?.id) {
        setSelectedCurrency(mainWallet.currency.id.toString());
      }
    } catch (error) {
      console.error("Error loading currencies:", error);
      toast({
        title: "Error",
        description: "Failed to load currencies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  // Create petty cash wallet
  const handleCreateWallet = async () => {
    if (!selectedCurrency || !user?.organizationId) {
      toast({
        title: "Missing Information",
        description: "Please select a currency",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingWallet(true);
    try {
      await organizationService.createPettyCashWallet({
        organization: user.organizationId,
        currency: parseInt(selectedCurrency),
        updated_by: user.id,
        balance: 0
      });

      toast({
        title: "Success",
        description: "Petty cash wallet created successfully",
      });

      // Refresh petty cash wallets
      await fetchPettyCashWallets();
      
      setIsCreateWalletOpen(false);
      setSelectedCurrency("");
    } catch (error: any) {
      console.error("Error creating petty cash wallet:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create petty cash wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Debug logging
  console.log('PettyCash Debug:', {
    loading,
    error,
    pettyCashWallets: pettyCashWallets.length,
    pettyCashTransactions: pettyCashTransactions.length,
    pettyCashExpenses: pettyCashExpenses.length,
    currentBalance
  });
  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading petty cash data...</span>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Petty Cash Data</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
        
        {/* Fallback petty cash overview */}
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-bold text-black mb-4">Petty Cash Overview (Offline Mode)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-medium">Current Balance</h3>
              <p className="text-blue-700 text-2xl font-bold">UGX 0</p>
              <p className="text-blue-600 text-xs">Unable to load data</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-medium">Monthly Spending</h3>
              <p className="text-blue-700 text-2xl font-bold">UGX 0</p>
              <p className="text-blue-600 text-xs">Unable to load data</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-medium">Pending Approvals</h3>
              <p className="text-blue-700 text-2xl font-bold">0</p>
              <p className="text-blue-600 text-xs">Unable to load data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="space-y-3 sm:space-y-6 pb-20 md:pb-0 bg-gray-50 md:bg-white">
      {/* Mobile Header - Compact */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm -mx-2 px-3 py-2.5 mb-3">
        <h1 className="text-lg font-bold text-black">Petty Cash</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage transactions</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Petty Cash Management</h1>
          <p className="text-sm text-muted-foreground">Manage petty cash transactions and requests</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {hasPermission("view_department_reports") && <Button variant="outline" asChild>
              <Link to="/org/reports/petty-cash" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>View Petty Cash Report</span>
              </Link>
            </Button>}
          
          <Button variant="default" onClick={() => setActiveTab("add")} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={val => {
      setActiveTab(val);
      setSearchParams(prev => {
        const p = new URLSearchParams(prev);
        p.set('tab', val);
        // Clear type param when switching away from add tab
        if (val !== 'add') {
          p.delete('type');
        }
        return p;
      });
    }} className="w-full">
        <TabsContent value="overview" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
          <div className="bg-white">
            <PettyCashOverview 
              currentBalance={currentBalance} 
              pettyCashWallets={pettyCashWallets}
              pettyCashTransactions={pettyCashTransactions}
              pettyCashExpenses={pettyCashExpenses}
            />
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
          <Card className="bg-white border border-gray-100 shadow-sm md:shadow-lg">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg font-bold text-black flex items-center gap-2">
                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Add New Transaction
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600">
                Submit a new petty cash request for approval
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <AddTransaction 
                currentBalance={currentBalance} 
                initialTransactionType={transactionTypeParam || undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm md:shadow-lg">
            <TransactionHistory />
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm md:shadow-lg">
            <PendingApprovals />
          </div>
        </TabsContent>
        
        <TabsContent value="reconciliation" className="space-y-3 md:space-y-4 mt-4 md:mt-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm md:shadow-lg">
            <PettyCashReconciliation currentBalance={currentBalance} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Petty Cash Wallet Dialog */}
      <Dialog open={isCreateWalletOpen} onOpenChange={setIsCreateWalletOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Petty Cash Wallet</DialogTitle>
            <DialogDescription>
              Create a new petty cash wallet for your organization. This wallet will be used for petty cash transactions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              {isLoadingCurrencies ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Loading currencies...</span>
                </div>
              ) : (
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id.toString()}>
                        {currency.symbol} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-gray-500">
                Select the currency for this petty cash wallet. This should typically match your main wallet currency.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateWalletOpen(false);
                setSelectedCurrency("");
              }}
              disabled={isCreatingWallet}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWallet}
              disabled={isCreatingWallet || !selectedCurrency || isLoadingCurrencies}
            >
              {isCreatingWallet ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default PettyCash;