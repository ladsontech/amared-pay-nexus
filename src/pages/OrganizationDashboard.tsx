
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Wallet, CreditCard, Users, Coins, TrendingUp, DollarSign, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const OrganizationDashboard = () => {
  const [orgStats, setOrgStats] = useState({
    currentBalance: 0,
    pettyCashBalance: 0,
    totalPayments: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    subAdmins: 0,
    monthlySpending: 0
  });
  const { toast } = useToast();

  // Mock organization data
  const orgInfo = {
    name: "Tech Solutions Ltd",
    id: "ORG001",
    type: "Technology Company"
  };

  useEffect(() => {
    // Simulate fetching organization stats
    const fetchOrgStats = async () => {
      try {
        setOrgStats({
          currentBalance: 1250000,
          pettyCashBalance: 150000,
          totalPayments: 45,
          successfulTransactions: 42,
          pendingTransactions: 3,
          subAdmins: 8,
          monthlySpending: 450000
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load organization statistics",
          variant: "destructive"
        });
      }
    };

    fetchOrgStats();
  }, [toast]);

  const orgStatCards = [
    {
      title: "Current Balance",
      value: `UGX ${orgStats.currentBalance.toLocaleString()}`,
      icon: Wallet,
      description: "Organization wallet",
      color: "text-green-600"
    },
    {
      title: "Petty Cash Balance",
      value: `UGX ${orgStats.pettyCashBalance.toLocaleString()}`,
      icon: Coins,
      description: "Available petty cash",
      color: "text-blue-600"
    },
    {
      title: "Total Payments",
      value: orgStats.totalPayments.toString(),
      icon: CreditCard,
      description: "This month",
      color: "text-purple-600"
    },
    {
      title: "Successful",
      value: orgStats.successfulTransactions.toString(),
      icon: TrendingUp,
      description: "Completed transactions",
      color: "text-emerald-600"
    },
    {
      title: "Pending",
      value: orgStats.pendingTransactions.toString(),
      icon: Activity,
      description: "Awaiting processing",
      color: "text-orange-600"
    },
    {
      title: "Sub-Admins",
      value: orgStats.subAdmins.toString(),
      icon: Users,
      description: "Active team members",
      color: "text-cyan-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{orgInfo.name} Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {orgInfo.type} • Organization ID: {orgInfo.id}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <Wallet className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Wallet Balance</p>
                <p className="text-lg font-bold text-green-600">UGX {orgStats.currentBalance.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Coins className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Petty Cash</p>
                <p className="text-lg font-bold text-blue-600">UGX {orgStats.pettyCashBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {orgStatCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Recent Transactions</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Latest payment activities in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { type: "Bulk Payment", description: "Staff salaries", amount: "UGX 450,000", status: "completed", time: "2 hours ago" },
                  { type: "Petty Cash", description: "Office supplies", amount: "UGX 25,000", status: "pending", time: "4 hours ago" },
                  { type: "Collection", description: "Client payment received", amount: "UGX 180,000", status: "completed", time: "6 hours ago" }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${transaction.status === 'completed' ? "bg-green-500" : transaction.status === 'pending' ? "bg-yellow-500" : "bg-blue-500"}`}></div>
                      <div>
                        <p className="text-sm sm:text-base font-medium">{transaction.type}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-medium">{transaction.amount}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Common organization tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                New Bulk Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Coins className="h-4 w-4 mr-2" />
                Petty Cash Request
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Sub-Admins
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                View Collections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationDashboard;
