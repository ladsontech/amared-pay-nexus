
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Receipt, Check, Eye, Printer, Filter, Search } from "lucide-react";
import TransactionDetailModal from "./TransactionDetailModal";

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Enhanced mock transaction data
  const transactions = [
    {
      id: "TXN001",
      date: "2024-06-12",
      type: "expense",
      amount: 2500,
      description: "Office supplies - printer paper",
      category: "Office Supplies",
      receipt: "RCP001",
      status: "approved",
      approvedBy: "John Doe",
      payee: "Office Depot Uganda",
      paymentMethod: "Cash",
      referenceNo: "811",
      location: "Kampala Branch",
      memo: "Monthly office supplies purchase for admin department"
    },
    {
      id: "TXN002",
      date: "2024-06-11",
      type: "addition",
      amount: 50000,
      description: "Monthly petty cash addition",
      category: "Cash Addition",
      receipt: "ADD001",
      status: "approved",
      approvedBy: "Jane Smith",
      payee: "Finance Department",
      paymentMethod: "Bank Transfer",
      referenceNo: "ADN002",
      location: "Head Office"
    },
    {
      id: "TXN003",
      date: "2024-06-10",
      type: "expense",
      amount: 5000,
      description: "Transport for office errands",
      category: "Travel & Transport",
      receipt: "RCP002",
      status: "pending",
      approvedBy: "",
      payee: "Uber Uganda",
      paymentMethod: "Mobile Money",
      referenceNo: "UB789",
      memo: "Transportation for document delivery"
    },
    {
      id: "TXN004",
      date: "2024-06-09",
      type: "expense",
      amount: 1200,
      description: "Tea and coffee for meeting",
      category: "Meals & Entertainment",
      receipt: "RCP003",
      status: "approved",
      approvedBy: "John Doe",
      payee: "Java House",
      paymentMethod: "Cash",
      referenceNo: "JH456"
    },
    {
      id: "TXN005",
      date: "2024-06-08",
      type: "expense",
      amount: 15000,
      description: "Maintenance and repairs",
      category: "Maintenance",
      receipt: "RCP004",
      status: "approved",
      approvedBy: "Jane Smith",
      payee: "Fix-It Services",
      paymentMethod: "Cash",
      referenceNo: "FX123"
    }
  ];

  const categories = [
    "Office Supplies",
    "Travel & Transport", 
    "Meals & Entertainment",
    "Maintenance",
    "Utilities",
    "Cash Addition",
    "Other"
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.payee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    let matchesDateRange = true;
    if (filterDateRange !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      
      switch (filterDateRange) {
        case "last7days":
          matchesDateRange = (now.getTime() - transactionDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
          break;
        case "last30days":
          matchesDateRange = (now.getTime() - transactionDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
          break;
        case "thisMonth":
          matchesDateRange = transactionDate.getMonth() === now.getMonth() && 
                           transactionDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Approved</span>;
    } else if (status === "pending") {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
    } else {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Rejected</span>;
    }
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Petty Cash Transaction History</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .filters { margin-bottom: 20px; font-size: 14px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .amount { font-weight: bold; }
              .expense { color: #dc2626; }
              .addition { color: #16a34a; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Petty Cash Transaction History</div>
              <div class="filters">
                Showing ${filteredTransactions.length} transactions
                ${filterCategory !== 'all' ? ` | Category: ${filterCategory}` : ''}
                ${filterStatus !== 'all' ? ` | Status: ${filterStatus}` : ''}
                ${filterDateRange !== 'all' ? ` | Period: ${filterDateRange}` : ''}
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Payee</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(transaction => `
                  <tr>
                    <td>${transaction.date}</td>
                    <td>${transaction.id}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.payee || '-'}</td>
                    <td>${transaction.category}</td>
                    <td class="amount ${transaction.type}">
                      ${transaction.type === 'expense' ? '-' : '+'}UGX ${transaction.amount.toLocaleString()}
                    </td>
                    <td>${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
                    <td>${transaction.receipt || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h2 className="text-lg font-bold text-black mb-4">Transaction History</h2>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-gray-600">
                View and filter all petty cash transactions
              </CardDescription>
            </div>
            <Button onClick={handlePrintAll} className="w-full lg:w-fit bg-blue-600 hover:bg-blue-700">
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-col lg:flex-row gap-4 mb-6">
            <Input
              placeholder="Search transactions, payee, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:max-w-sm bg-gray-50 border-gray-200"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="lg:max-w-xs bg-gray-50 border-gray-200">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="lg:max-w-xs bg-gray-50 border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="lg:max-w-xs bg-gray-50 border-gray-200">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Transaction List */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black">{transaction.id}</span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <span className="text-sm font-bold text-black">
                    {transaction.type === "expense" ? "-" : "+"}UGX {transaction.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{transaction.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{transaction.date}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewTransaction(transaction)}
                    className="h-6 px-2 text-blue-600"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-black">Date</TableHead>
                      <TableHead className="font-semibold text-black">ID</TableHead>
                      <TableHead className="font-semibold text-black">Description</TableHead>
                      <TableHead className="font-semibold text-black">Payee</TableHead>
                      <TableHead className="font-semibold text-black">Category</TableHead>
                      <TableHead className="font-semibold text-black">Amount</TableHead>
                      <TableHead className="font-semibold text-black">Receipt</TableHead>
                      <TableHead className="font-semibold text-black">Status</TableHead>
                      <TableHead className="font-semibold text-black">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell className="text-black">{transaction.date}</TableCell>
                        <TableCell className="font-medium text-black">{transaction.id}</TableCell>
                        <TableCell className="text-black">{transaction.description}</TableCell>
                        <TableCell className="text-black">{transaction.payee || "-"}</TableCell>
                        <TableCell className="text-black">{transaction.category}</TableCell>
                        <TableCell className={transaction.type === "expense" ? "text-red-600" : "text-green-600"}>
                          {transaction.type === "expense" ? "-" : "+"}UGX {transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {transaction.receipt ? (
                            <div className="flex items-center gap-1">
                              <Receipt className="h-4 w-4" />
                              {transaction.receipt}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTransaction(transaction)}
                              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.status === "pending" && (
                              <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal 
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Payee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Receipt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="hidden md:table-cell">{transaction.payee || "-"}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className={transaction.type === "expense" ? "text-red-600" : "text-green-600"}>
                      {transaction.type === "expense" ? "-" : "+"}UGX {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {transaction.receipt ? (
                        <div className="flex items-center gap-1">
                          <Receipt className="h-4 w-4" />
                          {transaction.receipt}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">View</span>
                        </Button>
                        {transaction.status === "pending" && (
                          <Button variant="outline" size="sm" className="text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal 
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default TransactionHistory;
