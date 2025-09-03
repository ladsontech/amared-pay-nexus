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
import { Home, Wallet, Send, DollarSign, BarChart3, Settings, CheckCircle, Building, Users, Crown, User } from "lucide-react";
import NewActionButton from "./NewActionButton";
import { useIsMobile } from "@/hooks/use-mobile";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; permission?: Permission };

const orgItems: NavItem[] = [
  { title: "Dashboard", url: "/org/dashboard", icon: Home },
  { title: "Petty Cash", url: "/org/petty-cash", icon: Wallet },
  { title: "Bulk Payments", url: "/org/bulk-payments", icon: Send },
  { title: "Collections", url: "/org/collections", icon: DollarSign },
  { title: "Approvals", url: "/org/approvals", icon: CheckCircle },
  { title: "Reports", url: "/org/reports", icon: BarChart3 },
  { title: "Users", url: "/org/users", icon: Users },
  { title: "Settings", url: "/org/settings", icon: Settings },
];

export default function AppOrgSidebar() {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const items = orgItems;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="w-64 border-r border-blue-200/60 bg-gradient-to-b from-blue-50/80 to-white/95 backdrop-blur-sm" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-bold text-blue-800">Organization</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 pb-4">
              <NewActionButton />
            </div>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 data-[active=true]:border-r-3 data-[active=true]:border-blue-500 data-[active=true]:font-bold transition-all duration-200"
                  >
                    <NavLink to={item.url} end onClick={handleNavClick}>
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-semibold">{item.title}</span>
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
