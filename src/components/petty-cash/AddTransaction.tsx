
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService } from "@/services/organizationService";

interface AddTransactionProps {
  currentBalance: number;
  setCurrentBalance?: (balance: number) => void;
  initialTransactionType?: "expense" | "addition";
}

const AddTransaction = ({ currentBalance, setCurrentBalance, initialTransactionType }: AddTransactionProps) => {
  const [transactionType, setTransactionType] = useState<"expense" | "addition">(initialTransactionType || "expense");
  
  // Update transaction type when initialTransactionType prop changes
  useEffect(() => {
    if (initialTransactionType) {
      setTransactionType(initialTransactionType);
    }
  }, [initialTransactionType]);
  const [expenseFormData, setExpenseFormData] = useState({
    amount: "",
    description: "",
    category: "",
    receipt: "",
    requestorName: "",
    mobileNumber: ""
  });
  const [fundingFormData, setFundingFormData] = useState({
    amount: "",
    reason: "",
    requestorName: "",
    contact: "",
    urgency: "normal"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState({
    expense: ["office_supplies", "travel", "meals", "entertainment", "utilities", "maintenance", "emergency", "other"],
    addition: ["Fund Addition", "Reimbursement", "Transfer", "Other"]
  });
  const [pettyCashWallet, setPettyCashWallet] = useState<{ id: string; currency: { id: number; symbol?: string; name?: string } } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Map category labels for display
  const categoryLabels: Record<string, string> = {
    office_supplies: "Office Supplies",
    travel: "Travel",
    meals: "Meals",
    entertainment: "Entertainment",
    utilities: "Utilities",
    maintenance: "Maintenance",
    emergency: "Emergency",
    other: "Other"
  };

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.organizationId) return;
      
      try {
        const walletsResponse = await organizationService.getPettyCashWallets({
          organization: user.organizationId,
          limit: 1
        });
        
        if (walletsResponse.results.length > 0) {
          const wallet = walletsResponse.results[0];
          setPettyCashWallet({
            id: wallet.id,
            currency: {
              id: wallet.currency.id,
              symbol: wallet.currency.symbol,
              name: wallet.currency.name
            }
          });
        }
      } catch (error) {
        console.error("Error fetching petty cash wallet:", error);
      }
    };

    fetchWallet();
  }, [user?.organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentFormData = transactionType === "expense" ? expenseFormData : fundingFormData;
    
    // Validate required fields based on transaction type
    if (transactionType === "expense") {
      if (!expenseFormData.amount || !expenseFormData.description || !expenseFormData.category || !expenseFormData.requestorName || !expenseFormData.mobileNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!fundingFormData.amount || !fundingFormData.reason || !fundingFormData.requestorName || !fundingFormData.contact) {
        toast({
          title: "Missing Information", 
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }

    const amount = parseFloat(currentFormData.amount);
    if (transactionType === "expense" && amount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Expense amount exceeds current petty cash balance.",
        variant: "destructive",
      });
      return;
    }

    if (!pettyCashWallet) {
      toast({
        title: "Error",
        description: "Petty cash wallet not found. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (transactionType === "expense") {
        // Create expense
        await organizationService.createPettyCashExpense({
          petty_cash_wallet: pettyCashWallet.id,
          currency: pettyCashWallet.currency.id,
          amount: Math.round(amount), // Amount in integer format
          category: expenseFormData.category as any,
          description: expenseFormData.description,
          receipt_number: expenseFormData.receipt || undefined,
          requestor_name: expenseFormData.requestorName,
          requestor_phone_number: expenseFormData.mobileNumber,
          is_approved: false
        });

        toast({
          title: "Expense Submitted",
          description: `Expense request of ${pettyCashWallet.currency.symbol || 'UGX'} ${amount.toLocaleString()} has been submitted and is pending approval.`,
        });

        // Reset form
        setExpenseFormData({ 
          amount: "", 
          description: "", 
          category: "", 
          receipt: "", 
          requestorName: "", 
          mobileNumber: "" 
        });
      } else {
        // Create fund request
        await organizationService.createPettyCashFundRequest({
          petty_cash_wallet: pettyCashWallet.id,
          currency: pettyCashWallet.currency.id,
          amount: Math.round(amount), // Amount in integer format
          urgency_level: fundingFormData.urgency as any,
          reason: fundingFormData.reason,
          requestor_name: fundingFormData.requestorName,
          requestor_phone_number: fundingFormData.contact,
          is_approved: false
        });

        toast({
          title: "Funding Request Submitted",
          description: `Funding request of ${pettyCashWallet.currency.symbol || 'UGX'} ${amount.toLocaleString()} has been submitted and is pending approval.`,
        });

        // Reset form
        setFundingFormData({
          amount: "",
          reason: "",
          requestorName: "",
          contact: "",
          urgency: "normal"
        });
      }
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit request. Please try again.",
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
      setExpenseFormData({ ...expenseFormData, category: newCategory.trim() });
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
          Fund Petty Cash
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {transactionType === "expense" ? "Request Expense Approval" : "Fund Petty Cash"}
          </CardTitle>
          <CardDescription>
            {transactionType === "expense" 
              ? "Submit expense request for organization admin approval" 
              : "Request funds to be added to the petty cash fund"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {transactionType === "expense" ? (
              // Expense Request Form
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestorName">Requestor Name *</Label>
                    <Input
                      id="requestorName"
                      placeholder="Full name"
                      value={expenseFormData.requestorName}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, requestorName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      placeholder="+256 700 000 000"
                      value={expenseFormData.mobileNumber}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, mobileNumber: e.target.value })}
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
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="flex gap-2">
                      <Select value={expenseFormData.category} onValueChange={(value) => setExpenseFormData({ ...expenseFormData, category: value })}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.expense.map((category) => (
                            <SelectItem key={category} value={category}>
                              {categoryLabels[category] || category}
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
                              Create a new category for expense transactions.
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
                    placeholder="Describe the expense purpose and details..."
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt/Voucher Number</Label>
                  <Input
                    id="receipt"
                    placeholder="Receipt or voucher reference"
                    value={expenseFormData.receipt}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, receipt: e.target.value })}
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Current Balance:</span> UGX {currentBalance.toLocaleString()}
                  </p>
                  {expenseFormData.amount && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Balance After Expense:</span> UGX {(currentBalance - parseFloat(expenseFormData.amount || "0")).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm mt-2 text-muted-foreground">
                    This request requires approval from your organization administrator.
                  </p>
                </div>
              </>
            ) : (
              // Fund Petty Cash Form - Simplified
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundRequestorName">Requestor Name *</Label>
                    <Input
                      id="fundRequestorName"
                      placeholder="Your full name"
                      value={fundingFormData.requestorName}
                      onChange={(e) => setFundingFormData({ ...fundingFormData, requestorName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Information *</Label>
                    <Input
                      id="contact"
                      placeholder="Email or phone number"
                      value={fundingFormData.contact}
                      onChange={(e) => setFundingFormData({ ...fundingFormData, contact: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundAmount">Amount (UGX) *</Label>
                    <Input
                      id="fundAmount"
                      type="number"
                      placeholder="50000"
                      value={fundingFormData.amount}
                      onChange={(e) => setFundingFormData({ ...fundingFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={fundingFormData.urgency} onValueChange={(value) => setFundingFormData({ ...fundingFormData, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait</SelectItem>
                        <SelectItem value="normal">Normal - Standard processing</SelectItem>
                        <SelectItem value="high">High - Needed soon</SelectItem>
                        <SelectItem value="urgent">Urgent - Needed immediately</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Funding *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why additional funding is needed for the petty cash..."
                    value={fundingFormData.reason}
                    onChange={(e) => setFundingFormData({ ...fundingFormData, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Current Petty Cash Balance:</span> UGX {currentBalance.toLocaleString()}
                  </p>
                  {fundingFormData.amount && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Balance After Funding:</span> UGX {(currentBalance + parseFloat(fundingFormData.amount || "0")).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm mt-2 text-muted-foreground">
                    This funding request requires approval from your organization administrator.
                  </p>
                </div>
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransaction;
