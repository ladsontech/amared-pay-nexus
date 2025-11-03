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
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Wallet, Send, DollarSign, BarChart3, Shield, CheckCircle, Building, Users, Crown, User, Settings } from "lucide-react";
import NewActionButton from "./NewActionButton";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { hasPermission, hasAnyPermission } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const items = orgItems; // Always show all items; disable ones without permission

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="w-64 border-r border-border bg-white backdrop-blur-sm" collapsible="icon">
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
    </Sidebar>
  );
}
