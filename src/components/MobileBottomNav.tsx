
import { Link, useLocation } from "react-router-dom";
import { Home, CreditCard, Coins, Wallet, Menu, Settings, Users, UserCircle, LogOut, Send, DollarSign, Plus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/types/auth";

const MobileBottomNav = () => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const navItems: Array<{
    icon: any;
    label: string;
    path: string;
    active: boolean;
    permission?: Permission;
  }> = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    { 
      icon: Wallet, 
      label: "Petty Cash", 
      path: "/org/petty-cash",
      active: location.pathname.includes("/petty-cash"),
      permission: "access_petty_cash" as Permission
    },
    { 
      icon: Send, 
      label: "Bulk Payments", 
      path: "/org/bulk-payments",
      active: location.pathname.includes("/bulk-payments"),
      permission: "access_bulk_payments" as Permission
    },
    { 
      icon: DollarSign, 
      label: "Collections", 
      path: "/org/collections",
      active: location.pathname.includes("/collections"),
      permission: "access_collections" as Permission
    }
  ];

  const drawerItems = [
    { icon: Users, label: "Organizations", path: "/organizations" },
    { icon: UserCircle, label: "Sub-Admins", path: "/sub-admins" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
      navigate("/login");
      setDrawerOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging you out, but you've been signed out locally.",
        variant: "destructive",
      });
      navigate("/login");
      setDrawerOpen(false);
    }
  };

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-[9999] md:hidden">
        <div className="bg-white border-t border-slate-200 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-around px-2 py-2 relative">
            {/* Home */}
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/dashboard" 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>

            {/* Petty Cash */}
            {hasPermission('access_petty_cash') && (
              <Link 
                to="/org/petty-cash" 
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname.includes("/petty-cash") 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
                }`}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs font-medium">Petty Cash</span>
              </Link>
            )}

            {/* Center Plus Button - Protruding */}
            <div className="relative -top-6">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
                onClick={() => setDrawerOpen(true)}
              >
                <Plus className="h-8 w-8" />
              </Button>
            </div>

            {/* Bulk Payments */}
            {hasPermission('access_bulk_payments') && (
              <Link 
                to="/org/bulk-payments" 
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname.includes("/bulk-payments") 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <Send className="h-5 w-5" />
                <span className="text-xs font-medium">Bulk Pay</span>
              </Link>
            )}

            {/* Collections */}
            {hasPermission('access_collections') && (
              <Link 
                to="/org/collections" 
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname.includes("/collections") 
                    ? "text-emerald-600 bg-emerald-50" 
                    : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-medium">Collections</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Quick Actions Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-b border-slate-200">
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Quick Actions Hub
            </DrawerTitle>
            <p className="text-sm text-slate-600">Choose an action to get started</p>
          </DrawerHeader>
          
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Financial Actions */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-slate-800 border-b border-slate-200/60 pb-2">
                💰 Financial Management
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {hasPermission('access_petty_cash') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-50/80 to-purple-100/60 hover:from-purple-100/90 hover:to-purple-200/80 backdrop-blur-sm border border-purple-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-purple-300/60"
                    onClick={() => { navigate("/org/petty-cash?tab=add"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-sm">
                        <Wallet className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-purple-700 transition-colors">
                          Petty Cash
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          Manage expenses
                        </span>
                      </div>
                    </div>
                  </button>
                )}
                
                {hasPermission('access_bulk_payments') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-blue-100/60 hover:from-blue-100/90 hover:to-blue-200/80 backdrop-blur-sm border border-blue-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300/60"
                    onClick={() => { navigate("/org/bulk-payments?tab=create"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
                        <Send className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-blue-700 transition-colors">
                          Bulk Payments
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          Send multiple payments
                        </span>
                      </div>
                    </div>
                  </button>
                )}
                
                {hasPermission('access_collections') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 hover:from-emerald-100/90 hover:to-emerald-200/80 backdrop-blur-sm border border-emerald-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-emerald-300/60"
                    onClick={() => { navigate("/org/collections?action=new"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300 shadow-sm">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-emerald-700 transition-colors">
                          Collections
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          Receive payments
                        </span>
                      </div>
                    </div>
                  </button>
                )}
                
                {hasPermission('access_bank_deposits') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 hover:from-indigo-100/90 hover:to-indigo-200/80 backdrop-blur-sm border border-indigo-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-indigo-300/60"
                    onClick={() => { navigate("/org/deposits?tab=create"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300 shadow-sm">
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-indigo-700 transition-colors">
                          Bank Deposits
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          Send to bank
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Administrative Actions */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-slate-800 border-b border-slate-200/60 pb-2">
                ⚙️ Administration
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {hasPermission('approve_transactions') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-amber-50/80 to-amber-100/60 hover:from-amber-100/90 hover:to-amber-200/80 backdrop-blur-sm border border-amber-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-amber-300/60"
                    onClick={() => { navigate("/org/petty-cash?tab=approvals"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-sm">
                        <CheckCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-amber-700 transition-colors">
                          Approvals
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          Review requests
                        </span>
                      </div>
                    </div>
                  </button>
                )}
                
                {hasPermission('view_department_reports') && (
                  <button 
                    className="group relative overflow-hidden bg-gradient-to-br from-orange-50/80 to-orange-100/60 hover:from-orange-100/90 hover:to-orange-200/80 backdrop-blur-sm border border-orange-200/40 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-orange-300/60"
                    onClick={() => { navigate("/org/reports"); setDrawerOpen(false); }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 shadow-sm">
                        <Coins className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-800 block group-hover:text-orange-700 transition-colors">
                          Reports
                        </span>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700 transition-colors">
                          View analytics
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;
