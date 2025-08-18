import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Send, DollarSign, Plus, FileText } from "lucide-react";
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
  const {
    toast
  } = useToast();
  const {
    hasPermission
  } = useAuth();
  const handleBulkPayment = () => {
    toast({
      title: "Bulk Payment Initiated",
      description: "Bulk payment of UGX 500,000 has been submitted for approval"
    });
  };
  const handleCollection = () => {
    toast({
      title: "Collection Recorded",
      description: "Collection of UGX 250,000 has been successfully recorded"
    });
  };
  return <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">Petty Cash Management</h1>
          <p className="text-xs sm:text-base text-muted-foreground">
            Manage petty cash transactions and requests
          </p>
        </div>
        
                  {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {hasPermission("view_department_reports") && (
              <Button variant="outline" asChild>
                <Link to="/org/reports?tab=petty-cash" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>View Petty Cash Report</span>
                </Link>
              </Button>
            )}
            
            <Button variant="default" onClick={() => setActiveTab("add")} className="flex items-center space-x-2 h-8">
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={val => {
      setActiveTab(val);
      setSearchParams(prev => {
        const p = new URLSearchParams(prev);
        p.set('tab', val);
        return p;
      });
    }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto gap-1 sm:gap-0">
          <TabsTrigger value="overview" className="text-[11px] sm:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="add" className="text-[11px] sm:text-sm py-2">Add Transaction</TabsTrigger>
          <TabsTrigger value="history" className="text-[11px] sm:text-sm py-2">History</TabsTrigger>
          <TabsTrigger value="approvals" className="text-[11px] sm:text-sm py-2">PC Approvals</TabsTrigger>
          <TabsTrigger value="reconciliation" className="text-[11px] sm:text-sm py-2">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 sm:space-y-4">
          <PettyCashOverview currentBalance={currentBalance} />
        </TabsContent>

        <TabsContent value="add" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Add New Transaction</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Submit a new petty cash request for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTransaction currentBalance={currentBalance} setCurrentBalance={setCurrentBalance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 sm:space-y-4">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-3 sm:space-y-4">
          <PendingApprovals />
        </TabsContent>
        
        <TabsContent value="reconciliation" className="space-y-3 sm:space-y-4">
          <PettyCashReconciliation currentBalance={currentBalance} />
        </TabsContent>
      </Tabs>
    </div>;
};
export default PettyCash;