
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet } from "lucide-react";

interface AddTransactionProps {
  currentBalance: number;
  setCurrentBalance: (balance: number) => void;
}

const AddTransaction = ({ currentBalance, setCurrentBalance }: AddTransactionProps) => {
  const [transactionType, setTransactionType] = useState<"expense" | "addition">("expense");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    receipt: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = {
    expense: ["Office Supplies", "Travel", "Meals", "Utilities", "Maintenance", "Emergency", "Other"],
    addition: ["Cash Addition", "Reimbursement", "Transfer", "Other"]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (transactionType === "expense" && amount > currentBalance) {
      toast({
        title: "Insufficient Funds",
        description: "Transaction amount exceeds current balance.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBalance = transactionType === "expense" 
        ? currentBalance - amount 
        : currentBalance + amount;
      
      setCurrentBalance(newBalance);
      
      toast({
        title: "Transaction Recorded",
        description: `${transactionType === "expense" ? "Expense" : "Addition"} of UGX ${amount.toLocaleString()} has been recorded.`,
      });

      // Reset form
      setFormData({ amount: "", description: "", category: "", receipt: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant={transactionType === "expense" ? "default" : "outline"}
          onClick={() => setTransactionType("expense")}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          Record Expense
        </Button>
        <Button
          variant={transactionType === "addition" ? "default" : "outline"}
          onClick={() => setTransactionType("addition")}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Add Cash
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {transactionType === "expense" ? "Record Expense" : "Add Cash to Fund"}
          </CardTitle>
          <CardDescription>
            {transactionType === "expense" 
              ? "Enter details for the petty cash expense" 
              : "Add money to the petty cash fund"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (UGX) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[transactionType].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the transaction..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt/Voucher Number</Label>
              <Input
                id="receipt"
                placeholder="Receipt or voucher reference"
                value={formData.receipt}
                onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
              />
            </div>

            {transactionType === "expense" && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Current Balance:</span> UGX {currentBalance.toLocaleString()}
                </p>
                {formData.amount && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Balance After Transaction:</span> UGX {(currentBalance - parseFloat(formData.amount || "0")).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : `Record ${transactionType === "expense" ? "Expense" : "Addition"}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransaction;
