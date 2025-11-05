import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/hooks/useOrganization";

const RequestCashAddition = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { pettyCashWallets } = useOrganization();
  
  const [fundingFormData, setFundingFormData] = useState({
    amount: "",
    reason: "",
    requestorName: "",
    contact: "",
    urgency: "normal"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pettyCashWallet, setPettyCashWallet] = useState<{ id: string; currency: { id: number; symbol?: string; name?: string } } | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fundingFormData.amount || !fundingFormData.reason || !fundingFormData.requestorName || !fundingFormData.contact) {
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

    const amount = parseFloat(fundingFormData.amount);
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
      await organizationService.createPettyCashFundRequest({
        petty_cash_wallet: pettyCashWallet.id,
        currency: pettyCashWallet.currency.id,
        amount: Math.round(amount),
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

      // Navigate back to petty cash page
      navigate("/org/petty-cash");
    } catch (error: any) {
      console.error("Error creating fund request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit funding request. Please try again.",
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
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  Request Cash Addition
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-gray-600 mt-1">
                  Request funds to be added to the petty cash fund
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Requestor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fundRequestorName" className="text-sm md:text-base font-medium">
                    Requestor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fundRequestorName"
                    placeholder="Enter full name"
                    value={fundingFormData.requestorName}
                    onChange={(e) => setFundingFormData({ ...fundingFormData, requestorName: e.target.value })}
                    required
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm md:text-base font-medium">
                    Contact Information <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact"
                    placeholder="Email or phone number"
                    value={fundingFormData.contact}
                    onChange={(e) => setFundingFormData({ ...fundingFormData, contact: e.target.value })}
                    required
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Amount and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fundAmount" className="text-sm md:text-base font-medium">
                    Amount (UGX) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fundAmount"
                    type="number"
                    placeholder="50000"
                    value={fundingFormData.amount}
                    onChange={(e) => setFundingFormData({ ...fundingFormData, amount: e.target.value })}
                    required
                    min="1"
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-sm md:text-base font-medium">
                    Urgency Level
                  </Label>
                  <Select 
                    value={fundingFormData.urgency} 
                    onValueChange={(value) => setFundingFormData({ ...fundingFormData, urgency: value })}
                  >
                    <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="text-sm md:text-base">Low - Can wait</SelectItem>
                      <SelectItem value="normal" className="text-sm md:text-base">Normal - Standard processing</SelectItem>
                      <SelectItem value="high" className="text-sm md:text-base">High - Needed soon</SelectItem>
                      <SelectItem value="urgent" className="text-sm md:text-base">Urgent - Needed immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm md:text-base font-medium">
                  Reason for Funding <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why additional funding is needed for the petty cash..."
                  value={fundingFormData.reason}
                  onChange={(e) => setFundingFormData({ ...fundingFormData, reason: e.target.value })}
                  required
                  rows={4}
                  className="text-sm md:text-base resize-none"
                />
              </div>

              {/* Balance Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 md:p-5 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-medium text-gray-900">
                    Current Petty Cash Balance: <span className="text-blue-600">{pettyCashWallet?.currency.symbol || 'UGX'} {currentBalance.toLocaleString()}</span>
                  </p>
                  {fundingFormData.amount && (
                    <p className="text-sm md:text-base font-medium text-gray-900">
                      Balance After Funding: <span className="text-blue-600">
                        {pettyCashWallet?.currency.symbol || 'UGX'} {(currentBalance + parseFloat(fundingFormData.amount || "0")).toLocaleString()}
                      </span>
                    </p>
                  )}
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    This funding request requires approval from your organization administrator.
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

export default RequestCashAddition;

