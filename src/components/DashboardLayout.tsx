import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, CreditCard, Users, Settings, Menu, X, LogOut, Bell, Search, UserCircle, Coins, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import MobileBottomNav from "./MobileBottomNav";
interface DashboardLayoutProps {
  children?: React.ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging you out, but you've been signed out locally.",
        variant: "destructive"
      });
      navigate("/login");
    }
  };
  const menuItems = [{
    icon: Home,
    label: "Dashboard",
    path: "/dashboard"
  }, {
    icon: CreditCard,
    label: "Bulk Payments",
    path: "/bulk-payments"
  }, {
    icon: Coins,
    label: "Collections",
    path: "/collections"
  }, {
    icon: Wallet,
    label: "Petty Cash",
    path: "/petty-cash"
  }, {
    icon: Users,
    label: "Organizations",
    path: "/organizations"
  }, {
    icon: UserCircle,
    label: "Sub-Admins",
    path: "/sub-admins"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const user = authService.getCurrentUser();
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed md:static top-0 left-0 right-0 z-50 bg-white border-b border-border px-2 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between shadow-sm">
        

        
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-24 lg:w-32 xl:w-48" />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium">{user?.name || "Demo User"}</p>
              <p className="text-xs text-muted-foreground">{user?.organization || "Demo Org"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="lg:hidden">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      
      <div className="flex pt-14 md:pt-0">
        {/* Sidebar */}
        

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-3 md:p-5 pb-20 md:pb-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>;
};
export default DashboardLayout;