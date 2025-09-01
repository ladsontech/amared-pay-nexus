import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Activity, Download, Calendar, Shield, AlertTriangle, CheckCircle, Clock, BarChart3, Zap, Globe } from "lucide-react";
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            System Analytics Dashboard
            </h1>
          </div>
          <p className="text-lg text-slate-600 font-medium">
            Real-time platform insights and performance monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 shadow-md">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/60 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-blue-800 mb-1">Total Transactions</CardTitle>
              <CardDescription className="text-blue-600 text-xs">All-time platform activity</CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{systemStats.totalTransactions.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">+12.5%</span>
              </div>
              <span className="text-blue-600 text-xs">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/60 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-emerald-800 mb-1">Total Volume</CardTitle>
              <CardDescription className="text-emerald-600 text-xs">Financial throughput</CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-md">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 mb-2">UGX {(systemStats.totalAmount / 1000000).toFixed(1)}M</div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">+18.2%</span>
              </div>
              <span className="text-emerald-600 text-xs">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/60 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-purple-800 mb-1">Active Organizations</CardTitle>
              <CardDescription className="text-purple-600 text-xs">Platform participants</CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">{systemStats.activeOrganizations}</div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">+4</span>
              </div>
              <span className="text-purple-600 text-xs">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 via-orange-50/80 to-orange-100/60 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-orange-800 mb-1">Total Users</CardTitle>
              <CardDescription className="text-orange-600 text-xs">Platform user base</CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">{systemStats.totalUsers}</div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span className="font-semibold">+23</span>
              </div>
              <span className="text-orange-600 text-xs">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                  Transaction Volume Trend
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">Monthly transaction patterns and growth analysis</CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-2 font-semibold">
                7-day average: 2.1K transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight={500} />
                <YAxis stroke="#475569" fontSize={12} fontWeight={500} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `UGX ${(Number(value) / 1000000).toFixed(1)}M` : value,
                    name === 'amount' ? 'Volume' : 'Transactions'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 500
                  }}
                />
                <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-green-50/80 to-green-100/60">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-3 text-green-800">
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                System Health
              </CardTitle>
              <CardDescription className="text-green-700 font-medium">Real-time performance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-green-800">System Uptime</span>
                  <Badge className="bg-green-200 text-green-800 border-green-300 font-bold">
                    {systemStats.systemUptime}%
                  </Badge>
                </div>
                <Progress value={systemStats.systemUptime} className="h-3 bg-green-100" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-green-800">Avg Response Time</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold">
                    {systemStats.averageResponseTime}ms
                  </Badge>
                </div>
                <Progress value={75} className="h-3 bg-green-100" />
              </div>

              <div className="pt-4 border-t border-green-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-green-800">Active Sessions</span>
                  <span className="text-sm font-bold text-green-900">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-green-800">Database Status</span>
                  <Badge className="bg-green-200 text-green-800 border-green-300 font-bold">Optimal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 via-red-50/80 to-red-100/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3 text-red-800">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-md">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  System Alerts
                </CardTitle>
                <Badge className="bg-red-200 text-red-800 border-red-300 font-bold">
                  {systemStats.criticalAlerts} critical
                </Badge>
              </div>
              <CardDescription className="text-red-700 font-medium">Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {recentAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 border border-red-100 shadow-sm hover:shadow-md">
                      <div className={`p-2 rounded-xl shadow-sm ${alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                        <SeverityIcon className={`h-4 w-4 ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getSeverityColor(alert.severity)} font-semibold`}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-slate-500 font-medium">{alert.time}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-6 border-red-200 text-red-700 hover:bg-red-50 font-semibold">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Categories & Organization Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Globe className="h-6 w-6 text-indigo-600" />
              Transaction Distribution
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">Breakdown by transaction type and volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">{item.value}%</div>
                      <div className="text-xs text-slate-600 font-medium">UGX {(item.amount / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Platform Growth
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">Organizations and user acquisition trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={organizationGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight={500} />
                <YAxis stroke="#475569" fontSize={12} fontWeight={500} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 500
                  }}
                />
                <Bar dataKey="organizations" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="users" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Building className="h-6 w-6 text-purple-600" />
                Top Performing Organizations
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">Organizations ranked by transaction volume and growth</CardDescription>
            </div>
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold">
              View All Organizations
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/80 hover:from-slate-100 hover:to-slate-200/80 transition-all duration-300 border border-slate-200/60 shadow-md hover:shadow-lg transform hover:scale-[1.01]">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{org.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="font-medium">{org.transactions} transactions</span>
                      <span>•</span>
                      <span className="font-medium">{org.users} users</span>
                      <Badge className="bg-green-200 text-green-800 border-green-300 font-semibold">
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-slate-900 mb-1">UGX {(org.amount / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center justify-end space-x-2">
                    {org.growth > 0 ? (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-bold">+{org.growth}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-xs font-bold">{org.growth}%</span>
                      </div>
                    )}
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