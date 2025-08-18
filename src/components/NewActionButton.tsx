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
import { useIsMobile } from "@/hooks/use-mobile";

const NewActionButton = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {availableActions.map((action) => (
          <Button key={action.label} variant="outline" size="sm" onClick={action.action} className="justify-start">
            <action.icon className="h-4 w-4 mr-2" />
            <span className="text-xs line-clamp-1">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableActions.map((action) => (
          <DropdownMenuItem key={action.label} onClick={action.action}>
            <action.icon className="mr-2 h-4 w-4" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NewActionButton;