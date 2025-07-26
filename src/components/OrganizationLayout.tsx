import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Send,
  Wallet,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  CheckCircle,
} from "lucide-react";

const OrganizationLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/org/dashboard", icon: Home, permission: null },
    { name: "Petty Cash", href: "/org/petty-cash", icon: Wallet, permission: "access_petty_cash" as const },
    { name: "Bulk Payments", href: "/org/bulk-payments", icon: Send, permission: "access_bulk_payments" as const },
    { name: "Collections", href: "/org/collections", icon: DollarSign, permission: "access_collections" as const },
    { name: "Approvals", href: "/org/approvals", icon: CheckCircle, permission: "approve_transactions" as const },
    { name: "Reports", href: "/org/reports", icon: BarChart3, permission: "view_department_reports" as const },
    { name: "Settings", href: "/org/settings", icon: Settings, permission: null },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'manager': return 'default';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Building className="h-6 w-6 text-primary mr-2" />
            <span className="hidden font-bold sm:inline-block">
              Organization Portal
            </span>
          </div>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center space-x-6">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              {hasPermission("access_bulk_payments") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/org/bulk-payments"}
                  className="hidden lg:flex items-center space-x-1"
                >
                  <Send className="h-4 w-4" />
                  <span>Bulk Payments</span>
                </Button>
              )}
              
              {hasPermission("access_collections") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/org/collections"}
                  className="hidden lg:flex items-center space-x-1"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Collections</span>
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {user?.department && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.department}
                      </p>
                    )}
                    <Badge variant={getRoleBadgeVariant(user?.role || '')} className="w-fit capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
            <div className="flex items-center h-14 px-4 border-b">
              <Building className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold">Organization</span>
            </div>
            <nav className="p-4 space-y-2">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizationLayout;