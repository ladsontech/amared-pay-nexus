import React from "react";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, LogOut, Crown, User, CreditCard } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppOrgSidebar from "./AppOrgSidebar";
import MobileBottomNav from "./MobileBottomNav";
const OrganizationLayout = () => {
  const {
    user,
    logout
  } = useAuth();
  // Redirect system admins/superusers to the system dashboard
  if (user?.role === 'admin' || (user as any)?.is_superuser) {
    return <Navigate to="/system/organizations" replace />;
  }
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
  return <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 flex w-full">
        {/* Fixed Sidebar */}
        <AppOrgSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-blue-200/60 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-lg">
            <div className="container flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:ml-0" />
                <img src="/images/Almaredpay_logo.png" alt="Alma Pay logo" className="h-12 w-auto object-contain" />
                <div className="hidden sm:flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Organization</span>
                    <p className="text-xs text-blue-600 font-medium">Financial Management</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all duration-200">
                      <Avatar className="h-10 w-10 shadow-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-blue-200 shadow-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <p className="text-base font-bold leading-none text-slate-900">{user?.name || 'User'}</p>
                        <p className="text-sm leading-none text-slate-600 font-medium">{user?.email || 'No email'}</p>
                        {user?.department && <p className="text-sm leading-none text-slate-500 font-medium">{user.department}</p>}
                        {user?.position && <p className="text-xs leading-none text-slate-500">{user.position}</p>}
                        <Badge className={`w-fit capitalize mt-1 font-bold shadow-sm ${user?.role === 'manager' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'}`}>
                          {user?.role === 'manager' ? <Crown className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                          {user?.role || 'staff'}
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
          <main className="flex-1 pb-16 md:pb-0 bg-gradient-to-br from-blue-50/20 via-white to-slate-50/30">
            <div className="container py-8 px-[15px]">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>;
};
export default OrganizationLayout;