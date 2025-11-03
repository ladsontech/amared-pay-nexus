
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

type NavItem = {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  show?: boolean;
};

interface MobileBottomNavProps {
  items?: NavItem[];
  extraActions?: React.ReactNode | ((closeDrawer: () => void) => React.ReactNode);
  onLogout?: () => Promise<void> | void;
}

const MobileBottomNav = ({ items, extraActions, onLogout }: MobileBottomNavProps) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // Calculate available nav items based on permissions
  const navItems: NavItem[] = items ?? [
    { 
      path: "/org/dashboard", 
      icon: Home, 
      label: "Home", 
      show: true 
    },
    { 
      path: "/org/petty-cash", 
      icon: Wallet, 
      label: "Cash", 
      show: true 
    },
    { 
      path: "/org/bulk-payments", 
      icon: Send, 
      label: "Bulk", 
      show: true 
    },
    { 
      path: "/org/collections", 
      icon: DollarSign, 
      label: "Collect", 
      show: true 
    },
    { 
      path: "/org/deposits", 
      icon: Building, 
      label: "Deposits", 
      show: true 
    }
  ];

  const visibleNavItems = navItems.filter(item => item.show !== false);
  const gridCols = Math.min(visibleNavItems.length + 1, 6); // +1 for More button, max 6 columns

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await authService.logout();
      }
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:hidden shadow-lg">
      <div className={`grid w-full px-2 py-2 overflow-hidden`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
        {/* Dynamic Navigation Items */}
        {visibleNavItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === item.path || location.pathname.includes(item.path.split('/').pop() || '') 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        {/* More Button */}
        <button 
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-primary"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>

      {/* Simplified Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
            
            {typeof extraActions === 'function' 
              ? extraActions(() => setDrawerOpen(false))
              : (extraActions ?? (
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="bg-secondary border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate("/org/approvals"); setDrawerOpen(false); }}
              >
                <CheckCircle className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Approvals</p>
                <p className="text-xs text-muted-foreground">Review requests</p>
              </button>
              
              <button 
                className="bg-secondary border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate("/org/reports"); setDrawerOpen(false); }}
              >
                <BarChart3 className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Reports</p>
                <p className="text-xs text-muted-foreground">View analytics</p>
              </button>
              
              <button 
                className="bg-secondary border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate("/org/users"); setDrawerOpen(false); }}
              >
                <Users className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Users</p>
                <p className="text-xs text-muted-foreground">Manage team</p>
              </button>
              
              <button 
                className="bg-secondary border border-border rounded-xl p-4 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate("/org/settings"); setDrawerOpen(false); }}
              >
                <UserCircle className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Settings</p>
                <p className="text-xs text-muted-foreground">Account settings</p>
              </button>
            </div>
            ))}
            
            <button 
              onClick={handleLogout}
              className="w-full bg-muted text-foreground rounded-xl p-3 text-center font-medium hover:bg-secondary transition-colors"
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
