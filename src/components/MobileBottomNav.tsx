
import { Link, useLocation } from "react-router-dom";
import { Home, CreditCard, Coins, Wallet, Menu, Settings, Users, UserCircle, LogOut } from "lucide-react";
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

const MobileBottomNav = () => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: CreditCard, label: "Payments", path: "/bulk-payments" },
    { icon: Coins, label: "Collections", path: "/collections" },
    { icon: Wallet, label: "Petty Cash", path: "/petty-cash" },
  ];

  const drawerItems = [
    { icon: Users, label: "Organizations", path: "/organizations" },
    { icon: UserCircle, label: "Sub-Admins", path: "/sub-admins" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate("/login");
    setDrawerOpen(false);
  };

  return (
    <>
      <nav className="mobile-nav">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="mobile-nav-item">
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs">More</span>
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6">
                <div className="space-y-2">
                  {drawerItems.map((item) => (
                    <DrawerClose key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </DrawerClose>
                  ))}
                  
                  <div className="border-t pt-2 mt-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-muted w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
