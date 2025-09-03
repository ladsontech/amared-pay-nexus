import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import { BulkPaymentReportItem } from "@/data/reportData";

interface BulkPaymentDetailsModalProps {
  payment: BulkPaymentReportItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "successful":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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

const BulkPaymentDetailsModal = ({ payment, isOpen, onClose }: BulkPaymentDetailsModalProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!payment) return null;

  const { recipientDetails } = payment;

  const filteredRecipients = recipientDetails.recipients
    .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
    .filter((r) => `${r.name} ${r.phoneNumber}`.toLowerCase().includes(search.toLowerCase()));

  const handleExportRecipients = () => {
    exportCsv(`bulk-payment-${payment.id}-recipients.csv`, filteredRecipients.map((r) => ({
      ID: r.id,
      Name: r.name,
      PhoneNumber: r.phoneNumber,
      Amount: r.amount,
      Status: r.status,
      Reason: r.reason || ""
    })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Payment Details - {payment.id}
          </DialogTitle>
          <DialogDescription>
            Detailed recipient information for {payment.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
              <CardDescription>Overall payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-xl font-bold">UGX {payment.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Recipients</div>
                  <div className="text-xl font-bold">{payment.recipients}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={statusColor(payment.status)}>{payment.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm font-medium">{new Date(payment.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipient Status Summary</CardTitle>
              <CardDescription>Breakdown of payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-700">{recipientDetails.successful}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-700">{recipientDetails.pending}</div>
                    <div className="text-sm text-yellow-600">Pending</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-700">{recipientDetails.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Recipient Details</span>
                <Button variant="outline" size="sm" onClick={handleExportRecipients}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Recipients
                </Button>
              </CardTitle>
              <CardDescription>Filter and view individual recipient information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search recipients by name or phone number"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="min-w-[150px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipients Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Phone Number</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecipients.length > 0 ? (
                      filteredRecipients.map((recipient) => (
                        <TableRow key={recipient.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-blue-600">{recipient.id}</TableCell>
                          <TableCell className="font-medium">{recipient.name}</TableCell>
                          <TableCell>{recipient.phoneNumber}</TableCell>
                          <TableCell className="font-medium">UGX {recipient.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor(recipient.status)}>
                              {recipient.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {recipient.reason || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No recipients match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredRecipients.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredRecipients.length} of {recipientDetails.recipients.length} recipients
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPaymentDetailsModal;