
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertTriangle, Calculator } from "lucide-react";

interface PettyCashReconciliationProps {
  currentBalance: number;
}

const PettyCashReconciliation = ({ currentBalance }: PettyCashReconciliationProps) => {
  const [physicalCount, setPhysicalCount] = useState("");
  const [notes, setNotes] = useState("");
  const [isReconciling, setIsReconciling] = useState(false);
  const { toast } = useToast();

  const difference = physicalCount ? parseFloat(physicalCount) - currentBalance : 0;
  const isBalanced = Math.abs(difference) < 1; // Allow for minor rounding differences

  const handleReconciliation = async () => {
    if (!physicalCount) {
      toast({
        title: "Error",
        description: "Please enter the physical cash count.",
        variant: "destructive",
      });
      return;
    }

    setIsReconciling(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Reconciliation Complete",
        description: isBalanced 
          ? "Petty cash fund is balanced and reconciled successfully."
          : `Reconciliation completed with a difference of UGX ${Math.abs(difference).toLocaleString()}. Please review.`,
      });

      // Reset form
      setPhysicalCount("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete reconciliation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Petty Cash Reconciliation
          </CardTitle>
          <CardDescription>
            Compare physical cash count with system balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">System Balance</h3>
                <p className="text-2xl font-bold text-blue-600">UGX {currentBalance.toLocaleString()}</p>
                <p className="text-sm text-blue-600">As per system records</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="physicalCount">Physical Cash Count (UGX)</Label>
                <Input
                  id="physicalCount"
                  type="number"
                  placeholder="Enter actual cash amount"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {physicalCount && (
                <div className={`p-4 border rounded-lg ${
                  isBalanced 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isBalanced ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <h3 className={`font-medium ${
                      isBalanced ? "text-green-800" : "text-red-800"
                    }`}>
                      {isBalanced ? "Balanced" : "Discrepancy Detected"}
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    isBalanced ? "text-green-600" : "text-red-600"
                  }`}>
                    Difference: {difference >= 0 ? "+" : ""}UGX {difference.toLocaleString()}
                  </p>
                  {!isBalanced && (
                    <p className="text-xs text-red-500 mt-1">
                      {difference > 0 ? "Excess cash found" : "Cash shortage detected"}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Reconciliation Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the reconciliation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button 
              onClick={handleReconciliation} 
              className="w-full"
              disabled={!physicalCount || isReconciling}
            >
              {isReconciling ? "Processing Reconciliation..." : "Complete Reconciliation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border border-blue-200">
        <CardHeader>
          <CardTitle>Reconciliation History</CardTitle>
          <CardDescription>Recent reconciliation records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-06-10", systemBalance: 152500, physicalCount: 152500, difference: 0, status: "balanced" },
              { date: "2024-06-03", systemBalance: 148000, physicalCount: 147500, difference: -500, status: "discrepancy" },
              { date: "2024-05-27", systemBalance: 155000, physicalCount: 155000, difference: 0, status: "balanced" }
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.date}</p>
                  <p className="text-sm text-muted-foreground">
                    System: UGX {record.systemBalance.toLocaleString()} | 
                    Physical: UGX {record.physicalCount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {record.status === "balanced" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      record.status === "balanced" ? "text-green-600" : "text-red-600"
                    }`}>
                      {record.difference === 0 ? "Balanced" : `UGX ${Math.abs(record.difference).toLocaleString()}`}
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

export default PettyCashReconciliation;
