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
  ChevronRight,
  X,
  Sparkles,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";

const OrgDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [sendToBankOpen, setSendToBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
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
    // Restrict palette to blue and neutral for the demo
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'pending':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'rejected':
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 md:pb-0">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-slate-600 hidden sm:block font-medium">
                  Welcome back, <span className="font-bold text-blue-600">{user?.name}</span>!
                </p>
              </div>
            </div>

            {/* Mobile Deposit Button */}
            <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg h-9 sm:h-10 px-4 sm:px-5 font-semibold transform hover:scale-105 transition-all duration-200">
                  <Building className="h-4 w-4 mr-2" />
                  <span className="text-sm">Quick Deposit</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Quick Bank Deposit
                  </DialogTitle>
                  <DialogDescription>
                    Transfer funds to your bank account instantly
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
                  <Button onClick={handleSendToBank} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Confirm Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile-First Layout */}
      <div className="px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Key Metrics - Compact Mobile Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {/* Total Collections */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/60 transform hover:scale-105">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300 shadow-md">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <Sparkles className="h-4 w-4 text-emerald-500 opacity-60" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Collections</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-900">
                  UGX {(dashboardData.totalCollections / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-bold">+12.5%</span>
                </div>
              </div>
          </CardContent>
        </Card>

          {/* Wallet Balance */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/60 transform hover:scale-105">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-md">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <Zap className="h-4 w-4 text-blue-500 opacity-60" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-lg sm:text-xl font-bold text-blue-900">
                UGX {(dashboardData.walletBalance / 1000000).toFixed(1)}M
              </p>
                <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full w-fit">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs font-bold">-2.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Petty Cash Balance */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/60 transform hover:scale-105">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-md">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <Target className="h-4 w-4 text-purple-500 opacity-60" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Petty Cash</p>
                <p className="text-lg sm:text-xl font-bold text-purple-900">
                  UGX {(dashboardData.pettyCashBalance / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-bold">+5.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Transactions */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/60 transform hover:scale-105">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 shadow-md">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <Calendar className="h-4 w-4 text-orange-500 opacity-60" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">This Month</p>
                <p className="text-lg sm:text-xl font-bold text-orange-900">
                  {dashboardData.monthlyTransactions}
                </p>
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-bold">+8.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Mobile-First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Transactions - Compact Mobile */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-md">
                    <Activity className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Recent Transactions</CardTitle>
                    <CardDescription className="text-sm text-slate-600 hidden sm:block font-medium">Latest financial activities</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" className="text-sm text-slate-600 hover:text-slate-800 font-semibold">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {dashboardData.recentTransactions.slice(0, 4).map((transaction, index) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  const TransactionIcon = getTransactionIcon(transaction.type);
                  
                  return (
                    <div key={transaction.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-50/80 to-white hover:from-white hover:to-slate-50 transform hover:scale-[1.01]">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative">
                          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-white to-slate-50 group-hover:from-slate-50 group-hover:to-slate-100 transition-all duration-300 shadow-md">
                            <TransactionIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-md border border-slate-200">
                            <StatusIcon className="h-2.5 w-2.5 text-slate-500" />
                          </div>
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm sm:text-base text-slate-900 truncate">{transaction.type}</p>
                            <Badge className={`${getStatusColor(transaction.status)} text-xs px-2 py-1 font-semibold`}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 font-medium">{transaction.description}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-base text-slate-900">
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
              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100/60">
                <CardHeader className="border-b border-amber-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-md">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <CardTitle className="text-lg font-bold text-amber-800">Pending Approvals</CardTitle>
                    </div>
                    <Badge className="bg-amber-200 text-amber-800 border-amber-300 font-bold">
                      {dashboardData.pendingApprovals}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/80 border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-bold text-amber-800">Transactions</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 font-bold">5</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/80 border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-bold text-amber-800">Funding</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 font-bold">3</Badge>
                    </div>
                  </div>
                  <Button className="w-full h-9 sm:h-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 font-semibold transform hover:scale-105 transition-all duration-200">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review All
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Metrics - Compact */}
            {hasPermission('manage_team') && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60">
                <CardHeader className="border-b border-indigo-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-md">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-indigo-800">Team Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 rounded-xl bg-white/80 border border-indigo-100 shadow-sm">
                      <div className="text-lg sm:text-xl font-bold text-indigo-900">{dashboardData.teamMetrics.totalStaff}</div>
                      <div className="text-xs text-indigo-700 font-semibold">Total Staff</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/80 border border-indigo-100 shadow-sm">
                      <div className="text-lg sm:text-xl font-bold text-emerald-600">{dashboardData.teamMetrics.activeStaff}</div>
                      <div className="text-xs text-indigo-700 font-semibold">Active Today</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-indigo-800">Monthly Budget</span>
                      <span className="text-sm font-bold text-indigo-900">
                        {Math.round(dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100} 
                        className="h-3 bg-indigo-100"
                      />
                      <div className="flex justify-between text-xs text-indigo-700 font-semibold">
                        <span>UGX {(dashboardData.teamMetrics.budgetUsed / 1000000).toFixed(1)}M</span>
                        <span>UGX {(dashboardData.teamMetrics.monthlyBudget / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wallet Actions - Compact */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100/60">
              <CardHeader className="border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-800">Wallet Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg font-semibold transform hover:scale-105 transition-all duration-200">
                      <Building className="h-4 w-4 mr-2" />
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
                    <Button variant="outline" className="w-full h-10 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold transform hover:scale-105 transition-all duration-200">
                      <Phone className="h-4 w-4 mr-2" />
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

      {/* Quick Actions Modal */}
      <MobileBottomNav />
    </div>
  );
};

export default OrgDashboard;