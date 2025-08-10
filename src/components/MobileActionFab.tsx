import React, { useState } from "react";
import { Plus, X, Wallet, Send, DollarSign, FileText, Banknote, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MobileActionFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      icon: Wallet,
      label: "New Petty Cash",
      path: "/org/petty-cash?tab=add",
      permission: "access_petty_cash" as const,
    },
    {
      icon: CheckCircle,
      label: "PC Approvals",
      path: "/org/petty-cash?tab=approvals",
      permission: "approve_transactions" as const,
    },
    {
      icon: Send,
      label: "New Bulk Payment",
      path: "/org/bulk-payments?tab=create",
      permission: "access_bulk_payments" as const,
    },
    {
      icon: CheckCircle,
      label: "BP Approvals",
      path: "/org/bulk-payments?tab=approvals",
      permission: "approve_bulk_payments" as const,
    },
    {
      icon: Banknote,
      label: "New Deposit",
      path: "/org/deposits?tab=create",
      permission: "access_bank_deposits" as const,
    },
    {
      icon: CheckCircle,
      label: "Deposit Approvals",
      path: "/org/deposits?tab=approvals",
      permission: "approve_bank_deposits" as const,
    },
    {
      icon: DollarSign,
      label: "New Collection",
      path: "/org/collections?action=new",
      permission: "access_collections" as const,
    },
    {
      icon: FileText,
      label: "New Report",
      path: "/org/reports?action=new",
      permission: "view_department_reports" as const,
    },
  ];

  const filteredActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (filteredActions.length === 0) return null;

  return (
    <>
      {/* Mobile FAB - Only visible on small screens */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        {/* Action buttons */}
        {isOpen && (
          <div className="flex flex-col gap-2 mb-3">
            {filteredActions.map((action) => (
              <div key={action.path} className="flex items-center gap-2">
                <span className="bg-background text-foreground px-3 py-1 rounded-full text-xs shadow-lg border">
                  {action.label}
                </span>
                <Button
                  size="sm"
                  className="h-10 w-10 rounded-full shadow-lg"
                  onClick={() => handleActionClick(action.path)}
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Main FAB button */}
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MobileActionFab;