import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { paymentService, BulkPayment, Link, Transaction } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function exportCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes("\"")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const statusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "approved":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "pending":
    case "pending_approval":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const transactionStatusColor = (status: string | null) => {
  switch (status) {
    case "successful":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface BulkPaymentWithDetails extends BulkPayment {
  links: Link[];
  transactions: Transaction[];
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
}

const BulkPaymentsReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [bulkPayments, setBulkPayments] = useState<BulkPaymentWithDetails[]>([]);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch bulk payments
        const bulkPaymentsResponse = await paymentService.getBulkPayments({
          organization: user.organizationId,
          limit: 100
        });

        // Fetch links for all bulk payments
        const linksPromises = bulkPaymentsResponse.results.map(bp =>
          paymentService.getLinks({
            bulk_payment: bp.id,
            limit: 100
          })
        );
        const linksResponses = await Promise.all(linksPromises);
        const allLinks = linksResponses.flatMap(response => response.results);

        // Fetch transactions for all links
        const transactionPromises = allLinks.map(link =>
          paymentService.getTransactions({
            link: link.id,
            limit: 100
          }).catch(() => ({ results: [] }))
        );
        const transactionResponses = await Promise.all(transactionPromises);
        const allTransactions = transactionResponses.flatMap(response => response.results);

        // Combine data
        const bulkPaymentsWithDetails: BulkPaymentWithDetails[] = bulkPaymentsResponse.results.map(bp => {
          const paymentLinks = allLinks.filter(link => link.bulk_payment.id === bp.id);
          const paymentTransactions = paymentLinks.flatMap(link =>
            allTransactions.filter(tx => tx.link === link.id)
          );

          const successfulCount = paymentTransactions.filter(tx => tx.status === "successful").length;
          const failedCount = paymentTransactions.filter(tx => tx.status === "failed").length;
          const pendingCount = paymentTransactions.filter(tx => tx.status === "pending").length;

          return {
            ...bp,
            links: paymentLinks,
            transactions: paymentTransactions,
            successfulCount,
            failedCount,
            pendingCount
          };
        });

        setBulkPayments(bulkPaymentsWithDetails);
      } catch (error: any) {
        console.error("Error fetching bulk payments report:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load bulk payments report. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.organizationId, toast]);

  const togglePayment = (paymentId: string) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const inRange = (iso: string) => {
    if (!fromDate || !toDate) return true;
    const d = new Date(iso).getTime();
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    const to = new Date(`${toDate}T23:59:59`).getTime();
    return d >= from && d <= to;
  };

  const filtered = useMemo(() => {
    return bulkPayments
      .filter((p) => inRange(p.created_at))
      .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
      .filter((p) => `${p.id} ${p.reference}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [search, statusFilter, fromDate, toDate, bulkPayments]);

  const totalAmount = useMemo(() => filtered.reduce((s, p) => s + p.total_amount, 0), [filtered]);
  const totalRecipients = useMemo(() => filtered.reduce((s, p) => s + p.links.length, 0), [filtered]);
  const totalSuccessful = useMemo(() => filtered.reduce((s, p) => s + p.successfulCount, 0), [filtered]);
  const totalPending = useMemo(() => filtered.reduce((s, p) => s + p.pendingCount, 0), [filtered]);
  const totalFailed = useMemo(() => filtered.reduce((s, p) => s + p.failedCount, 0), [filtered]);

  const handleExport = () => {
    const exportData = filtered.flatMap(payment => 
      payment.links.map(link => {
        const transaction = payment.transactions.find(tx => tx.link === link.id);
        return {
          "Payment ID": payment.id,
          "Reference": payment.reference,
          "Link ID": link.id,
          "Beneficiary Name": link.beneficiary_name || "N/A",
          "Beneficiary Phone": link.beneficiary_phone_number || "N/A",
          "Amount": link.amount,
          "Transaction Status": transaction?.status || "N/A",
          "Created At": new Date(payment.created_at).toLocaleDateString()
        };
      })
    );
    exportCsv("bulk-payments-report.csv", exportData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Payments Report</CardTitle>
          <CardDescription>Summary of bulk disbursements for the period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Total Amount</div>
              <div className="text-xl font-semibold">UGX {totalAmount.toLocaleString()}</div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Total Recipients</div>
              <div className="text-xl font-semibold">{totalRecipients}</div>
            </div>
            <div className="p-3 border rounded-md bg-green-50">
              <div className="text-xs text-green-600">Successful</div>
              <div className="text-xl font-semibold text-green-700">{totalSuccessful}</div>
            </div>
            <div className="p-3 border rounded-md bg-yellow-50">
              <div className="text-xs text-yellow-600">Pending</div>
              <div className="text-xl font-semibold text-yellow-700">{totalPending}</div>
            </div>
            <div className="p-3 border rounded-md bg-red-50">
              <div className="text-xs text-red-600">Failed</div>
              <div className="text-xl font-semibold text-red-700">{totalFailed}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </CardTitle>
          <CardDescription>Filter by date, status or text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-xs">From</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs">To</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <label className="sr-only">Search</label>
              <Input placeholder="Search ID or reference" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((payment) => {
          const isExpanded = expandedPayments.has(payment.id);
          const successfulLinks = payment.links.filter(link => {
            const tx = payment.transactions.find(t => t.link === link.id);
            return tx?.status === "successful";
          });
          const failedLinks = payment.links.filter(link => {
            const tx = payment.transactions.find(t => t.link === link.id);
            return tx?.status === "failed";
          });
          const pendingLinks = payment.links.filter(link => {
            const tx = payment.transactions.find(t => t.link === link.id);
            return !tx || tx.status === "pending";
          });

          return (
            <Card key={payment.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => togglePayment(payment.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base sm:text-lg">{payment.id}</CardTitle>
                      <Badge className={statusColor(payment.status || "")}>
                        {payment.status || "N/A"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Reference: {payment.reference}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        Amount: <span className="font-semibold">UGX {payment.total_amount.toLocaleString()}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Recipients: <span className="font-semibold">{payment.links.length}</span>
                      </span>
                      <span className="text-green-600">
                        Successful: <span className="font-semibold">{payment.successfulCount}</span>
                      </span>
                      <span className="text-yellow-600">
                        Pending: <span className="font-semibold">{payment.pendingCount}</span>
                      </span>
                      <span className="text-red-600">
                        Failed: <span className="font-semibold">{payment.failedCount}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Created: {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); togglePayment(payment.id); }}>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    {/* Successful Transactions */}
                    {successfulLinks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Successful Payments ({successfulLinks.length})
                        </h4>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Beneficiary Name</TableHead>
                                <TableHead className="text-xs">Phone Number</TableHead>
                                <TableHead className="text-xs">Amount</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {successfulLinks.map((link) => {
                                const tx = payment.transactions.find(t => t.link === link.id);
                                return (
                                  <TableRow key={link.id}>
                                    <TableCell className="text-xs">{link.beneficiary_name || "N/A"}</TableCell>
                                    <TableCell className="text-xs">{link.beneficiary_phone_number || "N/A"}</TableCell>
                                    <TableCell className="text-xs font-medium">UGX {link.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge className={transactionStatusColor(tx?.status || null)}>
                                        {tx?.status || "N/A"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {tx ? new Date(tx.created_at).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Failed Transactions */}
                    {failedLinks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Failed Payments ({failedLinks.length})
                        </h4>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Beneficiary Name</TableHead>
                                <TableHead className="text-xs">Phone Number</TableHead>
                                <TableHead className="text-xs">Amount</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {failedLinks.map((link) => {
                                const tx = payment.transactions.find(t => t.link === link.id);
                                return (
                                  <TableRow key={link.id}>
                                    <TableCell className="text-xs">{link.beneficiary_name || "N/A"}</TableCell>
                                    <TableCell className="text-xs">{link.beneficiary_phone_number || "N/A"}</TableCell>
                                    <TableCell className="text-xs font-medium">UGX {link.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge className={transactionStatusColor(tx?.status || null)}>
                                        {tx?.status || "N/A"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {tx ? new Date(tx.created_at).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Pending Transactions */}
                    {pendingLinks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Pending Payments ({pendingLinks.length})
                        </h4>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Beneficiary Name</TableHead>
                                <TableHead className="text-xs">Phone Number</TableHead>
                                <TableHead className="text-xs">Amount</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pendingLinks.map((link) => {
                                const tx = payment.transactions.find(t => t.link === link.id);
                                return (
                                  <TableRow key={link.id}>
                                    <TableCell className="text-xs">{link.beneficiary_name || "N/A"}</TableCell>
                                    <TableCell className="text-xs">{link.beneficiary_phone_number || "N/A"}</TableCell>
                                    <TableCell className="text-xs font-medium">UGX {link.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge className={transactionStatusColor(tx?.status || null)}>
                                        {tx?.status || "Pending"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {tx ? new Date(tx.created_at).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {payment.links.length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No payment links found for this bulk payment.
                      </div>
                    )}
                  </CardContent>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No bulk payments found for the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulkPaymentsReport;
