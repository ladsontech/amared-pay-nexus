import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/hooks/useOrganization";

const RequestExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { pettyCashWallets } = useOrganization();
  
  const [expenseFormData, setExpenseFormData] = useState({
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
  const [categories, setCategories] = useState([
    "office_supplies", "travel", "meals", "entertainment", 
    "utilities", "maintenance", "emergency", "other"
  ]);
  const [pettyCashWallet, setPettyCashWallet] = useState<{ id: string; currency: { id: number; symbol?: string; name?: string } } | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);

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
          setCurrentBalance(wallet.balance || 0);
        }
      } catch (error) {
        console.error("Error fetching petty cash wallet:", error);
      }
    };

    fetchWallet();
  }, [user?.organizationId]);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setExpenseFormData({ ...expenseFormData, category: newCategory.trim() });
      setNewCategory("");
      setShowNewCategoryDialog(false);
      toast({
        title: "Category Added",
        description: `"${newCategory.trim()}" has been added to expense categories.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseFormData.amount || !expenseFormData.description || !expenseFormData.category || !expenseFormData.requestorName || !expenseFormData.mobileNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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

    const amount = parseFloat(expenseFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await organizationService.createPettyCashExpense({
        petty_cash_wallet: pettyCashWallet.id,
        currency: pettyCashWallet.currency.id,
        amount: Math.round(amount),
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

      // Navigate back to petty cash page
      navigate("/org/petty-cash");
    } catch (error: any) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit expense request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/org/petty-cash")}
          className="mb-4 md:mb-6 -ml-2 md:-ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Petty Cash
        </Button>

        {/* Form Card */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 md:pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  Request Expense
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-gray-600 mt-1">
                  Submit expense request for organization admin approval
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Requestor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requestorName" className="text-sm md:text-base font-medium">
                    Requestor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestorName"
                    placeholder="Enter full name"
                    value={expenseFormData.requestorName}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, requestorName: e.target.value })}
                    required
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm md:text-base font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+256 700 000 000"
                    value={expenseFormData.mobileNumber}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, mobileNumber: e.target.value })}
                    required
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Amount and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm md:text-base font-medium">
                    Amount (UGX) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    required
                    min="1"
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm md:text-base font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select 
                      value={expenseFormData.category} 
                      onValueChange={(value) => setExpenseFormData({ ...expenseFormData, category: value })}
                    >
                      <SelectTrigger className="flex-1 h-10 md:h-11 text-sm md:text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-sm md:text-base">
                            {categoryLabels[category] || category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 flex-shrink-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
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
                              className="text-sm md:text-base"
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
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm md:text-base font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the expense purpose and details..."
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  required
                  rows={4}
                  className="text-sm md:text-base resize-none"
                />
              </div>
              
              {/* Receipt */}
              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-sm md:text-base font-medium">
                  Receipt/Voucher Number
                </Label>
                <Input
                  id="receipt"
                  placeholder="Receipt or voucher reference (optional)"
                  value={expenseFormData.receipt}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, receipt: e.target.value })}
                  className="h-10 md:h-11 text-sm md:text-base"
                />
              </div>

              {/* Balance Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 md:p-5 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-medium text-gray-900">
                    Current Balance: <span className="text-blue-600">{pettyCashWallet?.currency.symbol || 'UGX'} {currentBalance.toLocaleString()}</span>
                  </p>
                  {expenseFormData.amount && (
                    <p className="text-sm md:text-base font-medium text-gray-900">
                      Balance After Expense: <span className={currentBalance - parseFloat(expenseFormData.amount || "0") < 0 ? "text-red-600" : "text-blue-600"}>
                        {pettyCashWallet?.currency.symbol || 'UGX'} {(currentBalance - parseFloat(expenseFormData.amount || "0")).toLocaleString()}
                      </span>
                    </p>
                  )}
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    This request requires approval from your organization administrator.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/org/petty-cash")}
                  className="flex-1 sm:flex-none sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestExpense;

