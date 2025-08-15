
import { useState, useEffect } from "react";
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
import { Plus, Search, Filter, Download, Smartphone, Copy, QrCode, Share, Link as LinkIcon, Building, Phone, Eye, History } from "lucide-react";

import PaymentLinkForm from "@/components/PaymentLinkForm";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  amount: number;
  phoneNumber: string;
  status: "pending" | "successful" | "failed";
  method: "mobile_money" | "bank_transfer";
  createdAt: string;
  reference: string;
  description?: string;
  currency: string;
}

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchCollections();
    fetchPaymentLinks();
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/payments/collections/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      } else {
        // Fallback to mock data for demo
        setCollections([
          {
            id: "COL001",
            amount: 50000,
            phoneNumber: "+256701234567",
            status: "successful",
            method: "mobile_money",
            createdAt: "2024-01-15T10:30:00Z",
            reference: "REF001",
            currency: "UGX",
          },
          {
            id: "COL002",
            amount: 25000,
            phoneNumber: "+256789012345",
            status: "pending",
            method: "mobile_money",
            createdAt: "2024-01-14T14:20:00Z",
            reference: "REF002",
            currency: "UGX",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentLinks = async () => {
    // Mock data for payment links
    setPaymentLinks([
      {
        id: "PL001",
        amount: 50000,
        reference: "SCHOOL_FEES_2024",
        paymentReason: "School Fees Payment for Q1 2024",
        link: "https://pay.almaredpay.com/link/PL001",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
        totalPayees: 50,
        successfulPayments: 30,
        pendingPayments: 20,
        currency: "UGX",
        paymentHistory: [
          {
            id: "PAY001",
            payerName: "John Doe",
            phoneNumber: "+256701234567",
            amount: 50000,
            status: "completed",
            paidAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "PAY002",
            payerName: "Jane Smith", 
            phoneNumber: "+256789012345",
            amount: 50000,
            status: "completed",
            paidAt: "2024-01-15T11:15:00Z"
          },
          {
            id: "PAY003",
            payerName: "Michael Johnson",
            phoneNumber: "+256700111222",
            amount: 50000,
            status: "pending",
            paidAt: "2024-01-15T12:00:00Z"
          }
        ]
      },
    ]);
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
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/payments/mobile-money/initiate-collection/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          amount: parseFloat(formData.amount),
          currency: "UGX",
          description: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Collection Initiated",
          description: "Mobile money collection has been initiated successfully.",
        });
        setFormData({ phoneNumber: "+256", amount: "", description: "" });
        fetchCollections();
      } else {
        throw new Error("Failed to initiate collection");
      }
    } catch (error) {
      console.error("Error initiating collection:", error);
      toast({
        title: "Error",
        description: "Failed to initiate collection. Please try again.",
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

  const handleWithdraw = () => {
    if (!withdrawData.amount || !withdrawData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields", 
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of UGX ${parseFloat(withdrawData.amount).toLocaleString()} to ${withdrawData.phoneNumber} has been submitted`,
    });
    setWithdrawData({ amount: "", phoneNumber: "+256", description: "" });
    setWithdrawOpen(false);
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
      collection.phoneNumber.includes(searchTerm) ||
      collection.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaymentLinks = paymentLinks.filter(
    (link) =>
      link.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.paymentReason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Collections & Payment Links</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage mobile money collections and payment links (UGX only)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
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
                  <PaymentLinkForm onSuccess={fetchPaymentLinks} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${
              activeTab === "collections"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${
              activeTab === "links"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Payment Links
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activeTab === "collections" ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collections.length}</div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Successful</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {collections.filter(c => c.status === "successful").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed collections</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    UGX {collections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total collected</p>
                  <div className="flex gap-2 mt-3">
                    <Dialog open={sendToBankOpen} onOpenChange={setSendToBankOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Building className="h-3 w-3 mr-1" />
                          Send to Bank
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
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
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

        {/* Search and Filter */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
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
          <div className="space-y-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{collection.id}</h3>
                          <Badge className={`${getStatusColor(collection.status)} text-xs w-fit`}>
                            {collection.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">
                          {collection.phoneNumber} • {collection.reference}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="text-lg font-bold">
                        UGX {collection.amount.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {collection.method.replace("_", " ")}
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
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
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
          (activeTab === "links" && filteredPaymentLinks.length === 0)) && !isLoading && (
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
