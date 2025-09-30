
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

// Layouts (lazy)
const SystemAdminLayout = lazy(() => import("./components/SystemAdminLayout"));
const OrganizationLayout = lazy(() => import("./components/OrganizationLayout"));

// Pages (lazy)
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SystemAnalytics = lazy(() => import("./pages/SystemAnalytics"));
const SystemOrganizations = lazy(() => import("./pages/SystemOrganizations"));
const SystemUsers = lazy(() => import("./pages/SystemUsers"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const OrgDashboard = lazy(() => import("./pages/OrgDashboard"));
const OrgPettyCash = lazy(() => import("./pages/OrgPettyCash"));
const OrgBulkPayments = lazy(() => import("./pages/OrgBulkPayments"));
const OrgCollections = lazy(() => import("./pages/OrgCollections"));
const OrgDeposits = lazy(() => import("./pages/OrgDeposits"));
const OrgApprovals = lazy(() => import("./pages/OrgApprovals"));
const OrgReports = lazy(() => import("./pages/OrgReports"));
const OrgSettings = lazy(() => import("./pages/OrgSettings"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestAuth = lazy(() => import("./pages/TestAuth"));
const AdminTest = lazy(() => import("./pages/AdminTest"));

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/test-auth" element={<TestAuth />} />
        <Route path="/admin-test" element={<AdminTest />} />

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
    </Suspense>
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
