
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import OrganizationDashboardLayout from "@/components/OrganizationDashboardLayout";
import AddTransaction from "@/components/petty-cash/AddTransaction";
import TransactionHistory from "@/components/petty-cash/TransactionHistory";
import PettyCashOverview from "@/components/petty-cash/PettyCashOverview";
import PettyCashReconciliation from "@/components/petty-cash/PettyCashReconciliation";
import PendingApprovals from "@/components/petty-cash/PendingApprovals";
import OrgLayoutWrapper from "@/components/OrgLayoutWrapper";

const PettyCash = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentBalance, setCurrentBalance] = useState(150000); // Initial petty cash balance

  return (
    <OrganizationDashboardLayout>
      <OrgLayoutWrapper currentBalance={1250000} pettyCashBalance={currentBalance}>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Petty Cash Management</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage petty cash transactions and requests
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1 sm:gap-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="add" className="text-xs sm:text-sm">Add Transaction</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
              <TabsTrigger value="approvals" className="text-xs sm:text-sm">Approvals</TabsTrigger>
              <TabsTrigger value="reconciliation" className="text-xs sm:text-sm">Reconciliation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <PettyCashOverview currentBalance={currentBalance} />
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
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

            <TabsContent value="history" className="space-y-4">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="approvals" className="space-y-4">
              <PendingApprovals />
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-4">
              <PettyCashReconciliation currentBalance={currentBalance} />
            </TabsContent>
          </Tabs>
        </div>
      </OrgLayoutWrapper>
    </OrganizationDashboardLayout>
  );
};

export default PettyCash;
