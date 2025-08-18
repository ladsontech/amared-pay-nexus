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
} from "@/components/ui/sidebar";
import { Home, Wallet, Send, DollarSign, BarChart3, Settings, CheckCircle, Building } from "lucide-react";
import NewActionButton from "./NewActionButton";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; permission?: Permission };

const orgItems: NavItem[] = [
  { title: "Dashboard", url: "/org/dashboard", icon: Home },
  { title: "Petty Cash", url: "/org/petty-cash", icon: Wallet, permission: "access_petty_cash" },
  { title: "Bulk Payments", url: "/org/bulk-payments", icon: Send, permission: "access_bulk_payments" },
  { title: "Collections", url: "/org/collections", icon: DollarSign, permission: "access_collections" },
  { title: "Approvals", url: "/org/approvals", icon: CheckCircle, permission: "approve_transactions" },
  { title: "Reports", url: "/org/reports", icon: BarChart3, permission: "view_department_reports" },
  { title: "Settings", url: "/org/settings", icon: Settings },
];

export default function AppOrgSidebar() {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const items = orgItems.filter((i) => !i.permission || hasPermission(i.permission));

  return (
    <Sidebar className="w-60 border-r border-slate-200/60 bg-white/95 backdrop-blur-sm" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2 px-1">
              <div className="p-1 rounded-md bg-blue-100">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-700">Organization</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 pb-3">
              <NewActionButton />
            </div>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="hover:bg-slate-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-500"
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="mr-3 h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
