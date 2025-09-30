
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Bell } from "lucide-react";

interface PettyCashOverviewProps {
  currentBalance: number;
}

const PettyCashOverview = ({ currentBalance }: PettyCashOverviewProps) => {
  const monthlySpending = 45000;
  const pendingApprovals = 3;
  const lowBalanceThreshold = 50000;
  const isLowBalance = currentBalance < lowBalanceThreshold;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-blue-50 border border-blue-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 text-blue-600`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-blue-700`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription className="text-blue-700">Latest petty cash activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { description: "Office Supplies", amount: -2500, category: "Office", date: "Today" },
                { description: "Cash Added", amount: +50000, category: "Addition", date: "Yesterday" },
                { description: "Transport", amount: -5000, category: "Travel", date: "2 days ago" }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                  </div>
                  <div className={`font-medium text-blue-700`}>
                    {transaction.amount > 0 ? '+' : ''}UGX {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="text-blue-700">Common petty cash operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Wallet className="h-4 w-4 mr-2" />
              Add Cash to Fund
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingDown className="h-4 w-4 mr-2" />
              Record Expense
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Review Pending Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PettyCashOverview;
