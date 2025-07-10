
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet, Plus } from "lucide-react";

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
    receipt: "",
    requestorName: "",
    mobileNumber: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState({
    expense: ["Office Supplies", "Travel", "Meals", "Utilities", "Maintenance", "Emergency", "Other"],
    addition: ["Cash Addition", "Reimbursement", "Transfer", "Other"]
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category || !formData.requestorName || !formData.mobileNumber) {
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
      
      toast({
        title: "Request Submitted",
        description: `${transactionType === "expense" ? "Expense" : "Addition"} request of UGX ${amount.toLocaleString()} has been submitted for approval.`,
      });

      // Reset form
      setFormData({ 
        amount: "", 
        description: "", 
        category: "", 
        receipt: "", 
        requestorName: "", 
        mobileNumber: "" 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories(prev => ({
        ...prev,
        [transactionType]: [...prev[transactionType], newCategory.trim()]
      }));
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory("");
      setShowNewCategoryDialog(false);
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added to ${transactionType} categories.`,
      });
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
          Request Expense
        </Button>
        <Button
          variant={transactionType === "addition" ? "default" : "outline"}
          onClick={() => setTransactionType("addition")}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Request Cash Addition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {transactionType === "expense" ? "Request Expense Approval" : "Request Cash Addition"}
          </CardTitle>
          <CardDescription>
            {transactionType === "expense" 
              ? "Submit expense request for organization admin approval" 
              : "Request money to be added to the petty cash fund"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestorName">Requestor Name *</Label>
                <Input
                  id="requestorName"
                  placeholder="Full name"
                  value={formData.requestorName}
                  onChange={(e) => setFormData({ ...formData, requestorName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  placeholder="+256 700 000 000"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  required
                />
              </div>
            </div>

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
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="flex-1">
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
                  
                  <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Create a new category for {transactionType} transactions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCategory">Category Name</Label>
                          <Input
                            id="newCategory"
                            placeholder="Enter category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCategory}>
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the transaction purpose and details..."
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
                <p className="text-sm mt-2 text-muted-foreground">
                  * This request will be sent to your organization admin for approval.
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : `Submit ${transactionType === "expense" ? "Expense" : "Addition"} Request`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransaction;
