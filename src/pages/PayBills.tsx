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

const PayBills: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { organization, wallets } = useOrganization();
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Fetch bill payments
  useEffect(() => {
    fetchBillPayments();
  }, [user?.organizationId, refreshKey]);

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
    const selectedWallet = wallets.find(w => 
      formData.wallet_type === 'main_wallet' 
        ? !w.petty_cash_wallet 
        : w.petty_cash_wallet !== null
    );

    if (!selectedWallet) {
      toast({
        title: 'Error',
        description: `No ${formData.wallet_type === 'main_wallet' ? 'main' : 'petty cash'} wallet found`,
        variant: 'destructive',
      });
      return;
    }

    // Check balance
    const balance = selectedWallet.balance || 0;
    if (formData.amount > balance) {
      toast({
        title: 'Insufficient Funds',
        description: `Available balance: ${selectedWallet.currency.symbol} ${balance.toLocaleString()}`,
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
      case 'electricity': return 'Electricity';
      case 'water': return 'Water';
      case 'internet': return 'Internet';
      case 'airtime': return 'Airtime';
      default: return 'Other';
    }
  };

  // Get wallet balances
  const mainWallet = wallets.find(w => !w.petty_cash_wallet);
  const pettyCashWallet = wallets.find(w => w.petty_cash_wallet !== null);

  const mainBalance = mainWallet?.balance || 0;
  const pettyCashBalance = pettyCashWallet?.balance || 0;
  const mainCurrency = mainWallet?.currency.symbol || 'UGX';
  const pettyCurrency = pettyCashWallet?.currency.symbol || 'UGX';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Bills</h1>
          <p className="text-gray-600">Manage and pay your organization's bills from available funding sources</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bill Payment
        </Button>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Main Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mainBalance, mainCurrency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mainWallet?.currency.name || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Petty Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pettyCashBalance, pettyCurrency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pettyCashWallet?.currency.name || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bill Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bill Payments</CardTitle>
              <CardDescription>View and manage your bill payment history</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchBillPayments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : billPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No bill payments found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first bill payment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{payment.biller_name}</h3>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status || 'pending'}
                        </Badge>
                        {payment.type && (
                          <Badge variant="outline">
                            {getTypeLabel(payment.type)}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Account:</span> {payment.account_number}
                        </div>
                        <div>
                          <span className="font-medium">Wallet:</span> {
                            payment.wallet_type === 'petty_cash_wallet' ? 'Petty Cash' : 'Main Wallet'
                          }
                        </div>
                        {payment.reference && (
                          <div>
                            <span className="font-medium">Reference:</span> {payment.reference}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Date:</span> {
                            new Date(payment.created_at).toLocaleDateString()
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency.symbol)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Bill Payment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bill Payment</DialogTitle>
            <DialogDescription>
              Create a new bill payment from your available wallets
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biller_name">Biller Name *</Label>
              <Input
                id="biller_name"
                value={formData.biller_name}
                onChange={(e) => setFormData({ ...formData, biller_name: e.target.value })}
                placeholder="e.g., UMEME"
                required
                maxLength={150}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Account number"
                required
                maxLength={150}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Bill Type</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => setFormData({ ...formData, type: value as any || undefined })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet_type">Wallet Type *</Label>
              <Select
                value={formData.wallet_type}
                onValueChange={(value) => setFormData({ ...formData, wallet_type: value as any })}
              >
                <SelectTrigger id="wallet_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_wallet">
                    Main Wallet ({formatCurrency(mainBalance, mainCurrency)})
                  </SelectItem>
                  <SelectItem value="petty_cash_wallet">
                    Petty Cash ({formatCurrency(pettyCashBalance, pettyCurrency)})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Payment reference"
                maxLength={150}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Create Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayBills;
