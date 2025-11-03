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
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";
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
      <div className="min-h-screen bg-background flex w-full">
        {/* Fixed Sidebar */}
        <AppOrgSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - Fixed during navigation */}
          <header className="fixed top-0 left-0 md:left-0 right-0 z-50 border-b border-blue-200/50 bg-blue-50/95 backdrop-blur-xl supports-[backdrop-filter]:bg-blue-50/95 shadow-sm transition-[left] duration-200 will-change-[left]">
            <div className="container flex h-12 md:h-16 items-center justify-between px-3 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="md:ml-0 h-8 w-8 md:h-10 md:w-10" />
                {/* Organization Logo and Name */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={getOrganizationLogoUrl(user?.organization as OrgType)} 
                      alt={user?.organization?.name || 'Organization logo'} 
                      className="h-8 w-8 md:h-12 md:w-12 rounded-lg object-cover border-2 border-blue-200"
                      onError={(e) => {
                        // If image fails to load, use default avatar
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getOrganizationLogoUrl(user?.organization as OrgType);
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm md:text-lg text-foreground truncate">{user?.organization?.name || 'Organization'}</h2>
                    <p className="hidden md:block text-xs text-muted-foreground">Financial Management</p>
                  </div>
                </div>
              </div>

              {/* Desktop Only: Active Users, Impersonating Badge, and Account Menu */}
              <div className="hidden md:flex items-center gap-2">
                {/* Active Users Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">{activeStaff}</span>
                    <span className="text-muted-foreground ml-1">active staff</span>
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
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-secondary border-2 border-transparent hover:border-border transition-all duration-200">
                      <Avatar className="h-10 w-10 shadow-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-border shadow-xl" align="end" forceMount>
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
                        <p className="text-base font-bold leading-none text-foreground">{user?.name || 'User'}</p>
                        <p className="text-sm leading-none text-muted-foreground font-medium">{user?.email || 'No email'}</p>
                        {user?.department && <p className="text-sm leading-none text-muted-foreground font-medium">{user.department}</p>}
                        {user?.position && <p className="text-xs leading-none text-muted-foreground">{user.position}</p>}
                        <Badge className={`w-fit capitalize mt-1 font-bold shadow-sm ${user?.role === 'manager' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-primary text-primary-foreground'}`}>
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

          {/* Main Content - Add padding top to account for fixed header */}
          <main className="flex-1 pt-12 md:pt-16 pb-16 md:pb-0 bg-background">
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