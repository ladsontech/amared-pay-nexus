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
import { Building, LogOut } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppOrgSidebar from "./AppOrgSidebar";

const OrganizationLayout = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "manager":
        return "default" as const;
      case "staff":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex w-full">
        {/* Fixed Sidebar */}
        <AppOrgSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-sm">
            <div className="container flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <SidebarTrigger className="md:ml-0" />
                <img src="/images/Almaredpay_logo.png" alt="Almared Pay logo" className="h-12 w-auto object-contain" />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-100">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-slate-200" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-slate-900">{user?.name}</p>
                        <p className="text-xs leading-none text-slate-600">{user?.email}</p>
                        {user?.department && (
                          <p className="text-xs leading-none text-slate-500">{user.department}</p>
                        )}
                        <Badge variant={getRoleBadgeVariant(user?.role || "")} className="w-fit capitalize mt-1">
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

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0 bg-gradient-to-br from-slate-50/50 to-white/50">
            <div className="container py-6 sm:py-8 px-4 sm:px-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile FAB removed */}
      </div>
    </SidebarProvider>
  );
};

export default OrganizationLayout;
