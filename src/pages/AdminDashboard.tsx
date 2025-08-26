
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building, Users, DollarSign, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    totalWalletBalance: 0,
    monthlyTransactions: 0,
    systemAlerts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching admin stats
    const fetchAdminStats = async () => {
      try {
        setStats({
          totalOrganizations: 25,
          activeOrganizations: 23,
          totalUsers: 156,
          totalWalletBalance: 15750000,
          monthlyTransactions: 342,
          systemAlerts: 3
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load admin statistics",
          variant: "destructive"
        });
      }
    };

    fetchAdminStats();
  }, [toast]);

  const adminStatCards = [
    {
      title: "Total Organizations",
      value: stats.totalOrganizations.toString(),
      icon: Building,
      description: "Registered organizations",
      color: "text-blue-600"
    },
    {
      title: "Active Organizations",
      value: stats.activeOrganizations.toString(),
      icon: Activity,
      description: "Currently active",
      color: "text-blue-600"
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      description: "Across all organizations",
      color: "text-blue-600"
    },
    {
      title: "System Wallet Balance",
      value: `UGX ${stats.totalWalletBalance.toLocaleString()}`,
      icon: DollarSign,
      description: "Total across all orgs",
      color: "text-blue-600"
    },
    {
      title: "Monthly Transactions",
      value: stats.monthlyTransactions.toString(),
      icon: TrendingUp,
      description: "This month",
      color: "text-blue-600"
    },
    {
      title: "System Alerts",
      value: stats.systemAlerts.toString(),
      icon: AlertTriangle,
      description: "Requires attention",
      color: "text-blue-600"
    }
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Main Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              System-wide overview and organization management
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Super Admin Access</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {adminStatCards.map((card, index) => (
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Building className="h-5 w-5 text-primary" />
                <span>Recent Organization Activity</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Latest activities across organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { org: "Tech Solutions Ltd", activity: "New bulk payment", amount: "UGX 450,000", time: "2 hours ago" },
                  { org: "Digital Agency Inc", activity: "Petty cash request", amount: "UGX 25,000", time: "4 hours ago" },
                  { org: "Startup Hub", activity: "User registration", amount: "New sub-admin", time: "6 hours ago" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm sm:text-base font-medium">{item.org}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.activity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-medium">{item.amount}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Admin Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Manage All Organizations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                System User Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review System Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate System Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
