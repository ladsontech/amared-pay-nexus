
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown, AlertTriangle, Bell, History, CheckCircle, FileText, Receipt } from "lucide-react";
import { PettyCashWallet, PettyCashTransaction, PettyCashExpense } from "@/services/organizationService";
import { useSearchParams, Link } from "react-router-dom";

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
    },
    {
      title: "Monthly Spending",
      value: `UGX ${monthlySpending.toLocaleString()}`,
      icon: TrendingDown,
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.toString(),
      icon: Bell,
    }
  ];

  const navigationCards = [
    {
      title: "History",
      description: "View transaction history",
      icon: History,
      tab: "history",
    },
    {
      title: "Approvals",
      description: "Review pending requests",
      icon: CheckCircle,
      tab: "approvals",
    },
    {
      title: "Reconciliation",
      description: "Reconcile transactions",
      icon: FileText,
      tab: "reconciliation",
    }
  ];

  return (
    <div className="space-y-6">
      {isLowBalance && (
        <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Low Balance Alert</p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
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
            className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
              index === 2 ? 'col-span-2 md:col-span-1' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-900 leading-tight">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons - Request Expense and Request Cash Addition */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Link to="/org/petty-cash/request-expense" className="block">
          <Card 
            className="bg-blue-600 border border-blue-700 hover:bg-blue-700 cursor-pointer transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center space-y-2">
              <Receipt className="h-6 w-6 md:h-8 md:w-8 text-white mb-1" />
              <CardTitle className="text-sm md:text-base font-semibold text-white">
                Request Expense
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-blue-100">
                Submit expense request
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link to="/org/petty-cash/request-cash-addition" className="block">
          <Card 
            className="bg-blue-600 border border-blue-700 hover:bg-blue-700 cursor-pointer transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center space-y-2">
              <Wallet className="h-6 w-6 md:h-8 md:w-8 text-white mb-1" />
              <CardTitle className="text-sm md:text-base font-semibold text-white">
                Request Cash Addition
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-blue-100">
                Add funds to wallet
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Navigation Cards - 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {navigationCards.map((nav, index) => (
          <Card 
            key={index} 
            className="bg-white border border-gray-200 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] shadow-sm"
            onClick={() => handleTabChange(nav.tab)}
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center space-y-2">
              <nav.icon className="h-6 w-6 md:h-8 md:w-8 text-gray-600 mb-1" />
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

      {/* Recent Transactions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Recent Transactions</CardTitle>
              <CardDescription className="text-sm text-gray-600">Latest petty cash activities</CardDescription>
            </div>
            {pendingApprovals > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 hover:bg-gray-50 text-gray-900"
                onClick={() => handleTabChange("approvals")}
              >
                <Bell className="h-4 w-4 mr-2" />
                {pendingApprovals} Pending
              </Button>
            )}
          </div>
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
                    <div className="font-medium text-gray-900 text-sm md:text-base ml-2 flex-shrink-0">
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
    </div>
  );
};

export default PettyCashOverview;
