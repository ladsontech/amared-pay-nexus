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
import { Plus, Wallet, Send, DollarSign } from "lucide-react";

const NewActionButton = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      label: "New Petty Cash Transaction",
      icon: Wallet,
      permission: "access_petty_cash" as const,
      action: () => navigate("/org/petty-cash?action=new"),
    },
    {
      label: "New Bulk Payment",
      icon: Send,
      permission: "access_bulk_payments" as const,
      action: () => navigate("/org/bulk-payments?action=new"),
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