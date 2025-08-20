import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PaymentDetail {
  id: string;
  recipientName: string;
  amount: number;
  status: "success" | "failed" | "pending";
  account?: string;
  phoneNumber?: string;
  errorMessage?: string;
}

interface GroupedPayment {
  id: string;
  title: string;
  date: string;
  totalAmount: number;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  status: "completed" | "partial" | "pending" | "failed";
  details: PaymentDetail[];
}

interface GroupedPaymentHistoryProps {
  payments: GroupedPayment[];
}

const GroupedPaymentHistory = ({ payments }: GroupedPaymentHistoryProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "partial":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getDetailStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-emerald-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-blue-600";
      default:
        return "text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "failed":
        return XCircle;
      case "pending":
        return Clock;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const isExpanded = expandedItems.includes(payment.id);
        
        return (
          <Card key={payment.id} className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="cursor-pointer hover:bg-blue-100/50 transition-colors pb-3"
                  onClick={() => toggleExpanded(payment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? 
                        <ChevronDown className="h-4 w-4 text-slate-600" /> : 
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      }
                      <div className="p-2 rounded-lg bg-blue-100">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">{payment.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="h-3 w-3" />
                            {payment.date}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Users className="h-3 w-3" />
                            {payment.totalRecipients} recipients
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(payment.status)} text-xs mb-2`}>
                        {payment.status}
                      </Badge>
                      <p className="text-sm font-bold text-slate-900">
                        UGX {payment.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-blue-100/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600">{payment.successCount}</div>
                      <div className="text-xs text-slate-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{payment.failedCount}</div>
                      <div className="text-xs text-slate-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{payment.pendingCount}</div>
                      <div className="text-xs text-slate-600">Pending</div>
                    </div>
                  </div>

                  {/* Detailed List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {payment.details.map((detail, index) => {
                      const StatusIcon = getStatusIcon(detail.status);
                      return (
                        <div 
                          key={detail.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-100"
                        >
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${getDetailStatusColor(detail.status)}`} />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{detail.recipientName}</p>
                              <p className="text-xs text-slate-600">
                                {detail.account || detail.phoneNumber}
                              </p>
                              {detail.errorMessage && (
                                <p className="text-xs text-red-600 mt-1">{detail.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              UGX {detail.amount.toLocaleString()}
                            </p>
                            <Badge 
                              className={`${getDetailStatusColor(detail.status)} text-xs mt-1`}
                              variant="outline"
                            >
                              {detail.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default GroupedPaymentHistory;