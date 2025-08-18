import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, Wallet, Send, DollarSign, Banknote, CheckCircle } from "lucide-react";

const NewActionButton = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      label: "New Petty Cash Transaction",
      icon: Wallet,
      permission: "access_petty_cash" as const,
      action: () => navigate("/org/petty-cash?tab=add"),
    },
    {
      label: "Petty Cash Approvals",
      icon: CheckCircle,
      permission: "approve_transactions" as const,
      action: () => navigate("/org/petty-cash?tab=approvals"),
    },
    {
      label: "New Bulk Payment",
      icon: Send,
      permission: "access_bulk_payments" as const,
      action: () => navigate("/org/bulk-payments?tab=create"),
    },
    {
      label: "Bulk Payment Approvals",
      icon: CheckCircle,
      permission: "approve_bulk_payments" as const,
      action: () => navigate("/org/bulk-payments?tab=approvals"),
    },
    {
      label: "New Bank Deposit",
      icon: Banknote,
      permission: "access_bank_deposits" as const,
      action: () => navigate("/org/deposits?tab=create"),
    },
    {
      label: "Deposit Approvals",
      icon: CheckCircle,
      permission: "approve_bank_deposits" as const,
      action: () => navigate("/org/deposits?tab=approvals"),
    },
    {
      label: "New Collection",
      icon: DollarSign,
      permission: "access_collections" as const,
      action: () => navigate("/org/collections?action=new"),
    },
  ];

  const availableActions = quickActions.filter(action => hasPermission(action.permission));

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
          <Plus className="h-4 w-4" />
          <span className="font-semibold">New Action</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl">
        <DropdownMenuLabel className="text-slate-700 font-semibold">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableActions.map((action) => (
          <DropdownMenuItem 
            key={action.label} 
            onClick={action.action}
            className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-md bg-slate-100">
                <action.icon className="h-4 w-4 text-slate-600" />
              </div>
              <span className="font-medium text-slate-700">{action.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NewActionButton;