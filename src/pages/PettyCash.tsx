
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Receipt, Check, Calendar, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import OrgLayoutWrapper from "@/components/OrgLayoutWrapper";
import PettyCashOverview from "@/components/petty-cash/PettyCashOverview";
import AddTransaction from "@/components/petty-cash/AddTransaction";
import TransactionHistory from "@/components/petty-cash/TransactionHistory";
import PettyCashReconciliation from "@/components/petty-cash/PettyCashReconciliation";
import PendingApprovals from "@/components/petty-cash/PendingApprovals";

const PettyCash = () => {
  const [currentBalance, setCurrentBalance] = useState(150000); // Initial balance in UGX
  const [orgBalance] = useState(1250000); // Organization main balance

  return (
    <DashboardLayout>
      <OrgLayoutWrapper currentBalance={orgBalance} pettyCashBalance={currentBalance}>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Petty Cash Management</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track and manage petty cash transactions and approvals
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="add-transaction" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Request</span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="reconciliation" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Reconcile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <PettyCashOverview currentBalance={currentBalance} />
            </TabsContent>

            <TabsContent value="add-transaction">
              <AddTransaction currentBalance={currentBalance} setCurrentBalance={setCurrentBalance} />
            </TabsContent>

            <TabsContent value="approvals">
              <PendingApprovals />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="reconciliation">
              <PettyCashReconciliation currentBalance={currentBalance} />
            </TabsContent>
          </Tabs>
        </div>
      </OrgLayoutWrapper>
    </DashboardLayout>
  );
};

export default PettyCash;
