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

import MobileActionFab from "./MobileActionFab";
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
      <div className="min-h-screen bg-background flex w-full">
        {/* Fixed Sidebar */}
        <AppOrgSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:ml-0" />
                <img src="/images/Almaredpay_logo.png" alt="Almared Pay logo" className="h-6 w-auto" />
              </div>

              <div className="flex items-center gap-2">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        {user?.department && (
                          <p className="text-xs leading-none text-muted-foreground">{user.department}</p>
                        )}
                        <Badge variant={getRoleBadgeVariant(user?.role || "")} className="w-fit capitalize">
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
          <main className="flex-1 pb-16 md:pb-0">
            <div className="container py-4 sm:py-6 px-4">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile FAB */}
        <MobileActionFab />
      </div>
    </SidebarProvider>
  );
};

export default OrganizationLayout;
