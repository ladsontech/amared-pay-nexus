import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Filter } from "lucide-react";
import { pettyCashStartingFloat, pettyCashTransactions, PettyCashTransaction } from "@/data/reportData";

// Calculate running balance for each transaction
function calculateRunningBalances(transactions: PettyCashTransaction[], startingBalance: number) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = startingBalance;
  
  return sorted.map(transaction => {
    const openingBalance = runningBalance;
    if (transaction.type === "addition") {
      runningBalance += transaction.amount;
    } else {
      runningBalance -= transaction.amount;
    }
    const closingBalance = runningBalance;
    
    return {
      ...transaction,
      openingBalance,
      closingBalance
    };
  });
}

function parseDate(dateStr: string): Date {
  // Ensure consistent parsing for YYYY-MM-DD
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

const PettyCashReport = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("approved");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Derive date range from dataset so we show data by default
  const datasetRange = useMemo(() => {
    const dates = pettyCashTransactions.map((t) => parseDate(t.date).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const toYmd = (d: Date) => d.toISOString().slice(0, 10);
    return { from: toYmd(min), to: toYmd(max) };
  }, []);

  const [fromDate, setFromDate] = useState<string>(datasetRange.from);
  const [toDate, setToDate] = useState<string>(datasetRange.to);

  const categories = useMemo(() => {
    const set = new Set<string>();
    pettyCashTransactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, []);

  const dateInRange = (dateStr: string) => {
    const d = parseDate(dateStr).getTime();
    const from = parseDate(fromDate).getTime();
    const to = parseDate(toDate).getTime();
    return d >= from && d <= to;
  };

  const filtered = useMemo<PettyCashTransaction[]>(() => {
    return pettyCashTransactions
      .filter((t) => dateInRange(t.date))
      .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter))
      .filter((t) => (categoryFilter === "all" ? true : t.category === categoryFilter))
      .filter((t) => {
        const text = `${t.id} ${t.description} ${t.category} ${t.payee ?? ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()); // Most recent first
  }, [fromDate, toDate, statusFilter, categoryFilter, search]);

  // Calculate balances for filtered transactions
  const transactionsWithBalances = useMemo(() => {
    return calculateRunningBalances(filtered, openingBalance);
  }, [filtered, openingBalance]);

  const openingBalance = useMemo(() => {
    const before = pettyCashTransactions
      .filter((t) => parseDate(t.date).getTime() < parseDate(fromDate).getTime())
      .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter));
    const additions = before.filter((t) => t.type === "addition").reduce((s, t) => s + t.amount, 0);
    const expenses = before.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return pettyCashStartingFloat + additions - expenses;
  }, [fromDate, statusFilter]);

  const inflows = useMemo(() => filtered.filter((t) => t.type === "addition").reduce((s, t) => s + t.amount, 0), [filtered]);
  const outflows = useMemo(() => filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [filtered]);
  const closingBalance = useMemo(() => openingBalance + inflows - outflows, [openingBalance, inflows, outflows]);

  const handleExport = () => {
    exportCsv("petty-cash-report.csv", filtered.map((t) => ({
      Date: t.date,
      ID: t.id,
      Type: t.type,
      Description: t.description,
      Category: t.category,
      Status: t.status,
      Payee: t.payee ?? "",
      Amount: (t.type === "expense" ? -t.amount : t.amount)
    })));
  };

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
                  {filtered.filter(t => t.type === "addition").length} transactions
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-base font-semibold text-black mb-1">Total Outflows (Expenses)</h4>
                <div className="text-xl font-bold text-red-700">-UGX {outflows.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {filtered.filter(t => t.type === "expense").length} transactions
                </p>
              </div>
            </div>

            {/* Net Movement */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-base font-semibold text-black mb-1">Net Movement</h4>
              <div className={`text-xl font-bold ${(inflows - outflows) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {(inflows - outflows) >= 0 ? '+' : ''}UGX {(inflows - outflows).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {(inflows - outflows) >= 0 ? 'Net increase' : 'Net decrease'} in fund
              </p>
            </div>

            {/* Closing Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-black mb-2">Closing Balance</h3>
              <p className="text-sm text-gray-600 mb-2">Cash available at end of period ({toDate})</p>
              <div className="text-2xl font-bold text-blue-600">UGX {closingBalance.toLocaleString()}</div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Calculation:</span> Opening ({openingBalance.toLocaleString()}) + Inflows ({inflows.toLocaleString()}) - Outflows ({outflows.toLocaleString()}) = {closingBalance.toLocaleString()}
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
                  <SelectItem value="pending">Pending</SelectItem>
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
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Input placeholder="Search description, ID, or payee" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <TableCell className="font-medium">{t.date}</TableCell>
                    <TableCell className="font-medium text-blue-600">{t.id}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.payee ?? "-"}</TableCell>
                    <TableCell className="text-right font-medium text-gray-700">
                      UGX {t.openingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className={`font-bold ${t.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                      {t.type === "expense" ? "-" : "+"}UGX {t.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-black">
                      UGX {t.closingBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={
                        t.status === "approved" ? "text-green-700 border-green-200" : 
                        t.status === "pending" ? "text-yellow-700 border-yellow-200" : 
                        "text-red-700 border-red-200"
                      }>
                        {t.status}
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

          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Payee</TableHead>
              <TableHead className="text-right">Opening Balance</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Closing Balance</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithBalances.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.date}</TableCell>
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="hidden md:table-cell">{t.category}</TableCell>
                <TableCell className="hidden md:table-cell">{t.payee ?? "-"}</TableCell>
                <TableCell className="text-right font-medium">UGX {t.openingBalance.toLocaleString()}</TableCell>
                <TableCell className={t.type === "expense" ? "text-red-600" : "text-green-600"}>
                  {t.type === "expense" ? "-" : "+"}UGX {t.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">UGX {t.closingBalance.toLocaleString()}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className={
                    t.status === "approved" ? "text-green-700" : t.status === "pending" ? "text-yellow-700" : "text-red-700"
                  }>
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {transactionsWithBalances.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">No transactions for selected filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PettyCashReport;