import React, { useState } from "react";
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
import { Plus, Wallet, Send, DollarSign, Banknote, CheckCircle, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

const NewActionButton = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";
  const [open, setOpen] = useState(false);

  const quickActions = [
    {
      label: "Pay Bills",
      icon: FileText,
      action: () => navigate("/org/petty-cash?tab=bills"),
    },
    {
      label: "New Petty Cash Transaction",
      icon: Wallet,
      action: () => navigate("/org/petty-cash?tab=add"),
    },
    {
      label: "Petty Cash Approvals",
      icon: CheckCircle,
      action: () => navigate("/org/petty-cash?tab=approvals"),
    },
    {
      label: "New Bulk Payment",
      icon: Send,
      action: () => navigate("/org/bulk-payments?tab=create"),
    },
    {
      label: "Bulk Payment Approvals",
      icon: CheckCircle,
      action: () => navigate("/org/bulk-payments?tab=approvals"),
    },
    {
      label: "New Bank Deposit",
      icon: Banknote,
      action: () => navigate("/org/deposits?tab=create"),
    },
    {
      label: "Deposit Approvals",
      icon: CheckCircle,
      action: () => navigate("/org/deposits?tab=approvals"),
    },
    {
      label: "New Collection",
      icon: DollarSign,
      action: () => navigate("/org/collections?action=new"),
    },
  ];

  const availableActions = quickActions;


  const handleSelect = (run: () => void) => {
    setOpen(false);
    if (isMobile) setOpenMobile(false);
    run();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" aria-label="New Action">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">New Action</TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold">
            <Plus className="h-4 w-4" />
            <span>New Action</span>
          </Button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-sm border-border shadow-2xl">
        <DropdownMenuLabel className="text-foreground font-bold text-base">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableActions.map((action) => (
          <DropdownMenuItem 
            key={action.label} 
            onSelect={() => handleSelect(action.action)}
            className="hover:bg-secondary focus:bg-secondary cursor-pointer p-3"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-secondary">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">{action.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NewActionButton;