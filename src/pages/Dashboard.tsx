import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Users, CreditCard, TrendingUp, DollarSign, Activity, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    organizations: 0,
    monthlyGrowth: 0
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Simulate fetching dashboard stats
    const fetchStats = async () => {
      try {
        // Simulate API calls to various endpoints
        setStats({
          totalPayments: 1250,
          totalAmount: 2850000,
          successfulTransactions: 1180,
          pendingTransactions: 70,
          organizations: 45,
          monthlyGrowth: 12.5
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive"
        });
      }
    };
    fetchStats();
  }, [toast]);
  const statCards = [{
    title: "Total Payments",
    value: stats.totalPayments.toLocaleString(),
    icon: CreditCard,
    description: "All-time bulk payments",
    color: "text-blue-600"
  }, {
    title: "Total Amount",
    value: `UGX ${stats.totalAmount.toLocaleString()}`,
    icon: DollarSign,
    description: "Total processed amount",
    color: "text-green-600"
  }, {
    title: "Successful",
    value: stats.successfulTransactions.toLocaleString(),
    icon: TrendingUp,
    description: "Completed transactions",
    color: "text-emerald-600"
  }, {
    title: "Pending",
    value: stats.pendingTransactions.toLocaleString(),
    icon: Activity,
    description: "Processing transactions",
    color: "text-orange-600"
  }, {
    title: "Organizations",
    value: stats.organizations.toLocaleString(),
    icon: Users,
    description: "Active organizations",
    color: "text-purple-600"
  }, {
    title: "Growth",
    value: `+${stats.monthlyGrowth}%`,
    icon: TrendingUp,
    description: "Monthly growth rate",
    color: "text-cyan-600"
  }];
  return <DashboardLayout>
      <div className="space-y-3 sm:space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-xs sm:text-base text-muted-foreground">
              Overview of your bulk payment system performance
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-primary/5 p-2 rounded-lg">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Secure & Trusted</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
          {statCards.map((card, index) => <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-[11px] sm:text-xs">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Recent Bulk Payments</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Latest bulk payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 sm:space-y-4">
                {[1, 2, 3].map(item => <div key={item} className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${item === 1 ? "bg-green-500" : item === 2 ? "bg-blue-500" : "bg-yellow-500"}`}></div>
                      <div>
                        <p className="text-xs sm:text-base font-medium">Payment #{item}0{item}</p>
                        <p className="text-[11px] sm:text-sm text-muted-foreground">
                          {item === 1 ? "Completed" : item === 2 ? "Processing" : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-base font-medium">UGX {(item * 15000).toLocaleString()}</p>
                      <p className="text-[11px] sm:text-sm text-muted-foreground">
                        {item} hour{item > 1 ? "s" : ""} ago
                      </p>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button variant="outline" className="w-full justify-start h-8 text-[11px] sm:text-sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Organizations
              </Button>
              <Button variant="outline" className="w-full justify-start h-8 text-[11px] sm:text-sm">
                <CreditCard className="h-4 w-4 mr-2" />
                New Bulk Payment
              </Button>
              <Button variant="outline" className="w-full justify-start h-8 text-[11px] sm:text-sm">
                <Coins className="h-4 w-4 mr-2" />
                View Collections
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          
          
        </Card>
      </div>
    </DashboardLayout>;
};
export default Dashboard;