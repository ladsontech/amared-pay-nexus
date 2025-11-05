import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  FileText,
  Loader2
} from "lucide-react";
import PettyCashReport from "@/components/reports/PettyCashReport";
import BulkPaymentsReport from "@/components/reports/BulkPaymentsReport";
import CollectionsReport from "@/components/reports/CollectionsReport";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useOrganization } from "@/hooks/useOrganization";

const OrgReports = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    walletTransactions,
    bulkPayments,
    collections,
    pettyCashTransactions,
    fetchWalletTransactions,
    fetchBulkPayments,
    fetchCollections,
    fetchPettyCashTransactions,
  } = useOrganization();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await Promise.all([
          fetchWalletTransactions(),
          fetchBulkPayments(),
          fetchCollections(),
          fetchPettyCashTransactions(),
        ]);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.organizationId]);

  // Calculate summary stats from actual data
  const summaryStats = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(selectedPeriod);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);

    // Filter transactions by date
    const recentTransactions = walletTransactions.filter(
      (tx) => new Date(tx.created_at) >= startDate
    );

    const recentBulkPayments = bulkPayments.filter(
      (bp) => new Date(bp.created_at) >= startDate
    );

    const recentCollections = collections.filter(
      (c) => new Date(c.created_at) >= startDate
    );

    const recentPettyCash = pettyCashTransactions.filter(
      (pct) => new Date(pct.created_at) >= startDate
    );

    // Calculate totals
    const totalExpenses = recentTransactions
      .filter((tx) => tx.type === "debit")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const totalBulkPayments = recentBulkPayments.reduce(
      (sum, bp) => sum + (bp.total_amount || 0), 
      0
    );

    const totalCollections = recentCollections
      .filter((c) => c.status === "successful")
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalPettyCashOutflows = recentPettyCash
      .filter((pct) => pct.type === "debit")
      .reduce((sum, pct) => sum + (pct.amount || 0), 0);

    const totalExpensesAll = totalExpenses + totalBulkPayments + totalPettyCashOutflows;
    const totalTransactions = recentTransactions.length + recentBulkPayments.length + recentPettyCash.length;
    const averageTransaction = totalTransactions > 0 ? totalExpensesAll / totalTransactions : 0;

    // Calculate month-over-month change (simplified)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysAgo);
    
    const previousTransactions = walletTransactions.filter(
      (tx) => {
        const txDate = new Date(tx.created_at);
        return txDate >= previousPeriodStart && txDate < startDate;
      }
    );

    const previousExpenses = previousTransactions
      .filter((tx) => tx.type === "debit")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const monthlyChange = previousExpenses > 0
      ? ((totalExpenses - previousExpenses) / previousExpenses) * 100
      : 0;

    return {
      totalExpenses: totalExpensesAll,
      totalTransactions,
      averageTransaction,
      monthlyChange,
    };
  }, [walletTransactions, bulkPayments, collections, pettyCashTransactions, selectedPeriod]);

  // Monthly expense data for charts
  const monthlyExpenses = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTransactions = walletTransactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return txDate >= monthDate && txDate <= monthEnd && tx.type === "debit";
      });

      const monthBulkPayments = bulkPayments.filter((bp) => {
        const bpDate = new Date(bp.created_at);
        return bpDate >= monthDate && bpDate <= monthEnd;
      });

      const monthPettyCash = pettyCashTransactions.filter((pct) => {
        const pctDate = new Date(pct.created_at);
        return pctDate >= monthDate && pctDate <= monthEnd && pct.type === "debit";
      });

      const amount = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) +
        monthBulkPayments.reduce((sum, bp) => sum + (bp.total_amount || 0), 0) +
        monthPettyCash.reduce((sum, pct) => sum + (pct.amount || 0), 0);

      months.push({
        name: monthName,
        amount,
        transactions: monthTransactions.length + monthBulkPayments.length + monthPettyCash.length,
      });
    }

    return months;
  }, [walletTransactions, bulkPayments, pettyCashTransactions]);

  const handleExport = (format: string) => {
    console.log(`Exporting reports in ${format} format`);
    // TODO: Implement actual export functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Comprehensive financial insights for your organization"
        rightSlot={(
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {(summaryStats.totalExpenses / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {summaryStats.monthlyChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{summaryStats.monthlyChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{summaryStats.monthlyChange.toFixed(1)}%</span>
                </>
              )}
              <span>from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalTransactions}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>All payment types</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {Math.round(summaryStats.averageTransaction).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Per transaction</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                bulkPayments.length > 0 ? 1 : 0,
                collections.length > 0 ? 1 : 0,
                pettyCashTransactions.length > 0 ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Payment types active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', val); return p; }); }} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-1 sm:gap-0">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="petty-cash" className="text-xs sm:text-sm">Petty Cash</TabsTrigger>
          <TabsTrigger value="bulk-payments" className="text-xs sm:text-sm">Bulk Payments</TabsTrigger>
          <TabsTrigger value="collections" className="text-xs sm:text-sm">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>
                Expense patterns over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyExpenses.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{month.name}</p>
                      <p className="text-sm text-muted-foreground">{month.transactions} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">UGX {(month.amount / 1000000).toFixed(1)}M</p>
                      <div className="w-32 bg-secondary rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((month.amount / Math.max(...monthlyExpenses.map(m => m.amount), 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {monthlyExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No expense data available for the selected period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="petty-cash">
          <PettyCashReport />
        </TabsContent>

        <TabsContent value="bulk-payments">
          <BulkPaymentsReport />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgReports;
