import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BarChart3, Building2, Users, Settings, Shield } from "lucide-react";

const adminItems = [
  { title: "Analytics", url: "/system/analytics", icon: BarChart3 },
  { title: "Organizations", url: "/system/organizations", icon: Building2 },
  { title: "Users", url: "/system/users", icon: Users },
  { title: "Settings", url: "/system/settings", icon: Settings },
];

export default function AppSystemSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="w-60 border-r border-slate-200/60 bg-white/95 backdrop-blur-sm" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2 px-1">
              <div className="p-1 rounded-md bg-red-100">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <span className="font-semibold text-slate-700">System Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="hover:bg-slate-100 data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:border-r-2 data-[active=true]:border-red-500"
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
