import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { logout, user } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  
  const handleNavClick = (e: React.MouseEvent) => {
    // Close drawer immediately on mobile when clicking navigation
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
    <Sidebar className="w-64 border-r border-blue-200 bg-white md:w-64" collapsible="icon" side="left">
      <SidebarContent className="flex flex-col h-full">
        {/* Avatar at the top */}
        <SidebarGroup className="border-b border-gray-200 pb-4">
          <div className="flex flex-col items-center px-2 sm:px-4 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mb-2 sm:mb-3 border-2 border-blue-200">
              <AvatarImage src={user?.avatar} alt={user?.name || "Admin"} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg sm:text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-bold text-sm sm:text-base text-gray-900">{user?.name || "Admin"}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-full px-2">{user?.email || ""}</p>
            </div>
          </div>
        </SidebarGroup>

        {/* Navigation items in the middle */}
        <SidebarGroup className="flex-1 overflow-y-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className="hover:bg-blue-50 transition-all duration-200"
                    >
                      <NavLink 
                        to={item.url} 
                        end 
                        onClick={handleNavClick}
                      >
                        <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className={`font-semibold ${active ? 'text-blue-600' : 'text-gray-700'}`}>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout at the very bottom */}
        <SidebarGroup className="border-t border-gray-200 mt-auto">
          <SidebarGroupContent className="pb-2 sm:pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-bold transition-all duration-200 text-sm sm:text-base"
                >
                  <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
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
