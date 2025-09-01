import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AddTransaction from "@/components/petty-cash/AddTransaction";
import TransactionHistory from "@/components/petty-cash/TransactionHistory";
import PettyCashOverview from "@/components/petty-cash/PettyCashOverview";
import PettyCashReconciliation from "@/components/petty-cash/PettyCashReconciliation";
import PendingApprovals from "@/components/petty-cash/PendingApprovals";
import BulkPaymentApprovals from "@/components/petty-cash/BulkPaymentApprovals";
import { useSearchParams, Link } from "react-router-dom";

const PettyCash = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as string || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentBalance, setCurrentBalance] = useState(150000); // Initial petty cash balance
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 -mx-6 px-6 py-4 mb-4">
        <h1 className="text-xl font-bold text-black">Petty Cash</h1>
        <p className="text-sm text-gray-600">Manage petty cash transactions</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Petty Cash Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage petty cash transactions and requests
          </p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {hasPermission("view_department_reports") && (
            <Button variant="outline" asChild>
              <Link to="/org/reports/petty-cash" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>View Petty Cash Report</span>
              </Link>
            </Button>
          )}
          
          <Button variant="default" onClick={() => setActiveTab("add")} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            p.set('tab', val);
            return p;
          });
        }} 
        className="w-full"
      >
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50 rounded-xl p-1">
            <TabsTrigger value="overview" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="add" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
              Add
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Mobile Secondary Tabs */}
          {(activeTab === "approvals" || activeTab === "reconciliation") && (
            <div className="flex gap-2 mt-3">
              <Button 
                variant={activeTab === "approvals" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setActiveTab("approvals")}
                className="flex-1"
              >
                Approvals
              </Button>
              <Button 
                variant={activeTab === "reconciliation" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setActiveTab("reconciliation")}
                className="flex-1"
              >
                Reconciliation
              </Button>
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="add" className="text-sm">Add Transaction</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
            <TabsTrigger value="approvals" className="text-sm">PC Approvals</TabsTrigger>
            <TabsTrigger value="reconciliation" className="text-sm">Reconciliation</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex gap-2 mt-4">
          {hasPermission("approve_transactions") && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab("approvals")}
              className="flex-1"
            >
              Approvals
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab("reconciliation")}
            className="flex-1"
          >
            Reconciliation
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="bg-white">
            <PettyCashOverview currentBalance={currentBalance} />
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-6">
          <Card className="bg-white border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Add New Transaction
              </CardTitle>
              <CardDescription className="text-gray-600">
                Submit a new petty cash request for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTransaction currentBalance={currentBalance} setCurrentBalance={setCurrentBalance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="bg-white">
            <TransactionHistory />
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4 mt-6">
          <div className="bg-white">
            <PendingApprovals />
          </div>
        </TabsContent>
        
        <TabsContent value="reconciliation" className="space-y-4 mt-6">
          <div className="bg-white">
            <PettyCashReconciliation currentBalance={currentBalance} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PettyCash;