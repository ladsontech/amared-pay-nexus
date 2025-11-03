import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Building2, Users, Settings, Crown, User, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const adminItems = [
  { title: "Organizations", url: "/system/organizations", icon: Building2 },
  { title: "Users", url: "/system/users", icon: Users },
  { title: "Sub-Admins", url: "/system/sub-admins", icon: Crown },
  { title: "Account", url: "/system/account", icon: User },
  { title: "Settings", url: "/system/settings", icon: Settings },
];

export default function AppSystemSidebar() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="w-64 border-l border-blue-200 bg-white" collapsible="icon" side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="p-2 rounded-xl bg-blue-100 shadow-md">
                <Crown className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-bold text-blue-600">System Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="hover:bg-blue-50 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600 data-[active=true]:border-l-4 data-[active=true]:border-blue-600 data-[active=true]:font-bold transition-all duration-200"
                  >
                    <NavLink to={item.url} end onClick={handleNavClick}>
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-semibold">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-blue-50 text-blue-600 font-bold transition-all duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span className="font-semibold">Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
