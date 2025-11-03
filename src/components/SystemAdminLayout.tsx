import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Crown } from "lucide-react";
import AppSystemSidebar from "./AppSystemSidebar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";

const SystemAdminLayout = () => {

  return (
    <SidebarProvider className="bg-white">
      {/* Sidebar - positioned by Sidebar component (creates spacer automatically) */}
      <AppSystemSidebar />

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

            <div className="flex items-center gap-1 md:gap-2">
              <SidebarTrigger className="md:ml-0 h-8 w-8 md:h-10 md:w-10" />
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