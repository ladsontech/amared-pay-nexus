import React, { useState } from 'react';
import { CreditCard, Wallet, DollarSign, Receipt, AlertCircle, CheckCircle } from 'lucide-react';

interface Bill {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface FundingSource {
  id: 'main_wallet' | 'petty_cash';
  name: string;
  balance: number;
  icon: React.ReactNode;
}

const PayBills: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedFundingSource, setSelectedFundingSource] = useState<'main_wallet' | 'petty_cash'>('petty_cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Demo data for bills
  const [bills] = useState<Bill[]>([
    {
      id: '1',
      vendor: 'Office Supplies Ltd',
      description: 'Stationery and office materials',
      amount: 150000,
      dueDate: '2025-01-25',
      category: 'Office Supplies',
      status: 'pending'
    },
    {
      id: '2',
      vendor: 'Internet Service Provider',
      description: 'Monthly internet subscription',
      amount: 250000,
      dueDate: '2025-01-20',
      category: 'Utilities',
      status: 'overdue'
    },
    {
      id: '3',
      vendor: 'Cleaning Services Co.',
      description: 'Office cleaning services',
      amount: 80000,
      dueDate: '2025-01-30',
      category: 'Services',
      status: 'pending'
    },
    {
      id: '4',
      vendor: 'Security Company',
      description: 'Monthly security services',
      amount: 300000,
      dueDate: '2025-01-28',
      category: 'Security',
      status: 'pending'
    }
  ]);

  // Demo funding sources with balances
  const fundingSources: FundingSource[] = [
    {
      id: 'main_wallet',
      name: 'Main Wallet',
      balance: 2500000,
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'petty_cash',
      name: 'Petty Cash',
      balance: 500000,
      icon: <DollarSign className="w-5 h-5" />
    }
  ];

  const selectedSource = fundingSources.find(source => source.id === selectedFundingSource);
  const hasInsufficientFunds = selectedBill && selectedSource && selectedBill.amount > selectedSource.balance;

  const handlePayBill = async () => {
    if (!selectedBill || !selectedSource || hasInsufficientFunds) return;

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setPaymentSuccess(`Bill paid successfully from ${selectedSource.name}`);
      setSelectedBill(null);
      setIsProcessing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPaymentSuccess(null), 3000);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Bills</h1>
        <p className="text-gray-600">Manage and pay your organization's bills from available funding sources</p>
      </div>

      {paymentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">{paymentSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bills List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pending Bills</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className={`p-6 cursor-pointer transition-colors ${
                    selectedBill?.id === bill.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBill(bill)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{bill.vendor}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{bill.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">Category: {bill.category}</span>
                        <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
            </div>
            
            {selectedBill ? (
              <div className="p-6 space-y-6">
                {/* Selected Bill Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedBill.vendor}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedBill.description}</p>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedBill.amount)}
                  </div>
                </div>

                {/* Funding Source Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Funding Source *
                  </label>
                  <div className="space-y-3">
                    {fundingSources.map((source) => (
                      <label
                        key={source.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFundingSource === source.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fundingSource"
                          value={source.id}
                          checked={selectedFundingSource === source.id}
                          onChange={(e) => setSelectedFundingSource(e.target.value as 'main_wallet' | 'petty_cash')}
                          className="sr-only"
                        />
                        <div className="flex items-center flex-1">
                          <div className="mr-3 text-gray-600">
                            {source.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{source.name}</div>
                            <div className="text-sm text-gray-600">
                              Available: {formatCurrency(source.balance)}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedFundingSource === source.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedFundingSource === source.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Balance Check Warning */}
                {hasInsufficientFunds && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Insufficient Funds</p>
                      <p className="text-red-700 text-sm mt-1">
                        The selected funding source has insufficient balance to pay this bill.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePayBill}
                  disabled={isProcessing || hasInsufficientFunds}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    isProcessing || hasInsufficientFunds
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Bill
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a bill to proceed with payment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBills;