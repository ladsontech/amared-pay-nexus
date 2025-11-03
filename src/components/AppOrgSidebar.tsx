import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/types/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Wallet, Send, DollarSign, BarChart3, Shield, CheckCircle, Building, Users, Crown, User, Settings, LogOut } from "lucide-react";
import NewActionButton from "./NewActionButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { 
  title: string; 
  url: string; 
  icon: React.ComponentType<{ className?: string }>; 
  permission?: Permission; // requires this single permission
  anyOf?: Permission[];    // requires any of these permissions
};

const orgItems: NavItem[] = [
  { title: "Dashboard", url: "/org/dashboard", icon: Home },
  { title: "Petty Cash", url: "/org/petty-cash", icon: Wallet, permission: "access_petty_cash" },
  { title: "Bulk Payments", url: "/org/bulk-payments", icon: Send, permission: "access_bulk_payments" },
  { title: "Collections", url: "/org/collections", icon: DollarSign, permission: "access_collections" },
  { title: "Deposits", url: "/org/deposits", icon: Building, permission: "access_bank_deposits" },
  { title: "Approvals", url: "/org/approvals", icon: CheckCircle, anyOf: [
      "approve_transactions", "approve_funding", "approve_bulk_payments", "approve_bank_deposits"
    ] },
  { title: "Reports", url: "/org/reports", icon: BarChart3, anyOf: ["view_department_reports", "view_own_history"] },
  { title: "Users", url: "/org/users", icon: Users, permission: "manage_team" },
  { title: "Account", url: "/org/account", icon: User },
  { title: "Settings", url: "/org/settings", icon: Settings },
];

export default function AppOrgSidebar() {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, hasPermission, hasAnyPermission, logout, isImpersonating, stopImpersonating } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const items = orgItems; // Always show all items; disable ones without permission

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    if (isImpersonating) {
      stopImpersonating();
      if (isMobile) {
        setOpenMobile(false);
      }
      window.location.href = '/system/organizations';
    } else {
      await logout();
      if (isMobile) {
        setOpenMobile(false);
      }
    }
  };

  return (
    <Sidebar className="w-64 border-r border-border bg-white backdrop-blur-sm" collapsible="icon" side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="p-2 rounded-xl bg-secondary shadow-md">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-foreground">Organization</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 pb-4">
              <NewActionButton />
            </div>
            <SidebarMenu>
              {items.map((item) => {
                const canAccess = item.permission
                  ? hasPermission(item.permission)
                  : item.anyOf && item.anyOf.length > 0
                    ? hasAnyPermission(item.anyOf)
                    : true;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      aria-disabled={!canAccess}
                      className="hover:bg-secondary data-[active=true]:bg-secondary data-[active=true]:text-primary data-[active=true]:border-r-3 data-[active=true]:border-primary data-[active=true]:font-bold transition-all duration-200"
                    >
                      <NavLink to={item.url} end onClick={handleNavClick}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <span className="font-semibold">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* User Account Section - Shows on mobile, hidden on desktop */}
      <SidebarFooter className="md:hidden border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-secondary">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10 shadow-md flex-shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm text-foreground truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-border shadow-xl" align="start" side="right" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2 p-2">
                {isImpersonating && (
                  <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs font-semibold text-orange-800 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Viewing as Organization Owner
                    </p>
                  </div>
                )}
                <p className="text-base font-bold leading-none text-foreground">{user?.name || 'User'}</p>
                <p className="text-sm leading-none text-muted-foreground font-medium">{user?.email || 'No email'}</p>
                {user?.department && <p className="text-sm leading-none text-muted-foreground font-medium">{user.department}</p>}
                {user?.position && <p className="text-xs leading-none text-muted-foreground">{user.position}</p>}
                <Badge className={`w-fit capitalize mt-1 font-bold shadow-sm ${user?.role === 'manager' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-primary text-primary-foreground'}`}>
                  {user?.role === 'manager' ? <Crown className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                  {user?.role || 'staff'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className={isImpersonating ? "text-orange-600 font-medium" : "text-red-600 font-medium"}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isImpersonating ? 'Return to Admin Dashboard' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
