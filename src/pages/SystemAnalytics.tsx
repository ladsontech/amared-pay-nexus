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
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            System Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium">
            Real-time platform insights and performance monitoring
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Last 30 days</span>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-black mb-1">Total Transactions</CardTitle>
              <CardDescription className="text-gray-600 text-xs hidden sm:block">All-time platform activity</CardDescription>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-50 rounded-lg shadow-sm">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-black mb-1 sm:mb-2">{systemStats.totalTransactions.toLocaleString()}</div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="font-semibold text-xs">+12.5%</span>
              </div>
              <span className="text-gray-600 text-xs hidden sm:inline">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-black mb-1">Total Volume</CardTitle>
              <CardDescription className="text-gray-600 text-xs hidden sm:block">Financial throughput</CardDescription>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-50 rounded-lg shadow-sm">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-black mb-1 sm:mb-2">UGX {(systemStats.totalAmount / 1000000).toFixed(1)}M</div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="font-semibold text-xs">+18.2%</span>
              </div>
              <span className="text-gray-600 text-xs hidden sm:inline">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-black mb-1">Active Organizations</CardTitle>
              <CardDescription className="text-gray-600 text-xs hidden sm:block">Platform participants</CardDescription>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-50 rounded-lg shadow-sm">
              <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-black mb-1 sm:mb-2">{systemStats.activeOrganizations}</div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="font-semibold text-xs">+4</span>
              </div>
              <span className="text-gray-600 text-xs hidden sm:inline">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-black mb-1">Total Users</CardTitle>
              <CardDescription className="text-gray-600 text-xs hidden sm:block">Platform user base</CardDescription>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-50 rounded-lg shadow-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-black mb-1 sm:mb-2">{systemStats.totalUsers}</div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="font-semibold text-xs">+23</span>
              </div>
              <span className="text-gray-600 text-xs hidden sm:inline">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-blue-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-black flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                  Transaction Volume Trend
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium text-sm sm:text-base">Monthly transaction patterns and growth analysis</CardDescription>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-2 sm:px-3 py-1 sm:py-2 font-semibold text-xs sm:text-sm">
                7-day average: 2.1K transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px] lg:h-[350px]">
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
                    border: '1px solid #3b82f6', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 500
                  }}
                />
                <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }} />
                <Line type="monotone" dataKey="amount" stroke="#1e40af" strokeWidth={3} dot={{ fill: '#1e40af', strokeWidth: 2, r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* System Health */}
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2 sm:gap-3 text-black">
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shadow-sm">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                System Health
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium text-sm">Real-time performance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-black">System Uptime</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs">
                    {systemStats.systemUptime}%
                  </Badge>
                </div>
                <Progress value={systemStats.systemUptime} className="h-2 sm:h-3 bg-gray-100" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-black">Avg Response Time</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs">
                    {systemStats.averageResponseTime}ms
                  </Badge>
                </div>
                <Progress value={75} className="h-2 sm:h-3 bg-gray-100" />
              </div>

              <div className="pt-3 sm:pt-4 border-t border-blue-200 space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-black">Active Sessions</span>
                  <span className="text-xs sm:text-sm font-bold text-black">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-black">Database Status</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs">Optimal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2 sm:gap-3 text-black">
                  <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shadow-sm">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  System Alerts
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs">
                  {systemStats.criticalAlerts} critical
                </Badge>
              </div>
              <CardDescription className="text-gray-600 font-medium text-sm">Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <div className="space-y-2 sm:space-y-3">
                {recentAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 border border-blue-200 shadow-sm">
                      <div className="p-1.5 sm:p-2 rounded-lg shadow-sm bg-blue-100">
                        <SeverityIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Badge className={`${getSeverityColor(alert.severity)} font-semibold text-xs`}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-500 font-medium">{alert.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-black line-clamp-2">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 sm:mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs sm:text-sm">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Categories & Organization Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-blue-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-black flex items-center gap-2">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              Transaction Distribution
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium text-sm sm:text-base">Breakdown by transaction type and volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <ResponsiveContainer width="100%" height={150} className="sm:h-[200px]">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
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
              <div className="space-y-2 sm:space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs sm:text-sm font-semibold text-black">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-black">{item.value}%</div>
                      <div className="text-xs text-gray-600 font-medium hidden sm:block">UGX {(item.amount / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-black flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              Platform Growth
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium text-sm sm:text-base">Organizations and user acquisition trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-6">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <BarChart data={organizationGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="name" stroke="#374151" fontSize={12} fontWeight={500} />
                <YAxis stroke="#374151" fontSize={12} fontWeight={500} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #3b82f6', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 500
                  }}
                />
                <Bar dataKey="organizations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="users" fill="#1e40af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card className="border border-blue-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-black flex items-center gap-2">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                Top Performing Organizations
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium text-sm sm:text-base">Organizations ranked by transaction volume and growth</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs sm:text-sm">
              View All Organizations
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-6">
          <div className="space-y-3 sm:space-y-4">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base lg:text-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg text-black mb-1">{org.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">{org.transactions} txns</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium hidden sm:inline">{org.users} users</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm sm:text-base lg:text-xl text-black mb-1">UGX {(org.amount / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                    {org.growth > 0 ? (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span className="text-xs font-bold">+{org.growth}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3" />
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