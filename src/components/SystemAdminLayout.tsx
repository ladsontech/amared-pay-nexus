import React from "react";
import { Outlet } from "react-router-dom";
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
import { Shield, LogOut, Crown } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSystemSidebar from "./AppSystemSidebar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";

const SystemAdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        {/* Fixed Sidebar */}
        <AppSystemSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Compact Mobile */}
          <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white backdrop-blur-xl supports-[backdrop-filter]:bg-white shadow-sm md:shadow-lg">
            <div className="container flex h-12 md:h-16 items-center justify-between px-3 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="md:ml-0 h-8 w-8 md:h-10 md:w-10" />
                <img src="/images/Almaredpay_logo.png" alt="Alma Pay logo" className="h-8 md:h-12 w-auto object-contain" />
                <div className="hidden sm:flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-sm md:shadow-md">
                    <Crown className="h-3.5 w-3.5 md:h-5 md:w-5 text-red-600" />
                  </div>
                  <div>
                    <span className="font-bold text-sm md:text-xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">System Admin</span>
                    <p className="text-[9px] md:text-xs text-red-600 font-medium">Platform Control</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all duration-200">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 shadow-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-sm md:text-lg">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 md:w-64 bg-white/95 backdrop-blur-sm border-red-200 shadow-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <p className="text-base font-bold leading-none text-slate-900">{user?.name || 'Admin User'}</p>
                        <p className="text-sm leading-none text-slate-600 font-medium">{user?.email || 'admin@example.com'}</p>
                        {user?.position && (
                          <p className="text-xs leading-none text-slate-500">{user.position}</p>
                        )}
                        <Badge className="w-fit bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-md">
                          <Crown className="h-3 w-3 mr-1" />
                          System Admin
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 font-medium">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0 bg-gradient-to-br from-red-50/20 via-white to-slate-50/30">
            <div className="container py-4 md:py-8 px-3 sm:px-4 md:px-6 max-w-full overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <AdminMobileBottomNav />
      </div>
    </SidebarProvider>
  );
};

export default SystemAdminLayout;