import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building, 
  Phone,
  Send,
  Target,
  Calendar,
  BarChart3,
  ChevronRight,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrgDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [sendToBankOpen, setSendToBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankTransferData, setBankTransferData] = useState({
    amount: "",
    bankAccount: "",
    description: ""
  });
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    phoneNumber: "+256",
    description: ""
  });

  const dashboardData = {
    totalCollections: 45600000,
    walletBalance: 12300000,
    pettyCashBalance: 850000,
    monthlyTransactions: 1247,
    pendingApprovals: 8,
    recentTransactions: [
      {
        id: '1',
        type: 'Petty Cash',
        amount: 125000,
        status: 'approved',
        date: '2024-01-20',
        description: 'Office supplies purchase'
      },
      {
        id: '2',
        type: 'Bulk Payment',
        amount: 2500000,
        status: 'pending',
        date: '2024-01-20',
        description: 'Monthly salary disbursement'
      },
      {
        id: '3',
        type: 'Collection',
        amount: 850000,
        status: 'completed',
        date: '2024-01-19',
        description: 'Client payment received'
      },
      {
        id: '4',
        type: 'Petty Cash',
        amount: 75000,
        status: 'rejected',
        date: '2024-01-19',
        description: 'Travel expense claim'
      }
    ],
    teamMetrics: {
      totalStaff: 12,
      activeStaff: 9,
      monthlyBudget: 5000000,
      budgetUsed: 3200000
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-black bg-gray-100';
      case 'rejected':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Petty Cash':
        return Wallet;
      case 'Bulk Payment':
        return Send;
      case 'Collection':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const handleSendToBank = () => {
    if (!bankTransferData.amount || !bankTransferData.bankAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bank Transfer Initiated",
      description: `Transfer of UGX ${parseFloat(bankTransferData.amount).toLocaleString()} has been submitted for processing`,
    });
    setBankTransferData({ amount: "", bankAccount: "", description: "" });
    setSendToBankOpen(false);
  };

  const handleWithdraw = () => {
    if (!withdrawData.amount || !withdrawData.phoneNumber) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of UGX ${parseFloat(withdrawData.amount).toLocaleString()} to ${withdrawData.phoneNumber} has been submitted`,
    });
    setWithdrawData({ amount: "", phoneNumber: "+256", description: "" });
    setWithdrawOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-black">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {/* Desktop View */}
        <div className="hidden md:block space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Balance Card with Quick Actions */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Total Balance</h3>
                      <p className="text-blue-100 text-sm">Available funds</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 opacity-70" />
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-bold mb-2">UGX {(dashboardData.walletBalance / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-blue-100">+12.5% this month</span>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                        <Building className="h-4 w-4 mr-2" />
                        Send to Bank
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send to Bank</DialogTitle>
                        <DialogDescription>Transfer funds to bank account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Amount (UGX)</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={bankTransferData.amount}
                            onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bank Account</Label>
                          <Select 
                            value={bankTransferData.bankAccount} 
                            onValueChange={(value) => setBankTransferData({...bankTransferData, bankAccount: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                              <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                              <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Transfer description"
                            value={bankTransferData.description}
                            onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleSendToBank} className="w-full">
                          Confirm Transfer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Withdraw by Phone</DialogTitle>
                        <DialogDescription>Send money to mobile money account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Amount (UGX)</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={withdrawData.amount}
                            onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            placeholder="+256701234567"
                            value={withdrawData.phoneNumber}
                            onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Withdrawal description"
                            value={withdrawData.description}
                            onChange={(e) => setWithdrawData({...withdrawData, description: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleWithdraw} className="w-full">
                          Confirm Withdrawal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Other Balance Cards */}
            <div className="space-y-4">
              <Card className="bg-white border border-gray-100 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Collections</h4>
                      <p className="text-xs text-gray-500">Total received</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-black">UGX {(dashboardData.totalCollections / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-gray-600">+8.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Petty Cash</h4>
                      <p className="text-xs text-gray-500">Available cash</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-black">UGX {(dashboardData.pettyCashBalance / 1000).toFixed(0)}K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-gray-600">+5.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Desktop Other Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Collections Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Collections</span>
                    <span className="text-lg font-bold text-black">UGX {(dashboardData.totalCollections / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Petty Cash</span>
                    <span className="text-lg font-bold text-black">UGX {(dashboardData.pettyCashBalance / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentTransactions.slice(0, 3).map((transaction) => {
                    const StatusIcon = getStatusIcon(transaction.status);
                    const TransactionIcon = getTransactionIcon(transaction.type);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <TransactionIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">{transaction.type}</p>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-black">UGX {(transaction.amount / 1000).toFixed(0)}K</p>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {/* Balance Cards - Compact */}
          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">Total Balance</span>
              </div>
              <Eye className="h-4 w-4 opacity-70" />
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold">UGX {(dashboardData.walletBalance / 1000000).toFixed(1)}M</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+12.5% this month</span>
              </div>
            </div>
            
            {/* Mobile Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs py-2">
                    <Building className="h-3 w-3 mr-1" />
                    Send to Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4">
                  <DialogHeader>
                    <DialogTitle>Send to Bank</DialogTitle>
                    <DialogDescription>Transfer funds to bank account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (UGX)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={bankTransferData.amount}
                        onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Account</Label>
                      <Select 
                        value={bankTransferData.bankAccount} 
                        onValueChange={(value) => setBankTransferData({...bankTransferData, bankAccount: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                          <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                          <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Transfer description"
                        value={bankTransferData.description}
                        onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleSendToBank} className="w-full bg-blue-600 hover:bg-blue-700">
                      Confirm Transfer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs py-2">
                    <Phone className="h-3 w-3 mr-1" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4">
                  <DialogHeader>
                    <DialogTitle>Withdraw by Phone</DialogTitle>
                    <DialogDescription>Send money to mobile money account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (UGX)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        placeholder="+256701234567"
                        value={withdrawData.phoneNumber}
                        onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Withdrawal description"
                        value={withdrawData.description}
                        onChange={(e) => setWithdrawData({...withdrawData, description: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleWithdraw} className="w-full bg-blue-600 hover:bg-blue-700">
                      Confirm Withdrawal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <TrendingUp className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-black">{dashboardData.monthlyTransactions}</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            
            {hasPermission('approve_transactions') && (
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                    {dashboardData.pendingApprovals}
                  </span>
                </div>
                <p className="text-lg font-bold text-black">Pending</p>
                <p className="text-xs text-gray-500">Approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Shared Content for Both Views */}
        <div className="py-4">
          {/* Recent Transactions */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-black">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {dashboardData.recentTransactions.slice(0, 5).map((transaction) => {
              const StatusIcon = getStatusIcon(transaction.status);
              const TransactionIcon = getTransactionIcon(transaction.type);
              
              return (
                <div key={transaction.id} className="bg-white border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <TransactionIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-black truncate">{transaction.type}</p>
                          <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{transaction.description}</p>
                        <p className="text-xs text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black">
                        UGX {(transaction.amount / 1000).toFixed(0)}K
                      </p>
                      <StatusIcon className="h-3 w-3 text-gray-400 ml-auto mt-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team Budget Progress */}
          {hasPermission('manage_team') && (
            <div className="mt-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-black">Monthly Budget</h3>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100)}%
                  </span>
                </div>
                <Progress 
                  value={dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100} 
                  className="h-2 mb-3"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used: UGX {(dashboardData.teamMetrics.budgetUsed / 1000000).toFixed(1)}M</span>
                  <span>Total: UGX {(dashboardData.teamMetrics.monthlyBudget / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {hasPermission('approve_transactions') && dashboardData.pendingApprovals > 0 && (
            <div className="mt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-bold text-black">Pending Approvals</h3>
                  </div>
                  <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                    {dashboardData.pendingApprovals}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Transactions</span>
                    <span className="text-sm font-medium text-black">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Funding Requests</span>
                    <span className="text-sm font-medium text-black">3</span>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrgDashboard.displayName = "OrgDashboard";

export default OrgDashboard;