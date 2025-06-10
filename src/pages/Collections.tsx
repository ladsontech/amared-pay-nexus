
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, Filter, Download, Smartphone, Copy, QrCode, Share, Link as LinkIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
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
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"collections" | "links">("collections");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    description: "",
  });
  const [linkFormData, setLinkFormData] = useState({
    amount: "",
    reference: "",
    paymentReason: "",
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
            amount: 5000,
            phoneNumber: "+256701234567",
            status: "successful",
            method: "mobile_money",
            createdAt: "2024-01-15T10:30:00Z",
            reference: "REF001",
          },
          {
            id: "COL002",
            amount: 2500,
            phoneNumber: "+256789012345",
            status: "pending",
            method: "mobile_money",
            createdAt: "2024-01-14T14:20:00Z",
            reference: "REF002",
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
    // Mock data for payment links since there's no specific endpoint
    setPaymentLinks([
      {
        id: "PL001",
        amount: 5000,
        reference: "SCHOOL_FEES_2024",
        paymentReason: "School Fees Payment for Q1 2024",
        link: "https://pay.almaredpay.com/link/PL001",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
        totalPayees: 50,
        successfulPayments: 30,
        pendingPayments: 20,
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
          description: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Collection Initiated",
          description: "Mobile money collection has been initiated successfully.",
        });
        setFormData({ phoneNumber: "", amount: "", description: "" });
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

  const handleCreatePaymentLink = () => {
    if (!linkFormData.amount || !linkFormData.reference || !linkFormData.paymentReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newLink: PaymentLink = {
      id: `PL${String(paymentLinks.length + 1).padStart(3, '0')}`,
      amount: parseFloat(linkFormData.amount),
      reference: linkFormData.reference,
      paymentReason: linkFormData.paymentReason,
      link: `https://pay.almaredpay.com/link/PL${String(paymentLinks.length + 1).padStart(3, '0')}`,
      status: "active",
      createdAt: new Date().toISOString(),
      totalPayees: 0,
      successfulPayments: 0,
      pendingPayments: 0,
    };

    setPaymentLinks([newLink, ...paymentLinks]);
    setLinkFormData({ amount: "", reference: "", paymentReason: "" });

    toast({
      title: "Payment Link Created",
      description: "Your payment collection link has been generated successfully.",
    });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Payment link has been copied to clipboard.",
    });
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Collections & Payment Links</h1>
            <p className="text-muted-foreground">
              Manage mobile money collections and payment links
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Initiate Collection</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Initiate Mobile Money Collection</SheetTitle>
                  <SheetDescription>
                    Request payment from a specific phone number
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
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
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
                <Button className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Create Payment Link</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Create Payment Link</SheetTitle>
                  <SheetDescription>
                    Generate a collection link for multiple payees
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkAmount">Amount per Payment</Label>
                    <Input
                      id="linkAmount"
                      type="number"
                      placeholder="5000"
                      value={linkFormData.amount}
                      onChange={(e) => setLinkFormData({ ...linkFormData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Code</Label>
                    <Input
                      id="reference"
                      placeholder="SCHOOL_FEES_2024"
                      value={linkFormData.reference}
                      onChange={(e) => setLinkFormData({ ...linkFormData, reference: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentReason">Payment Reason</Label>
                    <Textarea
                      id="paymentReason"
                      placeholder="Describe what this payment is for..."
                      value={linkFormData.paymentReason}
                      onChange={(e) => setLinkFormData({ ...linkFormData, paymentReason: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreatePaymentLink} className="w-full">
                    Create Payment Link
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "collections"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "links"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Payment Links
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    ${collections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total collected</p>
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
                    ${paymentLinks.reduce((sum, link) => sum + (link.amount * link.successfulPayments), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">From payment links</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
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
                <CardContent className="p-6">
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{collection.id}</h3>
                          <Badge className={getStatusColor(collection.status)}>
                            {collection.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {collection.phoneNumber} • {collection.reference}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${collection.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
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
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-lg">{link.reference}</h3>
                        <Badge className={getStatusColor(link.status)}>
                          <span className="capitalize">{link.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.paymentReason}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">${link.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Payees</p>
                          <p className="font-medium">{link.totalPayees}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Successful</p>
                          <p className="font-medium text-green-600">{link.successfulPayments}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="font-medium text-yellow-600">{link.pendingPayments}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.link)}
                        className="flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>QR Code</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Share className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
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
    </DashboardLayout>
  );
};

export default Collections;
