import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Crown, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AppSystemSidebar from "./AppSystemSidebar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const SystemAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    if (isMobile) {
      setAccountMenuOpen(false);
    }
  };

  return (
    <SidebarProvider className="bg-white">
      {/* Sidebar - Hidden on mobile to prevent drawer */}
      <div className="hidden md:block">
        <AppSystemSidebar />
      </div>

      {/* Content - SidebarInset automatically handles spacing for sidebar */}
      <SidebarInset className="flex flex-col bg-white">
        {/* Header - Compact Mobile */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white backdrop-blur-xl supports-[backdrop-filter]:bg-white shadow-sm md:shadow-lg">
          <div className="w-full flex h-12 md:h-16 items-stretch justify-between px-3 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
              <img src="/Almapay_appbar_logo.png" alt="Alma Pay logo" className="h-full w-auto object-contain" />
              <div className="hidden sm:flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-blue-100 shadow-sm md:shadow-md">
                  <Crown className="h-3.5 w-3.5 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-bold text-sm md:text-xl text-blue-600">System Admin</span>
                  <p className="text-[9px] md:text-xs text-blue-600 font-medium">Platform Control</p>
                </div>
              </div>
            </div>

            {/* Right Side: Account Menu */}
            <div className="flex items-center gap-2">
              {/* Mobile Only: Account Menu Button */}
              {isMobile && (
                <>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:bg-secondary border-2 border-transparent hover:border-border transition-all duration-200"
                    onClick={() => setAccountMenuOpen(true)}
                  >
                    <Avatar className="h-10 w-10 shadow-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  <Sheet open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
                    <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
                      <SheetHeader className="pb-4 border-b">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-16 w-16 shadow-lg">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
                              {user?.name?.charAt(0)?.toUpperCase() || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <SheetTitle className="text-left text-lg font-bold">{user?.name || 'Admin'}</SheetTitle>
                            <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {/* Admin Badge */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            System Administrator
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Full platform access and control
                          </p>
                        </div>

                        {/* User Details */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Username</p>
                            <p className="text-sm font-medium">{user?.username || user?.name || 'N/A'}</p>
                          </div>
                          {user?.email && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Email</p>
                              <p className="text-sm font-medium">{user.email}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Role</p>
                            <Badge className="bg-blue-600 text-white font-bold shadow-sm">
                              <Crown className="h-3 w-3 mr-1" />
                              {user?.isSuperuser ? 'Super Admin' : 'Admin'}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-2 border-t">
                          <Button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              navigate('/system/account');
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Edit Account Details
                          </Button>
                          <Button
                            onClick={handleLogout}
                            variant="destructive"
                            className="w-full"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              )}

              {/* Desktop Only: Account Menu */}
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-secondary border-2 border-transparent hover:border-border transition-all duration-200">
                      <Avatar className="h-10 w-10 shadow-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-border shadow-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            System Administrator
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Full platform access and control
                          </p>
                        </div>
                        <p className="text-base font-bold leading-none text-foreground">{user?.name || 'Admin'}</p>
                        <p className="text-sm leading-none text-muted-foreground font-medium">{user?.email || 'No email'}</p>
                        {user?.username && <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>}
                        <Badge className="w-fit capitalize mt-1 font-bold shadow-sm bg-blue-600 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          {user?.isSuperuser ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/system/account')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Account Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 pb-16 md:pb-0 bg-white overflow-y-auto">
          <div className="container py-4 md:py-8 px-3 sm:px-4 md:px-6 max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </SidebarInset>

      {/* Mobile Bottom Navigation */}
      <AdminMobileBottomNav />
    </SidebarProvider>
  );
};

export default SystemAdminLayout;