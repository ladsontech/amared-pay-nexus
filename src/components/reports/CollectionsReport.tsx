import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { paymentService, Collection } from "@/services/paymentService";
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

const statusColor = (status: string | null) => {
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

const CollectionsReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await paymentService.getCollections({
          organization: user.organizationId,
          limit: 100
        });
        setCollections(response.results);
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load collections. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [user?.organizationId, toast]);

  const inRange = (iso: string) => {
    if (!fromDate || !toDate) return true;
    const d = new Date(iso).getTime();
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    const to = new Date(`${toDate}T23:59:59`).getTime();
    return d >= from && d <= to;
  };

  const filtered = useMemo(() => {
    return collections
      .filter((c) => inRange(c.created_at))
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => {
        // Collections don't have a mode field, so we'll filter by phone_number presence
        // Collections with phone_number are typically mobile money
        if (methodFilter === "all") return true;
        if (methodFilter === "mobile_money") return !!c.phone_number;
        if (methodFilter === "bank_transfer") return !c.phone_number;
        return true;
      })
      .filter((c) => {
        const searchText = `${c.id} ${c.reason || ""} ${c.phone_number || ""}`.toLowerCase();
        return searchText.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [collections, search, statusFilter, methodFilter, fromDate, toDate]);

  const totalAmount = useMemo(() => filtered.reduce((s, c) => s + (c.amount || 0), 0), [filtered]);
  const countSuccessful = useMemo(() => filtered.filter((c) => c.status === "successful").length, [filtered]);

  const handleExport = () => {
    exportCsv("collections-report.csv", filtered.map((c) => ({
      ID: c.id,
      PhoneNumber: c.phone_number || "N/A",
      Method: c.mode || "N/A",
      Status: c.status || "N/A",
      Amount: c.amount || 0,
      Reason: c.reason || "N/A",
      CreatedAt: c.created_at
    })));
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Collection Report</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Mobile money and bank transfer collections in the period</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Total Amount</div>
              <div className="text-lg sm:text-xl font-semibold break-words">UGX {totalAmount.toLocaleString()}</div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Successful</div>
              <div className="text-lg sm:text-xl font-semibold text-green-700">{countSuccessful}</div>
            </div>
            <div className="p-3 border rounded-md sm:col-span-2 lg:col-span-1">
              <div className="text-xs text-muted-foreground">Transactions</div>
              <div className="text-lg sm:text-xl font-semibold">{filtered.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-base sm:text-lg">Filters</span>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-2">Filter by date, status, method, or text</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">From Date</label>
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">To Date</label>
              <Input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Method</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
              <label className="text-xs font-medium">Search</label>
              <Input 
                placeholder="Search ID, reason, or phone" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border overflow-x-auto -mx-4 sm:mx-0">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">ID</TableHead>
              <TableHead className="text-xs sm:text-sm">Phone</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Amount</TableHead>
              <TableHead className="text-xs sm:text-sm">Reason</TableHead>
              <TableHead className="text-xs sm:text-sm">Reference</TableHead>
              <TableHead className="text-xs sm:text-sm">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-xs sm:text-sm p-2 sm:p-4">
                  <span className="break-all">{c.id}</span>
                </TableCell>
                <TableCell className="text-xs sm:text-sm p-2 sm:p-4">{c.phone_number || "N/A"}</TableCell>
                <TableCell className="p-2 sm:p-4">
                  <Badge className={`${statusColor(c.status)} text-xs`}>
                    {c.status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs sm:text-sm p-2 sm:p-4 whitespace-nowrap">
                  UGX {(c.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs sm:text-sm p-2 sm:p-4">
                  <span className="break-all">{c.reason || "N/A"}</span>
                </TableCell>
                <TableCell className="text-xs sm:text-sm p-2 sm:p-4">
                  <span className="break-all">{c.reference || "N/A"}</span>
                </TableCell>
                <TableCell className="text-xs sm:text-sm p-2 sm:p-4 whitespace-nowrap">
                  {new Date(c.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground text-xs sm:text-sm p-4 sm:p-6">
                  {isLoading ? "Loading..." : "No records for selected filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CollectionsReport;
