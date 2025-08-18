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
  ArrowUpRight, 
  ArrowDownRight, 
  Building, 
  Phone,
  Send,
  Banknote,
  Target,
  Calendar,
  BarChart3,
  Plus,
  ChevronRight
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
      },
      {
        id: '5',
        type: 'Bulk Payment',
        amount: 1200000,
        status: 'completed',
        date: '2024-01-18',
        description: 'Vendor payments Q1'
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                  Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>!
                </p>
              </div>
            </div>
            
            {/* Mobile Deposit Button */}
            <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg h-8 sm:h-9 px-3 sm:px-4">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Deposit</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Select Bank for Deposit
                  </DialogTitle>
                  <DialogDescription>
                    Choose bank account and transfer amount
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-amount">Amount (UGX)</Label>
                    <Input
                      id="bank-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={bankTransferData.amount}
                      onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-account">Select Bank Account</Label>
                    <Select 
                      value={bankTransferData.bankAccount} 
                      onValueChange={(value) => setBankTransferData({...bankTransferData, bankAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                        <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                        <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                        <SelectItem value="equity-6789">Equity Bank - ***6789</SelectItem>
                        <SelectItem value="bank-of-africa-1234">Bank of Africa - ***1234</SelectItem>
                        <SelectItem value="crane-bank-5678">Crane Bank - ***5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-description">Description</Label>
                    <Input
                      id="bank-description"
                      placeholder="Transfer description"
                      value={bankTransferData.description}
                      onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSendToBank} className="w-full">
                    Confirm Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile-First Layout */}
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Key Metrics - Compact Mobile Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Total Collections */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                </div>
                <Badge className="bg-white/80 text-emerald-700 border-emerald-200 text-xs px-1.5 py-0.5">
                  +12.5%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Collections</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  UGX {(dashboardData.totalCollections / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">from last month</span>
                  <span className="sm:hidden">+12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <Badge className="bg-white/80 text-red-700 border-red-200 text-xs px-1.5 py-0.5">
                  -2.1%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Wallet</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  UGX {(dashboardData.walletBalance / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDown className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">from last week</span>
                  <span className="sm:hidden">-2.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Petty Cash Balance */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <Badge className="bg-white/80 text-emerald-700 border-emerald-200 text-xs px-1.5 py-0.5">
                  +5.2%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Petty Cash</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  UGX {(dashboardData.pettyCashBalance / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">from last week</span>
                  <span className="sm:hidden">+5.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Transactions */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <Badge className="bg-white/80 text-emerald-700 border-emerald-200 text-xs px-1.5 py-0.5">
                  +18.1%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Transactions</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  {dashboardData.monthlyTransactions}
                </p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">from last month</span>
                  <span className="sm:hidden">+18.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar - Mobile-First */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {hasPermission('access_petty_cash') && (
              <button className="flex flex-col items-center gap-2 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Wallet className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Petty Cash</span>
              </button>
            )}
            {hasPermission('access_bulk_payments') && (
              <button className="flex flex-col items-center gap-2 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Bulk Pay</span>
              </button>
            )}
            {hasPermission('access_collections') && (
              <button className="flex flex-col items-center gap-2 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Collect</span>
              </button>
            )}
            {hasPermission('access_bank_deposits') && (
              <button className="flex flex-col items-center gap-2 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Banknote className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Deposit</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid - Mobile-First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Transactions - Compact Mobile */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
                    <CardDescription className="text-xs text-slate-600 hidden sm:block">Latest financial activities</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-slate-800">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                {dashboardData.recentTransactions.slice(0, 4).map((transaction, index) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  const TransactionIcon = getTransactionIcon(transaction.type);
                  
                  return (
                    <div key={transaction.id} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 bg-slate-50/50 hover:bg-white">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="relative">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-white group-hover:bg-slate-50 transition-colors">
                            <TransactionIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-white shadow-sm">
                            <StatusIcon className="h-2 w-2 text-slate-500" />
                          </div>
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className="font-medium text-xs sm:text-sm text-slate-900 truncate">{transaction.type}</p>
                            <Badge className={`${getStatusColor(transaction.status)} text-xs px-1.5 py-0.5`}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{transaction.description}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs sm:text-sm text-slate-900">
                          UGX {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Side Panel - Compact Mobile */}
          <div className="space-y-4 sm:space-y-6">
            {/* Pending Approvals - Compact */}
            {hasPermission('approve_transactions') && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardHeader className="border-b border-amber-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <CardTitle className="text-sm font-semibold text-slate-900">Pending Approvals</CardTitle>
                    </div>
                    <Badge className="bg-amber-500 text-white shadow-sm text-xs">
                      {dashboardData.pendingApprovals}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/60 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-slate-700">Transactions</span>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">5</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/60 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-slate-700">Funding</span>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">3</Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 shadow-sm h-7 sm:h-8 text-xs">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Review All
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Metrics - Compact */}
            {hasPermission('manage_team') && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                <CardHeader className="border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-900">Team Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="text-center p-2 rounded-lg bg-white/60 border border-indigo-100">
                      <div className="text-base sm:text-lg font-bold text-slate-900">{dashboardData.teamMetrics.totalStaff}</div>
                      <div className="text-xs text-slate-600">Total Staff</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/60 border border-indigo-100">
                      <div className="text-base sm:text-lg font-bold text-emerald-600">{dashboardData.teamMetrics.activeStaff}</div>
                      <div className="text-xs text-slate-600">Active Today</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-700">Monthly Budget</span>
                      <span className="text-xs font-bold text-slate-900">
                        {Math.round(dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100)}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100} 
                        className="h-2 bg-slate-100"
                      />
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>UGX {(dashboardData.teamMetrics.budgetUsed / 1000000).toFixed(1)}M</span>
                        <span>UGX {(dashboardData.teamMetrics.monthlyBudget / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wallet Actions - Compact */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Wallet Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-2">
                <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full h-8 bg-blue-600 hover:bg-blue-700 shadow-sm text-xs">
                      <Building className="h-3 w-3 mr-2" />
                      Send to Bank
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        Send to Bank
                      </DialogTitle>
                      <DialogDescription>
                        Transfer funds from wallet to bank account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-bank-amount">Amount (UGX)</Label>
                        <Input
                          id="wallet-bank-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={bankTransferData.amount}
                          onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wallet-bank-account">Bank Account</Label>
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
                            <SelectItem value="equity-6789">Equity Bank - ***6789</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wallet-bank-description">Description</Label>
                        <Input
                          id="wallet-bank-description"
                          placeholder="Transfer description"
                          value={bankTransferData.description}
                          onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleSendToBank} className="w-full">
                        Send to Bank
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full h-8 border-blue-200 hover:bg-blue-50 text-xs">
                      <Phone className="h-3 w-3 mr-2" />
                      Withdraw by Phone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        Withdraw by Phone
                      </DialogTitle>
                      <DialogDescription>
                        Send money to mobile money account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-withdraw-amount">Amount (UGX)</Label>
                        <Input
                          id="wallet-withdraw-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={withdrawData.amount}
                          onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wallet-withdraw-phone">Phone Number</Label>
                        <Input
                          id="wallet-withdraw-phone"
                          placeholder="+256701234567"
                          value={withdrawData.phoneNumber}
                          onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wallet-withdraw-description">Description</Label>
                        <Input
                          id="wallet-withdraw-description"
                          placeholder="Withdrawal description"
                          value={withdrawData.description}
                          onChange={(e) => setWithdrawData({...withdrawData, description: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleWithdraw} className="w-full">
                        Withdraw
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;