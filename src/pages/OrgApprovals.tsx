import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  DollarSign,
  Wallet,
  Calendar,
  Banknote,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const OrgApprovals = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [filterType, setFilterType] = useState<'all' | 'bills' | 'bulk_payments' | 'deposits' | 'petty_cash' | 'send_to_bank'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // All transactions (approved and pending) with expanded approval types
  const allTransactions = [
    {
      id: '1',
      type: 'petty_cash',
      typeName: 'Petty Cash',
      requester: 'John Doe',
      amount: 125000,
      description: 'Office supplies purchase',
      date: '2024-01-20',
      category: 'Office Supplies',
      receipt: 'receipt_001.pdf',
      department: 'Operations',
      status: 'pending'
    },
    {
      id: '2',
      type: 'send_to_bank',
      typeName: 'Send to Bank',
      requester: 'Finance Team',
      amount: 5000000,
      description: 'Monthly bank deposit - excess cash',
      date: '2024-01-21',
      category: 'Bank Transfer',
      receipt: null,
      department: 'Finance',
      bankDetails: 'Standard Chartered - Account: 123456789',
      status: 'pending'
    },
    {
      id: '3',
      type: 'bills',
      typeName: 'Pay Bill',
      requester: 'Operations Manager',
      amount: 850000,
      description: 'Monthly electricity bill payment',
      date: '2024-01-21',
      category: 'Utilities - Electricity',
      receipt: 'umeme_bill_jan2024.pdf',
      department: 'Operations',
      billDetails: 'UMEME - Account: 404050607080',
      status: 'pending'
    },
    {
      id: '4',
      type: 'bills',
      typeName: 'Pay Bill',
      requester: 'HR Manager',
      amount: 2500000,
      description: 'Staff airtime distribution',
      date: '2024-01-20',
      category: 'Airtime',
      receipt: null,
      department: 'HR',
      billDetails: 'MTN/Airtel - Bulk airtime purchase',
      status: 'pending'
    },
    {
      id: '5',
      type: 'send_to_bank',
      typeName: 'Send to Bank',
      requester: 'CEO',
      amount: 10000000,
      description: 'Emergency fund transfer to operations account',
      date: '2024-01-20',
      category: 'Bank Transfer',
      receipt: null,
      department: 'Executive',
      bankDetails: 'DFCU Bank - Account: 987654321',
      urgent: true,
      status: 'pending'
    },
    {
      id: '6',
      type: 'bulk_payments',
      typeName: 'Bulk Payment',
      requester: 'Finance Manager',
      amount: 7500000,
      description: 'Monthly supplier payments batch',
      date: '2024-01-19',
      category: 'Supplier Payments',
      receipt: 'bulk_payment_jan.xlsx',
      department: 'Finance',
      recipientCount: 15,
      status: 'approved'
    },
    {
      id: '7',
      type: 'deposits',
      typeName: 'Bank Deposit',
      requester: 'Accounts Team',
      amount: 3200000,
      description: 'Daily collections deposit',
      date: '2024-01-18',
      category: 'Collections',
      receipt: 'deposit_slip_123.pdf',
      department: 'Finance',
      status: 'approved'
    }
  ];

  const pendingFunding = [
    {
      id: 'f1',
      requester: 'Finance Team',
      amount: 2000000,
      description: 'Monthly petty cash replenishment',
      date: '2024-01-20',
      currentBalance: 250000,
      requestedBalance: 2250000,
      department: 'Finance'
    },
    {
      id: 'f2',
      requester: 'Operations',
      amount: 500000,
      description: 'Additional budget for Q1 activities',
      date: '2024-01-19',
      currentBalance: 100000,
      requestedBalance: 600000,
      department: 'Operations'
    }
  ];

  const handleApprove = (id: string, type: 'transaction' | 'funding') => {
    toast({
      title: "Approved",
      description: `${type === 'transaction' ? 'Transaction' : 'Funding request'} has been approved successfully.`,
    });
  };

  const handleReject = (id: string, type: 'transaction' | 'funding') => {
    toast({
      title: "Rejected", 
      description: `${type === 'transaction' ? 'Transaction' : 'Funding request'} has been rejected.`,
      variant: "destructive",
    });
  };

  // Filter transactions based on active tab, type filter, and search
  const filteredTransactions = allTransactions.filter(transaction => {
    // Status filter
    if (activeTab === 'pending' && transaction.status !== 'pending') {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.requester.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const filteredFunding = pendingFunding.filter(funding =>
    funding.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funding.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 -mx-6 px-6 py-4 mb-4">
        <h1 className="text-xl font-bold text-black">Approvals</h1>
        <p className="text-sm text-gray-600">Review and approve pending requests</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl md:text-3xl font-bold">Approvals</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Review and approve pending requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={(value: typeof filterType) => setFilterType(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bills">Bill Payments</SelectItem>
            <SelectItem value="bulk_payments">Bulk Payments</SelectItem>
            <SelectItem value="deposits">Bank Deposits</SelectItem>
            <SelectItem value="petty_cash">Petty Cash</SelectItem>
            <SelectItem value="send_to_bank">Send to Bank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'all')} className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-2'}`}>
          <TabsTrigger 
            value="pending" 
            className={isMobile ? 'w-full justify-start mb-1' : ''}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({allTransactions.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className={isMobile ? 'w-full justify-start' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            All Approvals ({allTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'send_to_bank' ? 'bg-blue-100' :
                            transaction.type === 'bills' ? 'bg-purple-100' :
                            transaction.type === 'bulk_payments' ? 'bg-green-100' :
                            transaction.type === 'deposits' ? 'bg-indigo-100' :
                            'bg-orange-100'
                          }`}>
                            {transaction.type === 'send_to_bank' ? 
                              <Banknote className="h-4 w-4 text-blue-600" /> :
                              transaction.type === 'bills' ?
                              <Wallet className="h-4 w-4 text-purple-600" /> :
                              transaction.type === 'bulk_payments' ?
                              <Send className="h-4 w-4 text-green-600" /> :
                              transaction.type === 'deposits' ?
                              <DollarSign className="h-4 w-4 text-indigo-600" /> :
                              <Clock className="h-4 w-4 text-orange-600" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{transaction.typeName}</h3>
                              {transaction.urgent && (
                                <Badge variant="destructive" className="text-xs">URGENT</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Requested by {transaction.requester} • {transaction.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant={transaction.status === 'pending' ? 'outline' : 'default'} 
                               className={transaction.status === 'pending' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}>
                          {transaction.status === 'pending' ? 'Pending' : 'Approved'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Amount</Label>
                          <p className="font-medium">UGX {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium">{transaction.category}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                      </div>
                      
                      {/* Additional details for different transaction types */}
                      {(transaction.bankDetails || transaction.billDetails || transaction.recipientCount) && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <Label className="text-muted-foreground text-xs">
                            {transaction.type === 'send_to_bank' ? 'Bank Details' : 
                             transaction.type === 'bills' ? 'Bill Details' :
                             transaction.type === 'bulk_payments' ? 'Payment Details' : 'Details'}
                          </Label>
                          <p className="font-medium text-sm">
                            {transaction.bankDetails || transaction.billDetails || 
                             (transaction.recipientCount && `${transaction.recipientCount} recipients`)}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label className="text-muted-foreground">Receipt:</Label>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          {transaction.receipt}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48">
                      {transaction.status === 'pending' ? (
                        <>
                          <Button 
                            onClick={() => handleApprove(transaction.id, 'transaction')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReject(transaction.id, 'transaction')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge variant="default" className="text-center py-2">
                          Already Approved
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending transactions</h3>
                  <p className="text-muted-foreground">All transaction requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'send_to_bank' ? 'bg-blue-100' :
                            transaction.type === 'bills' ? 'bg-purple-100' :
                            transaction.type === 'bulk_payments' ? 'bg-green-100' :
                            transaction.type === 'deposits' ? 'bg-indigo-100' :
                            'bg-orange-100'
                          }`}>
                            {transaction.type === 'send_to_bank' ? 
                              <Banknote className="h-4 w-4 text-blue-600" /> :
                              transaction.type === 'bills' ?
                              <Wallet className="h-4 w-4 text-purple-600" /> :
                              transaction.type === 'bulk_payments' ?
                              <Send className="h-4 w-4 text-green-600" /> :
                              transaction.type === 'deposits' ?
                              <DollarSign className="h-4 w-4 text-indigo-600" /> :
                              <Clock className="h-4 w-4 text-orange-600" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{transaction.typeName}</h3>
                              {transaction.urgent && (
                                <Badge variant="destructive" className="text-xs">URGENT</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Requested by {transaction.requester} • {transaction.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant={transaction.status === 'pending' ? 'outline' : 'default'} 
                               className={transaction.status === 'pending' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}>
                          {transaction.status === 'pending' ? 'Pending' : 'Approved'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Amount</Label>
                          <p className="font-medium">UGX {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium">{transaction.category}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                      </div>
                      
                      {/* Additional details for different transaction types */}
                      {(transaction.bankDetails || transaction.billDetails || transaction.recipientCount) && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <Label className="text-muted-foreground text-xs">
                            {transaction.type === 'send_to_bank' ? 'Bank Details' : 
                             transaction.type === 'bills' ? 'Bill Details' :
                             transaction.type === 'bulk_payments' ? 'Payment Details' : 'Details'}
                          </Label>
                          <p className="font-medium text-sm">
                            {transaction.bankDetails || transaction.billDetails || 
                             (transaction.recipientCount && `${transaction.recipientCount} recipients`)}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      
                      {transaction.receipt && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-muted-foreground">Receipt:</Label>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            {transaction.receipt}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48">
                      {transaction.status === 'pending' ? (
                        <>
                          <Button 
                            onClick={() => handleApprove(transaction.id, 'transaction')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReject(transaction.id, 'transaction')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge variant="default" className="text-center py-2">
                          Already Approved
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No transactions found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="funding">
          <div className="grid gap-4">
            {filteredFunding.map((funding) => (
              <Card key={funding.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Wallet className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Funding Request</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {funding.requester} • {funding.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Requested Amount</Label>
                          <p className="font-medium">UGX {funding.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Current Balance</Label>
                          <p className="font-medium">UGX {funding.currentBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{funding.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Justification</Label>
                        <p className="font-medium">{funding.description}</p>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                          <span>New Balance After Approval:</span>
                          <span className="font-bold text-green-600">
                            UGX {funding.requestedBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => handleApprove(funding.id, 'funding')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(funding.id, 'funding')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredFunding.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending funding requests</h3>
                  <p className="text-muted-foreground">All funding requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgApprovals;