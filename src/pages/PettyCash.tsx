
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Receipt, Check, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PettyCashOverview from "@/components/petty-cash/PettyCashOverview";
import AddTransaction from "@/components/petty-cash/AddTransaction";
import TransactionHistory from "@/components/petty-cash/TransactionHistory";
import PettyCashReconciliation from "@/components/petty-cash/PettyCashReconciliation";

const PettyCash = () => {
  const [currentBalance, setCurrentBalance] = useState(150000); // Initial balance in UGX

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Petty Cash Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track and manage petty cash transactions and balances
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
            <Wallet className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Current Balance</p>
              <p className="text-lg font-bold text-green-600">UGX {currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="add-transaction" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Reconciliation</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PettyCashOverview currentBalance={currentBalance} />
          </TabsContent>

          <TabsContent value="add-transaction">
            <AddTransaction currentBalance={currentBalance} setCurrentBalance={setCurrentBalance} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="reconciliation">
            <PettyCashReconciliation currentBalance={currentBalance} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PettyCash;
