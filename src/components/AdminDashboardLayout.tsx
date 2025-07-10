
import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Building, Users, Settings, Menu, X, LogOut, Bell, Search, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging you out, but you've been signed out locally.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const adminMenuItems = [
    { icon: Home, label: "Admin Dashboard", path: "/admin-dashboard" },
    { icon: Building, label: "Organizations", path: "/organizations" },
    { icon: Users, label: "System Users", path: "/system-users" },
    { icon: TrendingUp, label: "Analytics", path: "/analytics" },
    { icon: AlertTriangle, label: "System Alerts", path: "/system-alerts" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed md:static top-0 left-0 right-0 z-50 bg-white border-b border-border px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Link to="/admin-dashboard" className="flex items-center justify-start">
            <img 
              src="/images/Almaredpay_logo.png" 
              alt="Logo" 
              className="h-8 sm:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

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
            <div className="flex items-center space-x-2 bg-primary/5 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Admin</span>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium">{user?.name || "Admin User"}</p>
              <p className="text-xs text-muted-foreground">System Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 md:pt-0">
        {/* Admin Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transition-transform duration-300 ease-in-out lg:transition-none shadow-lg lg:shadow-none`}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="flex-1 py-6">
              <nav className="space-y-2 px-4">
                {adminMenuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="hidden lg:block p-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start space-x-3 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
