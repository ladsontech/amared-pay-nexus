import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { organizationService, PettyCashTransaction } from "@/services/organizationService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";

interface TransactionWithBalance extends PettyCashTransaction {
  openingBalance: number;
  closingBalance: number;
  displayDate: string;
  displayType: "expense" | "addition";
  displayCategory: string;
  displayPayee: string;
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

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

// Calculate running balance for each transaction
function calculateRunningBalances(
  transactions: TransactionWithBalance[],
  startingBalance: number
): TransactionWithBalance[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let runningBalance = startingBalance;

  return sorted.map((transaction) => {
    const openingBalance = runningBalance;
    if (transaction.type === "credit") {
      runningBalance += transaction.amount;
    } else if (transaction.type === "debit") {
      runningBalance -= transaction.amount;
    }
    const closingBalance = runningBalance;

    return {
      ...transaction,
      openingBalance,
      closingBalance,
    };
  });
}

const PettyCashReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { pettyCashWallets } = useOrganization();
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("approved");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Initialize date range
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Get date range from transactions
  const datasetRange = useMemo(() => {
    if (transactions.length === 0) {
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return {
        from: lastMonth.toISOString().slice(0, 10),
        to: today.toISOString().slice(0, 10),
      };
    }
    const dates = transactions.map((t) => new Date(t.created_at).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const toYmd = (d: Date) => d.toISOString().slice(0, 10);
    return { from: toYmd(min), to: toYmd(max) };
  }, [transactions]);

  // Update date range when transactions are loaded
  useEffect(() => {
    if (!fromDate && !toDate && datasetRange.from && datasetRange.to) {
      setFromDate(datasetRange.from);
      setToDate(datasetRange.to);
    }
  }, [datasetRange, fromDate, toDate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch all petty cash transactions
        const response = await organizationService.getPettyCashTransactions({
          organization: user.organizationId,
          limit: 1000
        });

        setTransactions(response.results);
      } catch (error: any) {
        console.error("Error fetching petty cash transactions:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load petty cash transactions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.organizationId, toast]);

  // Map API transactions to report format
  const mappedTransactions = useMemo<TransactionWithBalance[]>(() => {
    return transactions.map((t) => {
      // Extract category from title or use default
      const titleParts = (t.title || "").split("-");
      const category = titleParts.length > 1 ? titleParts[0].trim() : "General";
      const description = titleParts.length > 1 ? titleParts.slice(1).join("-").trim() : (t.title || "Transaction");
      
      // Map type: credit = addition, debit = expense
      const displayType = t.type === "credit" ? "addition" : "expense";
      
      // Extract payee from updated_by user
      const payee = t.updated_by
        ? `${t.updated_by.first_name || ""} ${t.updated_by.last_name || ""}`.trim() || t.updated_by.username || "N/A"
        : "N/A";

      return {
        ...t,
        displayDate: t.created_at.split("T")[0],
        displayType,
        displayCategory: category,
        displayPayee: payee,
        openingBalance: 0,
        closingBalance: 0,
      };
    });
  }, [transactions]);

  // Get categories from transactions
  const categories = useMemo(() => {
    const set = new Set<string>();
    mappedTransactions.forEach((t) => set.add(t.displayCategory));
    return Array.from(set).sort();
  }, [mappedTransactions]);

  const dateInRange = (dateStr: string) => {
    if (!fromDate || !toDate) return true;
    const d = new Date(dateStr).getTime();
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    const to = new Date(`${toDate}T23:59:59`).getTime();
    return d >= from && d <= to;
  };

  // Get starting balance from petty cash wallet
  const startingBalance = useMemo(() => {
    if (pettyCashWallets && pettyCashWallets.length > 0) {
      // Calculate balance from transactions before the date range
      const beforeTransactions = mappedTransactions.filter(
        (t) => new Date(t.created_at).getTime() < new Date(`${fromDate}T00:00:00`).getTime()
      );
      let balance = pettyCashWallets[0].balance || 0;
      
      // Adjust for transactions before the date range
      beforeTransactions.forEach((t) => {
        if (t.type === "credit") {
          balance -= t.amount;
        } else if (t.type === "debit") {
          balance += t.amount;
        }
      });
      
      return balance;
    }
    return 0;
  }, [pettyCashWallets, mappedTransactions, fromDate]);

  const filtered = useMemo<TransactionWithBalance[]>(() => {
    return mappedTransactions
      .filter((t) => dateInRange(t.displayDate))
      .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter))
      .filter((t) => (categoryFilter === "all" ? true : t.displayCategory === categoryFilter))
      .filter((t) => {
        const text = `${t.id} ${t.title || ""} ${t.displayCategory} ${t.displayPayee}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [mappedTransactions, fromDate, toDate, statusFilter, categoryFilter, search]);

  // Calculate opening balance for filtered transactions
  const openingBalance = useMemo(() => {
    const before = mappedTransactions.filter(
      (t) => new Date(t.created_at).getTime() < new Date(`${fromDate}T00:00:00`).getTime()
    );
    let balance = startingBalance;
    before.forEach((t) => {
      if (t.type === "credit") {
        balance += t.amount;
      } else if (t.type === "debit") {
        balance -= t.amount;
      }
    });
    return balance;
  }, [mappedTransactions, fromDate, startingBalance]);

  // Calculate balances for filtered transactions
  const transactionsWithBalances = useMemo(() => {
    return calculateRunningBalances(filtered, openingBalance);
  }, [filtered, openingBalance]);

  const inflows = useMemo(
    () => filtered.filter((t) => t.displayType === "addition").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const outflows = useMemo(
    () => filtered.filter((t) => t.displayType === "expense").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const closingBalance = useMemo(
    () => openingBalance + inflows - outflows,
    [openingBalance, inflows, outflows]
  );

  const handleExport = () => {
    exportCsv(
      "petty-cash-report.csv",
      filtered.map((t) => ({
        Date: t.displayDate,
        ID: t.id,
        Type: t.displayType,
        Description: t.title || "N/A",
        Category: t.displayCategory,
        Status: t.status || "N/A",
        Payee: t.displayPayee,
        Amount: t.displayType === "expense" ? -t.amount : t.amount,
      }))
    );
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
          <CardTitle>Petty Cash Financial Statement</CardTitle>
          <CardDescription>Standard accounting format showing fund flow for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Opening Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-black mb-2">Opening Balance</h3>
              <p className="text-sm text-gray-600 mb-2">Cash available at start of period ({fromDate})</p>
              <div className="text-2xl font-bold text-blue-600">UGX {openingBalance.toLocaleString()}</div>
            </div>

            {/* Fund Movements Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-base font-semibold text-black mb-1">Total Inflows (Additions)</h4>
                <div className="text-xl font-bold text-green-700">+UGX {inflows.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {filtered.filter((t) => t.displayType === "addition").length} transactions
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-base font-semibold text-black mb-1">Total Outflows (Expenses)</h4>
                <div className="text-xl font-bold text-red-700">-UGX {outflows.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {filtered.filter((t) => t.displayType === "expense").length} transactions
                </p>
              </div>
            </div>

            {/* Net Movement */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-base font-semibold text-black mb-1">Net Movement</h4>
              <div className={`text-xl font-bold ${inflows - outflows >= 0 ? "text-green-700" : "text-red-700"}`}>
                {inflows - outflows >= 0 ? "+" : ""}UGX {(inflows - outflows).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {inflows - outflows >= 0 ? "Net increase" : "Net decrease"} in fund
              </p>
            </div>

            {/* Closing Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-black mb-2">Closing Balance</h3>
              <p className="text-sm text-gray-600 mb-2">Cash available at end of period ({toDate})</p>
              <div className="text-2xl font-bold text-blue-600">UGX {closingBalance.toLocaleString()}</div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Calculation:</span> Opening ({openingBalance.toLocaleString()}) + Inflows (
                {inflows.toLocaleString()}) - Outflows ({outflows.toLocaleString()}) ={" "}
                {closingBalance.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Filters & Export</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Filter by date, status, category or text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Input
                placeholder="Search description, ID, or payee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Transaction Ledger</CardTitle>
          <CardDescription>
            Complete transaction history with running balances ({filtered.length} transactions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="font-semibold text-black">Date</TableHead>
                  <TableHead className="font-semibold text-black">ID</TableHead>
                  <TableHead className="font-semibold text-black">Description</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-black">Category</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-black">Payee</TableHead>
                  <TableHead className="text-right font-semibold text-black">Opening Balance</TableHead>
                  <TableHead className="font-semibold text-black">Amount</TableHead>
                  <TableHead className="text-right font-semibold text-black">Closing Balance</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-black">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsWithBalances.map((t) => (
                  <TableRow key={t.id} className="hover:bg-blue-50">
                    <TableCell className="font-medium">{t.displayDate}</TableCell>
                    <TableCell className="font-medium text-blue-600">{t.id}</TableCell>
                    <TableCell>{t.title || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.displayCategory}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.displayPayee}</TableCell>
                    <TableCell className="text-right font-medium text-gray-700">
                      UGX {t.openingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={`font-bold ${t.displayType === "expense" ? "text-red-600" : "text-green-600"}`}
                    >
                      {t.displayType === "expense" ? "-" : "+"}UGX {t.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-black">
                      UGX {t.closingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          t.status === "approved"
                            ? "text-green-700 border-green-200"
                            : t.status === "pending_approval"
                            ? "text-yellow-700 border-yellow-200"
                            : "text-red-700 border-red-200"
                        }
                      >
                        {t.status || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {transactionsWithBalances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No transactions for selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PettyCashReport;
