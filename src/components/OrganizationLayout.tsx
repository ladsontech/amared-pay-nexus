import React, { useState, useEffect } from "react";
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
import OrganizationOnboarding from "./OrganizationOnboarding";
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";

const OrganizationLayout = () => {
  const {
    user,
    logout,
    isImpersonating,
    stopImpersonating,
    loading: authLoading
  } = useAuth();
  const { activeStaff, totalStaff, organization, loading: orgLoading } = useOrganization();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for impersonation
  useEffect(() => {
    if (isImpersonating) {
      console.log('OrganizationLayout - Impersonation mode:', {
        userId: user?.id,
        orgId: user?.organizationId,
        orgName: user?.organization?.name,
        hasOrg: !!organization,
      });
    }
  }, [isImpersonating, user, organization]);

  // Check if onboarding should be shown
  useEffect(() => {
    if (!user || !organization || orgLoading || isImpersonating) return;

    // Only show onboarding for organization owners
    if (user.role !== 'owner') {
      return;
    }

    // Check if onboarding was already completed
    const onboardingComplete = localStorage.getItem(`onboarding_complete_${user.organizationId}`);
    if (onboardingComplete === 'true') {
      return;
    }

    // Show onboarding if organization name is missing or very basic
    const orgName = organization.name?.trim() || user.organization?.name?.trim();
    const needsSetup = !orgName || 
                       orgName === 'Organization' || 
                       orgName.length < 3 ||
                       !organization.logo;

    if (needsSetup) {
      setShowOnboarding(true);
    }
  }, [user, organization, orgLoading, isImpersonating]);
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading state while checking user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Allow superusers to access organization dashboard - don't redirect them away
  // Only redirect non-superuser admins (if any exist)
  // Note: Superusers should be able to access both system and organization dashboards

  // When impersonating, ensure organizationId is set
  if (isImpersonating && !user.organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">Organization ID is missing during impersonation.</p>
          <Button onClick={stopImpersonating}>Return to Admin Dashboard</Button>
        </div>
      </div>
    );
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
  // Show onboarding if needed
  if (showOnboarding && user?.role === 'owner') {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <OrganizationOnboarding />
        </div>
      </SidebarProvider>
    );
  }

  // Show loading state if organization is still loading (but allow impersonation and superusers to proceed)
  // During impersonation or for superusers, we should proceed even if organization is loading to avoid blocking
  if (orgLoading && !isImpersonating && !organization && !user?.isSuperuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For superusers accessing org pages without impersonation, give them a default organization context
  if (user?.isSuperuser && !isImpersonating && !user.organizationId) {
    // Superusers can view but won't have organization-specific data
    // This is fine - they can still navigate and use the interface
  }

  // Get organization name from user object if organization data is still loading
  // During impersonation, always use user.organization data since API fetch might fail
  const orgName = (isImpersonating ? user?.organization?.name : organization?.name) || user?.organization?.name || 'Organization';
  const orgLogo = (isImpersonating ? user?.organization?.logo : organization?.logo) || user?.organization?.logo;

  return <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
        {/* Fixed Sidebar */}
        <AppOrgSidebar />

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Fixed during navigation, doesn't stretch */}
          <header className="fixed top-0 left-0 md:left-64 right-0 z-50 border-b border-gray-200 bg-white backdrop-blur-xl supports-[backdrop-filter]:bg-white shadow-sm transition-[left] duration-200">
            <div className="w-full flex h-12 md:h-16 items-center justify-between px-3 md:px-6 overflow-hidden">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Desktop Only: Sidebar Trigger */}
                <SidebarTrigger className="hidden md:flex md:ml-0 h-8 w-8 md:h-10 md:w-10" />
                {/* Organization Logo and Name */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={getOrganizationLogoUrl(user?.organization as OrgType)} 
                      alt={orgName} 
                      className="h-8 w-8 md:h-12 md:w-12 rounded-lg object-cover border-2 border-blue-200"
                      onError={(e) => {
                        // If image fails to load, use default avatar
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getOrganizationLogoUrl(user?.organization as OrgType);
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm md:text-lg text-foreground truncate">{orgName}</h2>
                    <p className="hidden md:block text-xs text-muted-foreground">Financial Management</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Mobile Drawer Icon on Right, Desktop Controls */}
              <div className="flex items-center gap-2">
                {/* Mobile Only: Sidebar Trigger on Right */}
                <SidebarTrigger className="md:hidden h-8 w-8" />
                
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
                    Admin Viewing as Owner
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
                              Super Admin - Full Access Mode
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              You have complete access to all organization features
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
            </div>
          </header>

          {/* Main Content - Add padding top to account for fixed header */}
          <main className="flex-1 pt-12 md:pt-16 pb-16 md:pb-0 bg-background min-w-0">
            <div className="container py-4 md:py-8 px-3 sm:px-4 md:px-6 max-w-full">
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