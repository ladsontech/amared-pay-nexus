import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  DollarSign,
  Wallet,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrgApprovals = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const pendingTransactions = [
    {
      id: '1',
      type: 'Petty Cash',
      requester: 'John Doe',
      amount: 125000,
      description: 'Office supplies purchase',
      date: '2024-01-20',
      category: 'Office Supplies',
      receipt: 'receipt_001.pdf',
      department: 'Operations'
    },
    {
      id: '2',
      type: 'Petty Cash',
      requester: 'Jane Smith',
      amount: 75000,
      description: 'Client meeting refreshments',
      date: '2024-01-20',
      category: 'Entertainment',
      receipt: 'receipt_002.jpg',
      department: 'Sales'
    },
    {
      id: '3',
      type: 'Petty Cash',
      requester: 'Bob Wilson',
      amount: 200000,
      description: 'Emergency office repairs',
      date: '2024-01-19',
      category: 'Maintenance',
      receipt: 'receipt_003.pdf',
      department: 'Facilities'
    }
  ];

  const pendingFunding = [
    {
      id: 'f1',
      requester: 'Finance Team',
      amount: 2000000,
      description: 'Monthly petty cash replenishment',
      date: '2024-01-20',
      currentBalance: 250000,
      requestedBalance: 2250000,
      department: 'Finance'
    },
    {
      id: 'f2',
      requester: 'Operations',
      amount: 500000,
      description: 'Additional budget for Q1 activities',
      date: '2024-01-19',
      currentBalance: 100000,
      requestedBalance: 600000,
      department: 'Operations'
    }
  ];

  const handleApprove = (id: string, type: 'transaction' | 'funding') => {
    toast({
      title: "Approved",
      description: `${type === 'transaction' ? 'Transaction' : 'Funding request'} has been approved successfully.`,
    });
  };

  const handleReject = (id: string, type: 'transaction' | 'funding') => {
    toast({
      title: "Rejected", 
      description: `${type === 'transaction' ? 'Transaction' : 'Funding request'} has been rejected.`,
      variant: "destructive",
    });
  };

  const filteredTransactions = pendingTransactions.filter(transaction =>
    transaction.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFunding = pendingFunding.filter(funding =>
    funding.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funding.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Approvals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and approve pending transactions and funding requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              className="pl-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="w-full sm:w-auto">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="transactions" className="relative">
            Transaction Approvals
            <Badge variant="secondary" className="ml-2">
              {pendingTransactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="funding" className="relative">
            Funding Approvals
            <Badge variant="secondary" className="ml-2">
              {pendingFunding.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{transaction.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {transaction.requester} • {transaction.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Amount</Label>
                          <p className="font-medium">UGX {transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium">{transaction.category}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label className="text-muted-foreground">Receipt:</Label>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          {transaction.receipt}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => handleApprove(transaction.id, 'transaction')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(transaction.id, 'transaction')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending transactions</h3>
                  <p className="text-muted-foreground">All transaction requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="funding">
          <div className="grid gap-4">
            {filteredFunding.map((funding) => (
              <Card key={funding.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Wallet className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Funding Request</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested by {funding.requester} • {funding.department}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50">
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Requested Amount</Label>
                          <p className="font-medium">UGX {funding.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Current Balance</Label>
                          <p className="font-medium">UGX {funding.currentBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Date</Label>
                          <p className="font-medium">{funding.date}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-muted-foreground">Justification</Label>
                        <p className="font-medium">{funding.description}</p>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                          <span>New Balance After Approval:</span>
                          <span className="font-bold text-green-600">
                            UGX {funding.requestedBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => handleApprove(funding.id, 'funding')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(funding.id, 'funding')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredFunding.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending funding requests</h3>
                  <p className="text-muted-foreground">All funding requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgApprovals;