
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Activity, Download, Calendar } from "lucide-react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("7d");

  // Sample data for charts
  const transactionData = [
    { name: 'Jan', transactions: 65, amount: 4500000 },
    { name: 'Feb', transactions: 89, amount: 6200000 },
    { name: 'Mar', transactions: 124, amount: 8100000 },
    { name: 'Apr', transactions: 98, amount: 7300000 },
    { name: 'May', transactions: 145, amount: 9800000 },
    { name: 'Jun', transactions: 167, amount: 11200000 },
    { name: 'Jul', transactions: 189, amount: 12500000 },
  ];

  const organizationGrowth = [
    { name: 'Week 1', organizations: 18 },
    { name: 'Week 2', organizations: 20 },
    { name: 'Week 3', organizations: 22 },
    { name: 'Week 4', organizations: 25 },
  ];

  const categoryData = [
    { name: 'Bulk Payments', value: 45, color: '#8884d8' },
    { name: 'Petty Cash', value: 30, color: '#82ca9d' },
    { name: 'Collections', value: 15, color: '#ffc658' },
    { name: 'Transfers', value: 10, color: '#ff7c7c' },
  ];

  const topOrganizations = [
    { name: 'Tech Solutions Ltd', transactions: 234, amount: 15600000, growth: 12.5 },
    { name: 'Digital Agency Inc', transactions: 189, amount: 12400000, growth: 8.3 },
    { name: 'Startup Hub', transactions: 156, amount: 9800000, growth: -2.1 },
    { name: 'Creative Studios', transactions: 98, amount: 6500000, growth: 15.7 },
    { name: 'Business Corp', transactions: 87, amount: 5200000, growth: 4.2 },
  ];

  const systemStats = {
    totalTransactions: 12456,
    totalAmount: 156700000,
    activeOrganizations: 23,
    totalUsers: 345,
    systemUptime: 99.8,
    averageResponseTime: 245
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive system performance and usage analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalTransactions.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {(systemStats.totalAmount / 1000000).toFixed(1)}M</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+18.2%</span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeOrganizations}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+4</span>
                <span>this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+23</span>
                <span>this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Trend</CardTitle>
              <CardDescription>Monthly transaction amounts and counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'amount' ? `UGX ${(Number(value) / 1000000).toFixed(1)}M` : value,
                    name === 'amount' ? 'Amount' : 'Transactions'
                  ]} />
                  <Line type="monotone" dataKey="transactions" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Categories</CardTitle>
              <CardDescription>Distribution by transaction type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Organizations</CardTitle>
            <CardDescription>Organizations ranked by transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrganizations.map((org, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{org.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {org.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">UGX {(org.amount / 1000000).toFixed(1)}M</p>
                    <div className="flex items-center space-x-1">
                      {org.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-sm ${org.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {org.growth > 0 ? '+' : ''}{org.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current system performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Uptime</span>
                <Badge variant="outline" className="text-green-600">
                  {systemStats.systemUptime}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Response Time</span>
                <Badge variant="outline">
                  {systemStats.averageResponseTime}ms
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <Badge variant="outline">
                  127
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Health</span>
                <Badge variant="outline" className="text-green-600">
                  Optimal
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Growth</CardTitle>
              <CardDescription>New organizations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={organizationGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="organizations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAnalytics;
