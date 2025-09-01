
import { Link, useLocation } from "react-router-dom";
import { Home, CreditCard, Coins, Wallet, Menu, Settings, Users, UserCircle, LogOut, Send, DollarSign, Plus, CheckCircle, BarChart3, Building } from "lucide-react";
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="grid grid-cols-5 px-2 py-2">
        {/* Home */}
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            location.pathname === "/dashboard" 
              ? "text-blue-600" 
              : "text-gray-600"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Petty Cash */}
        {hasPermission('access_petty_cash') && (
          <Link 
            to="/org/petty-cash" 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname.includes("/petty-cash") 
                ? "text-blue-600" 
                : "text-gray-600"
            }`}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-medium">Cash</span>
          </Link>
        )}

        {/* Bulk Payments */}
        {hasPermission('access_bulk_payments') && (
          <Link 
            to="/org/bulk-payments" 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname.includes("/bulk-payments") 
                ? "text-blue-600" 
                : "text-gray-600"
            }`}
          >
            <Send className="h-5 w-5" />
            <span className="text-xs font-medium">Bulk</span>
          </Link>
        )}

        {/* Collections */}
        {hasPermission('access_collections') && (
          <Link 
            to="/org/collections" 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname.includes("/collections") 
                ? "text-blue-600" 
                : "text-gray-600"
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs font-medium">Collect</span>
          </Link>
        )}

        {/* More */}
        <button 
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>

      {/* Simplified Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-black">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {hasPermission('approve_transactions') && (
                <button 
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left"
                  onClick={() => { navigate("/org/approvals"); setDrawerOpen(false); }}
                >
                  <CheckCircle className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-black">Approvals</p>
                  <p className="text-xs text-gray-500">Review requests</p>
                </button>
              )}
              
              {hasPermission('view_department_reports') && (
                <button 
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left"
                  onClick={() => { navigate("/org/reports"); setDrawerOpen(false); }}
                >
                  <BarChart3 className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-black">Reports</p>
                  <p className="text-xs text-gray-500">View analytics</p>
                </button>
              )}
              
              {hasPermission('manage_team') && (
                <button 
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left"
                  onClick={() => { navigate("/org/users"); setDrawerOpen(false); }}
                >
                  <Users className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-black">Users</p>
                  <p className="text-xs text-gray-500">Manage team</p>
                </button>
              )}
              
              <button 
                className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left"
                onClick={() => { navigate("/org/settings"); setDrawerOpen(false); }}
              >
                <UserCircle className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-black">Settings</p>
                <p className="text-xs text-gray-500">Account settings</p>
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-100 text-black rounded-xl p-3 text-center font-medium"
            >
              <LogOut className="h-4 w-4 mx-auto mb-1" />
              Logout
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default MobileBottomNav;
