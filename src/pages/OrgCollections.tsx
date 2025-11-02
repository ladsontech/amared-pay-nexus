
import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, Filter, Download, Smartphone, Copy, QrCode, Share, Link as LinkIcon, Building, Phone, Eye, History, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentLinkForm = lazy(() => import("@/components/PaymentLinkForm"));
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { paymentService } from "@/services/paymentService";
import { Collection } from "@/services/paymentService";

// Using Collection interface from paymentService

interface PaymentLink {
  id: string;
  amount: number;
  reference: string;
  paymentReason: string;
  link: string;
  status: "active" | "completed" | "expired";
  createdAt: string;
  totalPayees: number;
  successfulPayments: number;
  pendingPayments: number;
  currency: string;
  paymentHistory: Array<{
    id: string;
    payerName: string;
    phoneNumber: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    paidAt: string;
  }>;
}

const Collections = () => {
  const { user } = useAuth();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"collections" | "links">("collections");
  const [formData, setFormData] = useState({
    phoneNumber: "+256",
    amount: "",
    description: "",
  });
  const [sendToBankOpen, setSendToBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedLinkHistory, setSelectedLinkHistory] = useState<PaymentLink | null>(null);
  const [bankTransferData, setBankTransferData] = useState({
    amount: "",
    bankAccount: "",
    description: ""
  });
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    phoneNumber: "+256",
    description: ""
  });
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { collections, loading, error, fetchCollections } = useOrganization();
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchPaymentLinks();
  }, [user?.organizationId]);

  // Collections data is now provided by useOrganization hook

  const fetchPaymentLinks = async () => {
    if (!user?.organizationId) return;

    try {
      setLinksLoading(true);
      // Fetch bulk payments to get links
      const bulkPaymentsResponse = await paymentService.getBulkPayments({
        organization: user.organizationId,
        limit: 50
      });

      // Fetch links for the organization
      const linksResponse = await paymentService.getLinks({
        bulk_payment: bulkPaymentsResponse.results.map(bp => bp.id).join(','),
        limit: 100
      });

      // Transform links to PaymentLink format
      const transformedLinks: PaymentLink[] = linksResponse.results.map(link => {
        // Count transactions for this link
        const transactions = bulkPaymentsResponse.results
          .filter(bp => bp.id === link.bulk_payment.id)
          .flatMap(() => []); // This would need transaction data

        return {
          id: link.id,
          amount: link.amount,
          reference: link.bulk_payment.reference,
          paymentReason: link.beneficiary_name || "Payment Link",
          link: link.url || "",
          status: link.status === "sent" ? "active" : link.status === "processed" ? "completed" : "expired",
          createdAt: link.created_at,
          totalPayees: 1,
          successfulPayments: link.status === "processed" ? 1 : 0,
          pendingPayments: link.status === "sent" ? 1 : 0,
          currency: link.currency.symbol,
          paymentHistory: [] // Would need to fetch transaction history
        };
      });

      setPaymentLinks(transformedLinks);
    } catch (error) {
      console.error("Error fetching payment links:", error);
      toast({
        title: "Error",
        description: "Failed to load payment links. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLinksLoading(false);
    }
  };

  const handleInitiateCollection = async () => {
    if (!formData.phoneNumber || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in phone number and amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!formData.phoneNumber.startsWith("+256") || formData.phoneNumber.length < 13) {
      toast({
        title: "Error",
        description: "Please enter a valid Ugandan phone number (+256XXXXXXXXX).",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const organizationId = user.organizationId || user.organization?.id;
      
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      const response = await paymentService.initiateCollection({
        organization: organizationId,
        amount: parseInt(formData.amount),
        phone_number: formData.phoneNumber,
        reason: formData.description || undefined
      });

      if (response.success) {
        toast({
          title: "Collection Initiated",
          description: response.message || "Mobile money collection has been initiated successfully.",
        });
        setFormData({ phoneNumber: "+256", amount: "", description: "" });
        fetchCollections();
      } else {
        throw new Error(response.message || "Failed to initiate collection");
      }
    } catch (error: unknown) {
      console.error("Error initiating collection:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate collection. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Payment link has been copied to clipboard.",
    });
  };

  const handleSendToBank = () => {
    if (!bankTransferData.amount || !bankTransferData.bankAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bank Transfer Initiated",
      description: `Transfer of UGX ${parseFloat(bankTransferData.amount).toLocaleString()} has been submitted for processing`,
    });
    setBankTransferData({ amount: "", bankAccount: "", description: "" });
    setSendToBankOpen(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawData.amount || !withdrawData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields", 
        variant: "destructive",
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const organizationId = user.organizationId || user.organization?.id;
      
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      const response = await paymentService.mobileMoneyWithdraw({
        organization: organizationId,
        amount: parseInt(withdrawData.amount),
        phone_number: withdrawData.phoneNumber
      });

      if (response.success) {
        toast({
          title: "Withdrawal Initiated",
          description: response.message || `Withdrawal of UGX ${parseFloat(withdrawData.amount).toLocaleString()} to ${withdrawData.phoneNumber} has been submitted`,
        });
        setWithdrawData({ amount: "", phoneNumber: "+256", description: "" });
        setWithdrawOpen(false);
      } else {
        throw new Error(response.message || "Failed to initiate withdrawal");
      }
    } catch (error: unknown) {
      console.error("Error initiating withdrawal:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate withdrawal. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCollections = collections.filter(
    (collection) =>
      collection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.phone_number && collection.phone_number.includes(searchTerm)) ||
      collection.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaymentLinks = paymentLinks.filter(
    (link) =>
      link.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.paymentReason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading collections...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Collections</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <Button 
            onClick={() => fetchCollections()} 
            className="mt-2 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-3 md:space-y-6 bg-gray-50 md:bg-white pb-20 md:pb-0">
        {/* Mobile Header - Compact */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm -mx-2 px-3 py-2.5 mb-3">
          <h1 className="text-lg font-bold text-black">Collections</h1>
          <p className="text-xs text-gray-500 mt-0.5">Mobile money & payment links</p>
        </div>

        <div className="flex flex-col space-y-3 px-2 md:px-0">
          <div className="hidden md:block">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Collections & Payment Links</h1>
            <p className="text-sm text-muted-foreground">Manage mobile money collections and payment links (UGX only)</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/** Only show if user can view reports **/}
            {hasPermission("view_department_reports") && (
              <Button variant="outline" asChild>
                <Link to="/org/reports/collections" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>View Collections Report</span>
                </Link>
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center justify-center space-x-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Initiate Collection</span>
                  <span className="sm:hidden">Collection</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Initiate Mobile Money Collection</SheetTitle>
                  <SheetDescription>
                    Request payment from a specific phone number (UGX only)
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+256701234567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (UGX)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Payment description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleInitiateCollection} className="w-full">
                    Initiate Collection
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button className="flex items-center justify-center space-x-2 w-full sm:w-auto">
                  <LinkIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Payment Link</span>
                  <span className="sm:hidden">Payment Link</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Create Payment Link</SheetTitle>
                  <SheetDescription>
                    Generate a collection link to share via WhatsApp (UGX only)
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Suspense fallback={<div className="text-sm text-muted-foreground">Loading form...</div>}>
                    <PaymentLinkForm onSuccess={fetchPaymentLinks} />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tabs - Compact Mobile */}
        <div className="flex space-x-1 bg-gray-50 md:bg-muted p-0.5 md:p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none h-8 md:h-auto ${
              activeTab === "collections"
                ? "bg-white md:bg-background text-blue-600 md:text-foreground shadow-sm"
                : "text-gray-600 md:text-muted-foreground hover:text-blue-600 md:hover:text-foreground"
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none h-8 md:h-auto ${
              activeTab === "links"
                ? "bg-white md:bg-background text-blue-600 md:text-foreground shadow-sm"
                : "text-gray-600 md:text-muted-foreground hover:text-blue-600 md:hover:text-foreground"
            }`}
          >
            Payment Links
          </button>
        </div>

        {/* Summary Cards - Compact Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {activeTab === "collections" ? (
            <>
              <Card className="border border-slate-100 bg-white shadow-sm">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-xs md:text-base sm:text-lg">Total Collections</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2.5 md:pb-4">
                  <div className="text-base md:text-xl sm:text-2xl font-bold">{collections.length}</div>
                  <p className="text-[9px] md:text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-100 bg-white shadow-sm">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-xs md:text-base sm:text-lg">Successful</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2.5 md:pb-4">
                  <div className="text-base md:text-xl sm:text-2xl font-bold text-green-600">
                    {collections.filter(c => c.status === "successful").length}
                  </div>
                  <p className="text-[9px] md:text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-100 bg-white shadow-sm col-span-2 lg:col-span-1">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-xs md:text-base sm:text-lg">Total Amount</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2.5 md:pb-4">
                  <div className="text-base md:text-xl sm:text-2xl font-bold">
                    UGX {(collections.reduce((sum, c) => sum + c.amount, 0) / 1000).toFixed(0)}K
                  </div>
                  <p className="text-[9px] md:text-sm text-muted-foreground mb-2 md:mb-3">Total collected</p>
                  <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-3">
                    <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1 h-8 md:h-9 text-[10px] md:text-sm">
                          <Building className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                          <span className="hidden sm:inline">Send to Bank</span>
                          <span className="sm:hidden">Bank</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send to Bank</DialogTitle>
                          <DialogDescription>
                            Transfer collected funds to bank account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank-amount">Amount (UGX)</Label>
                            <Input
                              id="bank-amount"
                              type="number"
                              placeholder="Enter amount"
                              value={bankTransferData.amount}
                              onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank-account">Bank Account</Label>
                            <Select 
                              value={bankTransferData.bankAccount} 
                              onValueChange={(value) => setBankTransferData({...bankTransferData, bankAccount: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank account" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                                <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                                <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                                <SelectItem value="equity-6789">Equity Bank - ***6789</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank-description">Description</Label>
                            <Input
                              id="bank-description"
                              placeholder="Transfer description"
                              value={bankTransferData.description}
                              onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                            />
                          </div>
                          <Button onClick={handleSendToBank} className="w-full">
                            Send to Bank
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1 h-8 md:h-9 text-[10px] md:text-sm">
                          <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                          Withdraw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Withdraw by Phone</DialogTitle>
                          <DialogDescription>
                            Send collected funds to mobile money account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="withdraw-amount">Amount (UGX)</Label>
                            <Input
                              id="withdraw-amount"
                              type="number"
                              placeholder="Enter amount"
                              value={withdrawData.amount}
                              onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="withdraw-phone">Phone Number</Label>
                            <Input
                              id="withdraw-phone"
                              placeholder="+256701234567"
                              value={withdrawData.phoneNumber}
                              onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="withdraw-description">Description</Label>
                            <Input
                              id="withdraw-description"
                              placeholder="Withdrawal description"
                              value={withdrawData.description}
                              onChange={(e) => setWithdrawData({...withdrawData, description: e.target.value})}
                            />
                          </div>
                          <Button onClick={handleWithdraw} className="w-full">
                            Withdraw
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payments via Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentLinks.reduce((sum, link) => sum + link.successfulPayments, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Successful payments</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paymentLinks.length}</div>
                  <p className="text-sm text-muted-foreground">Active collection links</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Payees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentLinks.reduce((sum, link) => sum + link.totalPayees, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">All-time payees</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    UGX {paymentLinks.reduce((sum, link) => sum + (link.amount * link.successfulPayments), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">From payment links</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search and Filter - Compact Mobile */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-4 px-2 md:px-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 md:h-4 md:w-4" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 md:pl-10 h-9 md:h-10 text-xs md:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 md:h-10 text-xs md:text-sm px-3">
              <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 md:h-10 text-xs md:text-sm px-3">
              <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === "collections" ? (
          <div className="space-y-2 md:space-y-4 px-2 md:px-0">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-2.5 md:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-start space-x-2 md:space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="h-3.5 w-3.5 md:h-5 md:w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5 md:mb-1">
                          <h3 className="font-semibold text-xs md:text-sm sm:text-base truncate">{collection.id}</h3>
                          <Badge className={`${getStatusColor(collection.status)} text-[9px] md:text-xs w-fit`}>
                            {collection.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] md:text-xs sm:text-sm text-muted-foreground break-all line-clamp-1">
                          {collection.phone_number || 'N/A'} • {collection.reference}
                        </p>
                        <p className="text-[9px] md:text-xs text-muted-foreground">
                          {new Date(collection.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="text-sm md:text-lg font-bold">
                        UGX {(collection.amount / 1000).toFixed(0)}K
                      </div>
                      <div className="text-[9px] md:text-xs sm:text-sm text-muted-foreground capitalize">
                        {collection.status || 'pending'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPaymentLinks.map((link) => (
              <Card key={link.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-base md:text-lg">{link.reference}</h3>
                        <Badge className={`${getStatusColor(link.status)} w-fit`}>
                          <span className="capitalize">{link.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.paymentReason}</p>
                                              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Amount</p>
                            <p className="font-medium">UGX {link.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Payees</p>
                            <p className="font-medium">{link.totalPayees}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Successful</p>
                            <p className="font-medium text-green-600">{link.successfulPayments}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Unique Payers</p>
                            <p className="font-medium">{Array.from(new Set(link.paymentHistory.filter((p) => p.status === "completed").map((p) => p.phoneNumber))).length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Pending</p>
                            <p className="font-medium text-yellow-600">{link.pendingPayments}</p>
                          </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.link)}
                        className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>QR Code</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                      >
                        <Share className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLinkHistory(link)}
                            className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                          >
                            <History className="h-4 w-4" />
                            <span>History</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment History - {link.reference}</DialogTitle>
                            <DialogDescription>
                              Individual payments made through this link
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {link.paymentHistory.map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{payment.payerName}</p>
                                  <p className="text-sm text-muted-foreground">{payment.phoneNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(payment.paidAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">UGX {payment.amount.toLocaleString()}</p>
                                  <Badge className={getStatusColor(payment.status)}>
                                    {payment.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="flex gap-1">
                        <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Building className="h-4 w-4 mr-1" />
                              Send to Bank
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send to Bank</DialogTitle>
                              <DialogDescription>
                                Transfer collection funds to bank account
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="bank-amount">Amount (UGX)</Label>
                                <Input
                                  id="bank-amount"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={bankTransferData.amount}
                                  onChange={(e) => setBankTransferData({...bankTransferData, amount: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bank-account">Bank Account</Label>
                                <Select 
                                  value={bankTransferData.bankAccount} 
                                  onValueChange={(value) => setBankTransferData({...bankTransferData, bankAccount: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bank account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="stanbic-4567">Stanbic Bank - ***4567</SelectItem>
                                    <SelectItem value="centenary-8901">Centenary Bank - ***8901</SelectItem>
                                    <SelectItem value="dfcu-2345">DFCU Bank - ***2345</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bank-description">Description</Label>
                                <Input
                                  id="bank-description"
                                  placeholder="Transfer description"
                                  value={bankTransferData.description}
                                  onChange={(e) => setBankTransferData({...bankTransferData, description: e.target.value})}
                                />
                              </div>
                              <Button onClick={handleSendToBank} className="w-full">
                                Send to Bank
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdraw by Phone</DialogTitle>
                              <DialogDescription>
                                Send collection funds to mobile money account
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="withdraw-amount">Amount (UGX)</Label>
                                <Input
                                  id="withdraw-amount"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={withdrawData.amount}
                                  onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="withdraw-phone">Phone Number</Label>
                                <Input
                                  id="withdraw-phone"
                                  placeholder="+256701234567"
                                  value={withdrawData.phoneNumber}
                                  onChange={(e) => setWithdrawData({...withdrawData, phoneNumber: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="withdraw-description">Description</Label>
                                <Input
                                  id="withdraw-description"
                                  placeholder="Withdrawal description"
                                  value={withdrawData.description}
                                  onChange={(e) => setWithdrawData({...withdrawData, description: e.target.value})}
                                />
                              </div>
                              <Button onClick={handleWithdraw} className="w-full">
                                Withdraw
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {((activeTab === "collections" && filteredCollections.length === 0) || 
          (activeTab === "links" && filteredPaymentLinks.length === 0)) && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                {activeTab === "collections" ? (
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                ) : (
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                )}
                <h3 className="text-lg font-medium mb-2">
                  No {activeTab} found
                </h3>
                <p>
                  {activeTab === "collections" 
                    ? "Start collecting payments to see them here."
                    : "Create your first payment collection link to get started."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
};

export default Collections;
