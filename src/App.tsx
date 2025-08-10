
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SystemAdminLayout from "./components/SystemAdminLayout";
import OrganizationLayout from "./components/OrganizationLayout";
import { useAuth } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SystemAnalytics from "./pages/SystemAnalytics";
import SystemOrganizations from "./pages/SystemOrganizations";
import SystemUsers from "./pages/SystemUsers";
import SystemSettings from "./pages/SystemSettings";
import OrgDashboard from "./pages/OrgDashboard";
import OrgPettyCash from "./pages/OrgPettyCash";
import OrgBulkPayments from "./pages/OrgBulkPayments";
import OrgCollections from "./pages/OrgCollections";
import OrgDeposits from "./pages/OrgDeposits";
import OrgApprovals from "./pages/OrgApprovals";
import OrgReports from "./pages/OrgReports";
import OrgSettings from "./pages/OrgSettings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* System Admin Routes */}
      <Route path="/system" element={
        <ProtectedRoute requiredRole="admin">
          <SystemAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/system/analytics" replace />} />
        <Route path="analytics" element={<SystemAnalytics />} />
        <Route path="organizations" element={<SystemOrganizations />} />
        <Route path="users" element={<SystemUsers />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Organization Routes */}
      <Route path="/org" element={
        <ProtectedRoute requiredPermissions={['submit_transactions', 'approve_transactions']}>
          <OrganizationLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/org/dashboard" replace />} />
        <Route path="dashboard" element={<OrgDashboard />} />
        <Route path="petty-cash" element={
          <ProtectedRoute requiredPermissions={['access_petty_cash']}>
            <OrgPettyCash />
          </ProtectedRoute>
        } />
        <Route path="bulk-payments" element={
          <ProtectedRoute requiredPermissions={['access_bulk_payments']}>
            <OrgBulkPayments />
          </ProtectedRoute>
        } />
        <Route path="collections" element={
          <ProtectedRoute requiredPermissions={['access_collections']}>
            <OrgCollections />
          </ProtectedRoute>
        } />
        <Route path="deposits" element={
          <ProtectedRoute requiredPermissions={['access_bank_deposits']}>
            <OrgDeposits />
          </ProtectedRoute>
        } />
        <Route path="approvals" element={
          <ProtectedRoute requiredPermissions={['approve_transactions']}>
            <OrgApprovals />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute requiredPermissions={['view_department_reports']}>
            <OrgReports />
          </ProtectedRoute>
        } />
        <Route path="settings" element={<OrgSettings />} />
      </Route>

      {/* Redirect authenticated users to appropriate dashboard */}
      <Route path="/dashboard" element={
        isAuthenticated ? (
          user?.role === 'admin' ? 
            <Navigate to="/system/analytics" replace /> : 
            <Navigate to="/org/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Legacy routes - redirect to new structure */}
      <Route path="/admin-dashboard" element={<Navigate to="/system/analytics" replace />} />
      <Route path="/admin-organizations" element={<Navigate to="/system/organizations" replace />} />
      <Route path="/admin-system-users" element={<Navigate to="/system/users" replace />} />
      <Route path="/admin-analytics" element={<Navigate to="/system/analytics" replace />} />
      <Route path="/org-dashboard" element={<Navigate to="/org/dashboard" replace />} />
      <Route path="/bulk-payments" element={<Navigate to="/org/bulk-payments" replace />} />
      <Route path="/collections" element={<Navigate to="/org/collections" replace />} />
      <Route path="/petty-cash" element={<Navigate to="/org/petty-cash" replace />} />
      <Route path="/settings" element={<Navigate to="/org/settings" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
