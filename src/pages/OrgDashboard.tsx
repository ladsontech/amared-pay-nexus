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
import { DollarSign, Wallet, TrendingUp, TrendingDown, Activity, Users, CheckCircle, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Building, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const OrgDashboard = () => {
  const {
    user,
    hasPermission
  } = useAuth();
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
    recentTransactions: [{
      id: '1',
      type: 'Petty Cash',
      amount: 125000,
      status: 'approved',
      date: '2024-01-20'
    }, {
      id: '2',
      type: 'Bulk Payment',
      amount: 2500000,
      status: 'pending',
      date: '2024-01-20'
    }, {
      id: '3',
      type: 'Collection',
      amount: 850000,
      status: 'completed',
      date: '2024-01-19'
    }, {
      id: '4',
      type: 'Petty Cash',
      amount: 75000,
      status: 'rejected',
      date: '2024-01-19'
    }, {
      id: '5',
      type: 'Bulk Payment',
      amount: 1200000,
      status: 'completed',
      date: '2024-01-18'
    }],
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
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
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

  return <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {user?.name}! Here's your organization overview.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {(dashboardData.totalCollections / 1000000).toFixed(1)}M</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {(dashboardData.walletBalance / 1000000).toFixed(1)}M</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-2.1%</span>
              <span>from last week</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Building className="h-3 w-3 mr-1" />
                    Send to Bank
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send to Bank</DialogTitle>
                    <DialogDescription>
                      Transfer funds from wallet to bank account
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
                      <Label htmlFor="bank-account">Bank Account</Label>
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
                      <Label htmlFor="bank-description">Description</Label>
                      <Input
                        id="bank-description"
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
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw by Phone</DialogTitle>
                    <DialogDescription>
                      Send money to mobile money account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Amount (UGX)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-phone">Phone Number</Label>
                      <Input
                        id="withdraw-phone"
                        placeholder="+256701234567"
                        value={withdrawData.phoneNumber}
                        onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-description">Description</Label>
                      <Input
                        id="withdraw-description"
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Petty Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {(dashboardData.pettyCashBalance / 1000).toFixed(0)}K</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+5.2%</span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.monthlyTransactions}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+18.1%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activities in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map(transaction => {
              const StatusIcon = getStatusIcon(transaction.status);
              return <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">UGX {transaction.amount.toLocaleString()}</p>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>;
            })}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Pending Approvals - Only for managers */}
          {hasPermission('approve_transactions') && <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Approvals
                  <Badge variant="secondary">{dashboardData.pendingApprovals}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Requests</span>
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Funding Requests</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Review All
                  </Button>
                </div>
              </CardContent>
            </Card>}

          {/* Team Metrics - Only for managers */}
          {hasPermission('manage_team') && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Staff</span>
                  <span className="text-sm font-medium">{dashboardData.teamMetrics.totalStaff}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Today</span>
                  <span className="text-sm font-medium">{dashboardData.teamMetrics.activeStaff}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Budget</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100)}%
                    </span>
                  </div>
                  <Progress value={dashboardData.teamMetrics.budgetUsed / dashboardData.teamMetrics.monthlyBudget * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>UGX {(dashboardData.teamMetrics.budgetUsed / 1000000).toFixed(1)}M used</span>
                    <span>UGX {(dashboardData.teamMetrics.monthlyBudget / 1000000).toFixed(1)}M total</span>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasPermission('access_petty_cash') && <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wallet className="h-4 w-4 mr-2" />
                  Add Petty Cash Transaction
                </Button>}
              {hasPermission('access_bulk_payments') && <Button variant="outline" size="sm" className="w-full justify-start">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  New Bulk Payment
                </Button>}
              {hasPermission('request_funding') && <Button variant="outline" size="sm" className="w-full justify-start">
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Request Funding
                </Button>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default OrgDashboard;