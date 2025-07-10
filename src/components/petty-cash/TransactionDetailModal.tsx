
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Receipt, User, DollarSign, Printer, FileText } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "expense" | "addition";
  amount: number;
  description: string;
  category: string;
  receipt: string;
  status: "approved" | "pending" | "rejected";
  approvedBy: string;
  payee?: string;
  paymentMethod?: string;
  referenceNo?: string;
  location?: string;
  memo?: string;
  categoryDetails?: Array<{
    category: string;
    description: string;
    amount: number;
  }>;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal = ({ transaction, isOpen, onClose }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transaction ${transaction.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .transaction-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .transaction-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-group { margin-bottom: 15px; }
              .label { font-weight: bold; color: #666; }
              .value { margin-top: 5px; }
              .amount { font-size: 20px; font-weight: bold; color: ${transaction.type === 'expense' ? '#dc2626' : '#16a34a'}; }
              .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .approved { background: #dcfce7; color: #166534; }
              .pending { background: #fef3c7; color: #92400e; }
              .rejected { background: #fee2e2; color: #991b1b; }
              .category-details { margin-top: 20px; }
              .category-table { width: 100%; border-collapse: collapse; }
              .category-table th, .category-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
              .category-table th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="transaction-title">Transaction ${transaction.id}</div>
              <div>Petty Cash ${transaction.type === 'expense' ? 'Expense' : 'Addition'}</div>
            </div>
            
            <div class="transaction-info">
              <div>
                <div class="info-group">
                  <div class="label">Date</div>
                  <div class="value">${transaction.date}</div>
                </div>
                <div class="info-group">
                  <div class="label">Payee</div>
                  <div class="value">${transaction.payee || transaction.description}</div>
                </div>
                <div class="info-group">
                  <div class="label">Payment Method</div>
                  <div class="value">${transaction.paymentMethod || 'Cash'}</div>
                </div>
                <div class="info-group">
                  <div class="label">Reference No</div>
                  <div class="value">${transaction.referenceNo || transaction.id}</div>
                </div>
              </div>
              
              <div>
                <div class="info-group">
                  <div class="label">Amount</div>
                  <div class="value amount">${transaction.type === 'expense' ? '-' : '+'}UGX ${transaction.amount.toLocaleString()}</div>
                </div>
                <div class="info-group">
                  <div class="label">Status</div>
                  <div class="value">
                    <span class="status ${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                  </div>
                </div>
                <div class="info-group">
                  <div class="label">Approved By</div>
                  <div class="value">${transaction.approvedBy || 'Pending'}</div>
                </div>
                <div class="info-group">
                  <div class="label">Receipt</div>
                  <div class="value">${transaction.receipt || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            ${transaction.categoryDetails ? `
              <div class="category-details">
                <h3>Category Details</h3>
                <table class="category-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount (UGX)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transaction.categoryDetails.map(detail => `
                      <tr>
                        <td>${detail.category}</td>
                        <td>${detail.description}</td>
                        <td>UGX ${detail.amount.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
            
            ${transaction.memo ? `
              <div class="info-group">
                <div class="label">Memo</div>
                <div class="value">${transaction.memo}</div>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction {transaction.id}
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{transaction.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payee</p>
                  <p className="font-medium">{transaction.payee || transaction.description}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod || "Cash"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Reference No.</p>
                <p className="font-medium">{transaction.referenceNo || transaction.id}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className={`text-2xl font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}UGX {transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(transaction.status)}</div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Approved By</p>
                <p className="font-medium">{transaction.approvedBy || "Pending"}</p>
              </div>
              
              {transaction.receipt && (
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Receipt</p>
                    <p className="font-medium">{transaction.receipt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Category Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Category Details</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-right p-3 font-medium">Amount (UGX)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">{transaction.category}</td>
                    <td className="p-3">{transaction.description}</td>
                    <td className="p-3 text-right font-medium">UGX {transaction.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {transaction.memo && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Memo</h3>
                <p className="text-muted-foreground">{transaction.memo}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
