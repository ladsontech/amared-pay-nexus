import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Organization as OrgType } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, LogOut, Crown, User, CreditCard, Shield, Users } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppOrgSidebar from "./AppOrgSidebar";
import MobileBottomNav from "./MobileBottomNav";
const OrganizationLayout = () => {
  const {
    user,
    logout,
    isImpersonating,
    stopImpersonating
  } = useAuth();
  const { activeStaff, totalStaff } = useOrganization();
  
  // Redirect system admins to the system dashboard (unless impersonating)
  if (user?.role === 'admin' && !isImpersonating) {
    return <Navigate to="/system/organizations" replace />;
  }

  const handleLogout = async () => {
    if (isImpersonating) {
      stopImpersonating();
      // Navigate to admin dashboard after stopping impersonation
      window.location.href = '/system/organizations';
    } else {
      await logout();
    }
  };
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
                {/* Organization Logo */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={(user?.organization as OrgType)?.logo || "/images/default-logo.png"} 
                      alt={user?.organization?.name || 'Organization logo'} 
                      className="h-12 w-12 rounded-lg object-cover border-2 border-blue-200"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-logo.png';
                      }}
                    />
                  </div>
                  <div className="hidden sm:block">
                    <h2 className="font-bold text-lg text-slate-900">{user?.organization?.name || 'Organization'}</h2>
                    <p className="text-xs text-slate-600">Financial Management</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Active Users Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div className="text-xs">
                    <span className="font-semibold text-blue-900">{activeStaff}</span>
                    <span className="text-blue-600 ml-1">active staff</span>
                  </div>
                </div>
                
                {isImpersonating && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Impersonating
                  </Badge>
                )}
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
                        {isImpersonating && (
                          <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-xs font-semibold text-orange-800 flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Viewing as Organization Owner
                            </p>
                          </div>
                        )}
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
                    {isImpersonating && (
                      <DropdownMenuItem onClick={handleLogout} className="text-orange-600 font-medium">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Return to Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {!isImpersonating && (
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    )}
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