
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown, AlertTriangle, Bell, Plus, History, CheckCircle, FileText } from "lucide-react";
import { PettyCashWallet, PettyCashTransaction, PettyCashExpense } from "@/services/organizationService";
import { useSearchParams } from "react-router-dom";

interface PettyCashOverviewProps {
  currentBalance: number;
  pettyCashWallets: PettyCashWallet[];
  pettyCashTransactions: PettyCashTransaction[];
  pettyCashExpenses: PettyCashExpense[];
}

const PettyCashOverview = ({ currentBalance, pettyCashWallets, pettyCashTransactions, pettyCashExpenses }: PettyCashOverviewProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Calculate monthly spending from petty cash expenses
  const monthlySpending = pettyCashExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.created_at);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear() &&
             expense.is_approved;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate pending approvals from petty cash transactions and expenses
  const pendingApprovals = [
    ...pettyCashTransactions.filter(t => t.status === 'pending_approval'),
    ...pettyCashExpenses.filter(e => !e.is_approved)
  ].length;

  const lowBalanceThreshold = 50000;
  const isLowBalance = currentBalance < lowBalanceThreshold;

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  const stats = [
    {
      title: "Current Balance",
      value: `UGX ${currentBalance.toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      title: "Monthly Spending",
      value: `UGX ${monthlySpending.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-orange-700",
      iconColor: "text-orange-600",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.toString(),
      icon: Bell,
      color: "text-purple-700",
      iconColor: "text-purple-600",
    }
  ];

  const navigationCards = [
    {
      title: "Add Transaction",
      description: "Create new transaction",
      icon: Plus,
      tab: "add",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "History",
      description: "View transaction history",
      icon: History,
      tab: "history",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Approvals",
      description: "Review pending requests",
      icon: CheckCircle,
      tab: "approvals",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Reconciliation",
      description: "Reconcile transactions",
      icon: FileText,
      tab: "reconciliation",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      iconColor: "text-indigo-600",
    }
  ];

  return (
    <div className="space-y-6">
      {isLowBalance && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Low Balance Alert</p>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Petty cash balance is below the threshold of UGX {lowBalanceThreshold.toLocaleString()}. 
              Consider adding funds soon.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-blue-50 border border-blue-200 hover:shadow-md transition-shadow ${
              index === 2 ? 'col-span-2 md:col-span-1' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-800 leading-tight">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.iconColor} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className={`text-lg md:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Cards - 2 columns on mobile and desktop */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {navigationCards.map((nav, index) => (
          <Card 
            key={index} 
            className={`${nav.color} cursor-pointer transition-all hover:shadow-md active:scale-[0.98]`}
            onClick={() => handleTabChange(nav.tab)}
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center space-y-2">
              <nav.icon className={`h-6 w-6 md:h-8 md:w-8 ${nav.iconColor} mb-1`} />
              <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
                {nav.title}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600">
                {nav.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Recent Transactions</CardTitle>
            <CardDescription className="text-sm text-blue-700">Latest petty cash activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {pettyCashTransactions.slice(0, 3).map((transaction, index) => {
                const isCredit = transaction.type === 'credit';
                const amount = isCredit ? transaction.amount : -transaction.amount;
                const date = new Date(transaction.created_at);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let dateText = '';
                if (diffDays === 0) dateText = 'Today';
                else if (diffDays === 1) dateText = 'Yesterday';
                else dateText = `${diffDays} days ago`;

                return (
                  <div key={transaction.id} className="flex items-center justify-between p-2 md:p-3 border rounded-lg bg-white">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">{transaction.title || (isCredit ? 'Cash Added' : 'Expense')}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {isCredit ? 'Addition' : 'Expense'} • {dateText}
                      </p>
                    </div>
                    <div className={`font-medium text-blue-700 text-sm md:text-base ml-2 flex-shrink-0`}>
                      {amount > 0 ? '+' : ''}UGX {Math.abs(amount).toLocaleString()}
                    </div>
                  </div>
                );
              })}
              {pettyCashTransactions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                  No recent transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-blue-700">Common petty cash operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors"
              onClick={() => handleTabChange("add")}
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              <span className="text-sm md:text-base">Add Transaction</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors"
              onClick={() => handleTabChange("history")}
            >
              <History className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              <span className="text-sm md:text-base">View History</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors"
              onClick={() => handleTabChange("approvals")}
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-600" />
              <span className="text-sm md:text-base">
                Review Approvals
                {pendingApprovals > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {pendingApprovals}
                  </span>
                )}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PettyCashOverview;
