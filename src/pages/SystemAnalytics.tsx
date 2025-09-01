import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Activity, Download, Calendar, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SystemAnalytics = () => {
  const [timeframe, setTimeframe] = useState("7d");

  // Enhanced sample data for charts
  const transactionData = [
    { name: 'Jan', transactions: 1250, amount: 45000000, organizations: 18 },
    { name: 'Feb', transactions: 1890, amount: 62000000, organizations: 20 },
    { name: 'Mar', transactions: 2240, amount: 81000000, organizations: 22 },
    { name: 'Apr', transactions: 1980, amount: 73000000, organizations: 23 },
    { name: 'May', transactions: 2450, amount: 98000000, organizations: 25 },
    { name: 'Jun', transactions: 2670, amount: 112000000, organizations: 27 },
    { name: 'Jul', transactions: 2890, amount: 125000000, organizations: 28 },
  ];

  const organizationGrowth = [
    { name: 'Week 1', organizations: 18, users: 245 },
    { name: 'Week 2', organizations: 20, users: 267 },
    { name: 'Week 3', organizations: 22, users: 289 },
    { name: 'Week 4', organizations: 25, users: 312 },
  ];

  const categoryData = [
    { name: 'Bulk Payments', value: 45, amount: 56250000, color: '#3b82f6' },
    { name: 'Petty Cash', value: 30, amount: 37500000, color: '#10b981' },
    { name: 'Collections', value: 15, amount: 18750000, color: '#f59e0b' },
    { name: 'Bank Deposits', value: 10, amount: 12500000, color: '#ef4444' },
  ];

  const topOrganizations = [
    { name: 'TechCorp Solutions', transactions: 2340, amount: 156000000, growth: 12.5, status: 'active', users: 45 },
    { name: 'Global Retail Chain', transactions: 1890, amount: 124000000, growth: 8.3, status: 'active', users: 32 },
    { name: 'Digital Innovation Hub', transactions: 1560, amount: 98000000, growth: -2.1, status: 'active', users: 28 },
    { name: 'Creative Studios Ltd', transactions: 980, amount: 65000000, growth: 15.7, status: 'active', users: 19 },
    { name: 'Business Solutions Corp', transactions: 870, amount: 52000000, growth: 4.2, status: 'active', users: 23 },
  ];

  const systemStats = {
    totalTransactions: 124560,
    totalAmount: 1567000000,
    activeOrganizations: 28,
    totalUsers: 345,
    systemUptime: 99.8,
    averageResponseTime: 245,
    pendingApprovals: 23,
    criticalAlerts: 2
  };

  const recentAlerts = [
    { id: 'ALT001', type: 'security', severity: 'high', message: 'Multiple failed login attempts detected', time: '5 min ago' },
    { id: 'ALT002', type: 'system', severity: 'medium', message: 'Database backup completed successfully', time: '1 hour ago' },
    { id: 'ALT003', type: 'payment', severity: 'low', message: 'Payment gateway maintenance scheduled', time: '2 hours ago' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            System Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform overview and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Transactions</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{systemStats.totalTransactions.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-blue-700 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Volume</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">UGX {(systemStats.totalAmount / 1000000).toFixed(1)}M</div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+18.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Active Organizations</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{systemStats.activeOrganizations}</div>
            <div className="flex items-center space-x-1 text-xs text-purple-700 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+4 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Users</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{systemStats.totalUsers}</div>
            <div className="flex items-center space-x-1 text-xs text-orange-700 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+23 this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Transaction Volume Trend</CardTitle>
                <CardDescription>Monthly transaction patterns and growth</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                7-day average: 2.1K transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `UGX ${(Number(value) / 1000000).toFixed(1)}M` : value,
                    name === 'amount' ? 'Volume' : 'Transactions'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                System Health
              </CardTitle>
              <CardDescription>Real-time system performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {systemStats.systemUptime}%
                  </Badge>
                </div>
                <Progress value={systemStats.systemUptime} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <Badge variant="outline" className="text-blue-700">
                    {systemStats.averageResponseTime}ms
                  </Badge>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <span className="text-sm font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Database Status</span>
                  <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  System Alerts
                </CardTitle>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {systemStats.criticalAlerts} critical
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`p-1 rounded-full ${alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                        <SeverityIcon className={`h-3 w-3 ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)} variant="outline">
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Categories & Organization Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Transaction Distribution</CardTitle>
            <CardDescription>Breakdown by transaction type and volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
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
              <div className="space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.value}%</div>
                      <div className="text-xs text-muted-foreground">UGX {(item.amount / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Platform Growth</CardTitle>
            <CardDescription>Organizations and user acquisition trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={organizationGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="organizations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="users" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Top Performing Organizations</CardTitle>
              <CardDescription>Organizations ranked by transaction volume and growth</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Organizations</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 transition-all duration-200 border border-slate-200/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{org.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{org.transactions} transactions</span>
                      <span>•</span>
                      <span>{org.users} users</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900">UGX {(org.amount / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center justify-end space-x-1">
                    {org.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${org.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {org.growth > 0 ? '+' : ''}{org.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAnalytics;