import React, { useState } from "react";
import { Plus, X, Wallet, Send, DollarSign, FileText, Banknote, CheckCircle, Users, BarChart3, Activity, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MobileActionFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const actionCategories = [
    {
      title: "💰 Financial",
      icon: DollarSign,
      actions: [
        {
          icon: Wallet,
          label: "New Petty Cash",
          path: "/org/petty-cash?tab=add",
          permission: "access_petty_cash" as const,
          color: "purple"
        },
        {
          icon: Send,
          label: "New Bulk Payment",
          path: "/org/bulk-payments?tab=create",
          permission: "access_bulk_payments" as const,
          color: "blue"
        },
        {
          icon: DollarSign,
          label: "New Collection",
          path: "/org/collections?action=new",
          permission: "access_collections" as const,
          color: "emerald"
        },
        {
          icon: Banknote,
          label: "New Deposit",
          path: "/org/deposits?tab=create",
          permission: "access_bank_deposits" as const,
          color: "indigo"
        }
      ]
    },
    {
      title: "⚙️ Administration",
      icon: CheckCircle,
      actions: [
        {
          icon: CheckCircle,
          label: "PC Approvals",
          path: "/org/petty-cash?tab=approvals",
          permission: "approve_transactions" as const,
          color: "amber"
        },
        {
          icon: CheckCircle,
          label: "BP Approvals",
          path: "/org/bulk-payments?tab=approvals",
          permission: "approve_bulk_payments" as const,
          color: "amber"
        },
        {
          icon: CheckCircle,
          label: "Deposit Approvals",
          path: "/org/deposits?tab=approvals",
          permission: "approve_bank_deposits" as const,
          color: "amber"
        }
      ]
    },
    {
      title: "📊 Reports & Analytics",
      icon: BarChart3,
      actions: [
        {
          icon: FileText,
          label: "New Report",
          path: "/org/reports?action=new",
          permission: "view_department_reports" as const,
          color: "orange"
        },
        {
          icon: BarChart3,
          label: "Analytics",
          path: "/org/reports",
          permission: "view_department_reports" as const,
          color: "orange"
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: "from-purple-50/80 to-purple-100/60 border-purple-200/40 hover:from-purple-100/90 hover:to-purple-200/80 hover:border-purple-300/60",
      blue: "from-blue-50/80 to-blue-100/60 border-blue-200/40 hover:from-blue-100/90 hover:to-blue-200/80 hover:border-blue-300/60",
      emerald: "from-emerald-50/80 to-emerald-100/60 border-emerald-200/40 hover:from-emerald-100/90 hover:to-emerald-200/80 hover:border-emerald-300/60",
      indigo: "from-indigo-50/80 to-indigo-100/60 border-indigo-200/40 hover:from-indigo-100/90 hover:to-indigo-200/80 hover:border-indigo-300/60",
      amber: "from-amber-50/80 to-amber-100/60 border-amber-200/40 hover:from-amber-100/90 hover:to-amber-200/80 hover:border-amber-300/60",
      orange: "from-orange-50/80 to-orange-100/60 border-orange-200/40 hover:from-orange-100/90 hover:to-orange-200/80 hover:border-orange-300/60"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      purple: "text-purple-600",
      blue: "text-blue-600",
      emerald: "text-emerald-600",
      indigo: "text-indigo-600",
      amber: "text-amber-600",
      orange: "text-orange-600"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconBgColor = (color: string) => {
    const colorMap = {
      purple: "from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300",
      blue: "from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300",
      emerald: "from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300",
      indigo: "from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300",
      amber: "from-amber-100 to-amber-200 group-hover:from-amber-200 group-hover:to-amber-300",
      orange: "from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile FAB - Only visible on small screens */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        {/* Main FAB button */}
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Glass-like Actions Container */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Actions Container */}
          <div className="fixed bottom-32 right-4 z-40 md:hidden w-80 max-h-[70vh] overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-4 space-y-4">
              <div className="text-center pb-2 border-b border-slate-200/60">
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Quick Actions
                </h3>
                <p className="text-xs text-slate-600 mt-1">Choose an action to get started</p>
              </div>
              
              {actionCategories.map((category) => {
                const filteredActions = category.actions.filter(action => 
                  !action.permission || hasPermission(action.permission)
                );
                
                if (filteredActions.length === 0) return null;
                
                return (
                  <div key={category.title} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-slate-600" />
                      <h4 className="text-sm font-semibold text-slate-800">{category.title}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {filteredActions.map((action) => (
                        <button
                          key={action.path}
                          className="group relative overflow-hidden bg-gradient-to-br from-slate-50/80 to-slate-100/60 hover:from-slate-100/90 hover:to-slate-200/80 backdrop-blur-sm border border-slate-200/40 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-slate-300/60"
                          onClick={() => handleActionClick(action.path)}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${getIconBgColor(action.color)} transition-all duration-300 shadow-sm`}>
                              <action.icon className={`h-4 w-4 ${getIconColor(action.color)}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-800 text-center leading-tight">
                              {action.label}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileActionFab;