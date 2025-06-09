
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    monthlyGrowth: 0,
  });
  const { toast } = useToast();

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
          monthlyGrowth: 12.5,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [toast]);

  const statCards = [
    {
      title: "Total Payments",
      value: stats.totalPayments.toLocaleString(),
      icon: CreditCard,
      description: "All-time bulk payments",
      color: "text-blue-600",
    },
    {
      title: "Total Amount",
      value: `$${stats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      description: "Total processed amount",
      color: "text-green-600",
    },
    {
      title: "Successful",
      value: stats.successfulTransactions.toLocaleString(),
      icon: TrendingUp,
      description: "Completed transactions",
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: stats.pendingTransactions.toLocaleString(),
      icon: Activity,
      description: "Processing transactions",
      color: "text-orange-600",
    },
    {
      title: "Organizations",
      value: stats.organizations.toLocaleString(),
      icon: Users,
      description: "Active organizations",
      color: "text-purple-600",
    },
    {
      title: "Growth",
      value: `+${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      description: "Monthly growth rate",
      color: "text-cyan-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your bulk payment system performance
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Secure & Trusted</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          {statCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-3 w-3 md:h-4 md:w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Recent Bulk Payments</span>
              </CardTitle>
              <CardDescription>
                Latest bulk payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item === 1 ? "bg-green-500" : item === 2 ? "bg-blue-500" : "bg-yellow-500"
                      }`}></div>
                      <div>
                        <p className="font-medium">Payment #{item}0{item}</p>
                        <p className="text-sm text-muted-foreground">
                          {item === 1 ? "Completed" : item === 2 ? "Processing" : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item * 15000).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {item} hour{item > 1 ? "s" : ""} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Security & Trust</span>
              </CardTitle>
              <CardDescription>
                Secure payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src="/public/images/pay_safe.jpg" 
                  alt="Secure Payment" 
                  className="w-full max-w-48 h-32 object-cover rounded-lg shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL Encryption</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">PCI Compliance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Certified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fraud Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Protected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Payment Gateway</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Backup System</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-600">Scheduled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
