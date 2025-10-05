import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Building2, Users, Settings, Crown } from "lucide-react";

const adminItems = [
  { title: "Organizations", url: "/system/organizations", icon: Building2 },
  { title: "Users", url: "/system/users", icon: Users },
  { title: "Sub-Admins", url: "/system/sub-admins", icon: Crown },
  { title: "Settings", url: "/system/settings", icon: Settings },
];

export default function AppSystemSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="w-64 border-r border-red-200/60 bg-gradient-to-b from-red-50/80 to-white/95 backdrop-blur-sm" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-md">
                <Crown className="h-4 w-4 text-red-600" />
              </div>
              <span className="font-bold text-red-800">System Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="hover:bg-red-50 data-[active=true]:bg-red-100 data-[active=true]:text-red-700 data-[active=true]:border-r-3 data-[active=true]:border-red-500 data-[active=true]:font-bold transition-all duration-200"
                  >
                    <NavLink to={item.url} end>
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
