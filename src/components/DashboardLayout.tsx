import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, CreditCard, Users, Settings, Menu, X, LogOut, Bell, Search, UserCircle, Coins, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate("/login");
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Link to="/dashboard" className="flex items-center flex-1 justify-center lg:justify-start">
            <img src="/public/images/Almaredpay_logo.png" alt="Logo" className="h-8 w-auto max-w-[200px] sm:h-10 sm:max-w-[250px] md:h-12 md:max-w-[300px] lg:h-14 lg:max-w-[350px] xl:h-16 xl:max-w-[400px] object-fill" />
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
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium">{user.name || "Demo User"}</p>
              <p className="text-xs text-muted-foreground">{user.organization || "Demo Org"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transition-transform duration-300 ease-in-out lg:transition-none shadow-lg lg:shadow-none`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 py-6">
              <nav className="space-y-2 px-4">
                {menuItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${location.pathname === item.path ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>)}
              </nav>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>;
};
export default DashboardLayout;