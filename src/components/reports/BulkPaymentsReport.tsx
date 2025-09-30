import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { bulkPaymentReportData } from "@/data/reportData";
import BulkPaymentDetailsModal from "@/components/BulkPaymentDetailsModal";

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
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const BulkPaymentsReport = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("2024-01-01");
  const [toDate, setToDate] = useState<string>("2024-12-31");
  const [selectedPayment, setSelectedPayment] = useState<typeof bulkPaymentReportData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (payment: typeof bulkPaymentReportData[0]) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const inRange = (iso: string) => {
    const d = new Date(iso).getTime();
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    const to = new Date(`${toDate}T23:59:59`).getTime();
    return d >= from && d <= to;
  };

  const filtered = useMemo(() => {
    return bulkPaymentReportData
      .filter((p) => inRange(p.createdAt))
      .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
      .filter((p) => `${p.id} ${p.description}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter, fromDate, toDate]);

  const totalAmount = useMemo(() => filtered.reduce((s, p) => s + p.amount, 0), [filtered]);
  const totalRecipients = useMemo(() => filtered.reduce((s, p) => s + p.recipients, 0), [filtered]);
  const totalSuccessful = useMemo(() => filtered.reduce((s, p) => s + p.recipientDetails.successful, 0), [filtered]);
  const totalPending = useMemo(() => filtered.reduce((s, p) => s + p.recipientDetails.pending, 0), [filtered]);
  const totalFailed = useMemo(() => filtered.reduce((s, p) => s + p.recipientDetails.failed, 0), [filtered]);

  const handleExport = () => {
    exportCsv("bulk-payments-report.csv", filtered.map((p) => ({
      ID: p.id,
      Description: p.description,
      Status: p.status,
      Recipients: p.recipients,
      Amount: p.amount,
      CreatedAt: p.createdAt
    })));
  };

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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <label className="sr-only">Search</label>
              <Input placeholder="Search ID or description" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Success/Pending/Failed</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{p.id}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>
                  <Badge className={statusColor(p.status)}>{p.status}</Badge>
                </TableCell>
                <TableCell>{p.recipients}</TableCell>
                <TableCell>
                  <div className="flex gap-1 text-xs">
                    <span className="text-green-600">{p.recipientDetails.successful}✓</span>
                    <span className="text-yellow-600">{p.recipientDetails.pending}⏳</span>
                    <span className="text-red-600">{p.recipientDetails.failed}✗</span>
                  </div>
                </TableCell>
                <TableCell>UGX {p.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(p)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No records for selected filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BulkPaymentDetailsModal 
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default BulkPaymentsReport;