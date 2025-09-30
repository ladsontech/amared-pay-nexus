
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
      {/* Mobile Header */}
      <div className="md:hidden">
        <h2 className="text-lg font-bold text-black mb-4">Reconciliation</h2>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Petty Cash Reconciliation
          </CardTitle>
          <CardDescription className="text-gray-600">
            Compare physical cash count with system balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-black mb-2">System Balance</h3>
                <p className="text-2xl font-bold text-blue-600">UGX {currentBalance.toLocaleString()}</p>
                <p className="text-sm text-gray-600">As per system records</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="physicalCount" className="text-black font-medium">Physical Cash Count (UGX)</Label>
                <Input
                  id="physicalCount"
                  type="number"
                  placeholder="Enter actual cash amount"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(e.target.value)}
                  className="bg-gray-50 border-gray-200"
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
                <Label htmlFor="notes" className="text-black font-medium">Reconciliation Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the reconciliation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button 
              onClick={handleReconciliation} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!physicalCount || isReconciling}
            >
              {isReconciling ? "Processing Reconciliation..." : "Complete Reconciliation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-black">Reconciliation History</CardTitle>
          <CardDescription className="text-gray-600">Recent reconciliation records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-06-10", systemBalance: 152500, physicalCount: 152500, difference: 0, status: "balanced" },
              { date: "2024-06-03", systemBalance: 148000, physicalCount: 147500, difference: -500, status: "discrepancy" },
              { date: "2024-05-27", systemBalance: 155000, physicalCount: 155000, difference: 0, status: "balanced" }
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold text-black">{record.date}</p>
                  <p className="text-sm text-gray-600">
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
