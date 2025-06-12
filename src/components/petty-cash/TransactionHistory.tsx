
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Receipt, Check } from "lucide-react";

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock transaction data
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
      approvedBy: "John Doe"
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
      approvedBy: "Jane Smith"
    },
    {
      id: "TXN003",
      date: "2024-06-10",
      type: "expense",
      amount: 5000,
      description: "Transport for office errands",
      category: "Travel",
      receipt: "RCP002",
      status: "pending",
      approvedBy: ""
    },
    {
      id: "TXN004",
      date: "2024-06-09",
      type: "expense",
      amount: 1200,
      description: "Tea and coffee for meeting",
      category: "Meals",
      receipt: "RCP003",
      status: "approved",
      approvedBy: "John Doe"
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>;
    } else if (status === "pending") {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>;
    } else {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View and filter all petty cash transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-sm"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="md:max-w-xs">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Meals">Meals</SelectItem>
                <SelectItem value="Cash Addition">Cash Addition</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="md:max-w-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
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
                        <Button variant="outline" size="sm">
                          View
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
    </div>
  );
};

export default TransactionHistory;
