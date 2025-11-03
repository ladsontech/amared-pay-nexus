import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

// Layouts (lazy)
const SystemAdminLayout = lazy(() => import("./components/SystemAdminLayout"));
const OrganizationLayout = lazy(() => import("./components/OrganizationLayout"));

// Pages (lazy)
const Login = lazy(() => import("./pages/Login"));
// Removed: SystemAnalytics
const SystemOrganizations = lazy(() => import("./pages/SystemOrganizations"));
const SystemOrganizationView = lazy(() => import("./pages/SystemOrganizationView"));
const SystemUsers = lazy(() => import("./pages/SystemUsers"));
const SystemSubAdmins = lazy(() => import("./pages/SystemSubAdmins"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
// Removed: SystemAlerts
const OrgDashboard = lazy(() => import("./pages/OrgDashboard"));
const OrgPettyCash = lazy(() => import("./pages/OrgPettyCash"));
const OrgBulkPayments = lazy(() => import("./pages/OrgBulkPayments"));
const OrgCollections = lazy(() => import("./pages/OrgCollections"));
const OrgDeposits = lazy(() => import("./pages/OrgDeposits"));
const OrgApprovals = lazy(() => import("./pages/OrgApprovals"));
const OrgReports = lazy(() => import("./pages/OrgReports"));
const OrgPettyCashReport = lazy(() => import("./pages/OrgPettyCashReport"));
const OrgBulkPaymentsReport = lazy(() => import("./pages/OrgBulkPaymentsReport"));
const OrgCollectionsReport = lazy(() => import("./pages/OrgCollectionsReport"));
const OrgSettings = lazy(() => import("./pages/OrgSettings"));
const OrgAccount = lazy(() => import("./pages/OrgAccount"));
const OrgUsers = lazy(() => import("./pages/OrgUsers"));
const PayBills = lazy(() => import("./pages/PayBills"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Role Dashboard Aliases */}

        {/* System Admin Routes */}
        <Route path="/system" element={
          <ProtectedRoute fallbackRoute="/login">
            {(user?.role === 'admin' || user?.permissions?.includes('system_admin')) ? (
              <SystemAdminLayout />
            ) : (
              <Navigate to="/unauthorized" replace />
            )}
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/system/organizations" replace />} />
          <Route path="organizations" element={<SystemOrganizations />} />
          <Route path="organizations/:id" element={<SystemOrganizationView />} />
          <Route path="users" element={<SystemUsers />} />
          <Route path="sub-admins" element={<SystemSubAdmins />} />
          <Route path="account" element={<OrgAccount />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Organization Routes */}
        <Route path="/org" element={
          <ProtectedRoute fallbackRoute="/login">
            <OrganizationLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/org/dashboard" replace />} />
          <Route path="dashboard" element={<OrgDashboard />} />
          <Route path="petty-cash" element={
            <ProtectedRoute requiredPermissions={["access_petty_cash"]}>
              <OrgPettyCash />
            </ProtectedRoute>
          } />
          <Route path="bulk-payments" element={
            <ProtectedRoute requiredPermissions={["access_bulk_payments"]}>
              <OrgBulkPayments />
            </ProtectedRoute>
          } />
          <Route path="collections" element={
            <ProtectedRoute requiredPermissions={["access_collections"]}>
              <OrgCollections />
            </ProtectedRoute>
          } />
          <Route path="deposits" element={
            <ProtectedRoute requiredPermissions={["access_bank_deposits"]}>
              <OrgDeposits />
            </ProtectedRoute>
          } />
          <Route path="approvals" element={
            <ProtectedRoute requiredPermissions={["approve_transactions", "approve_funding", "approve_bulk_payments", "approve_bank_deposits"]}>
              <OrgApprovals />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute requiredPermissions={["view_department_reports", "view_own_history"]}>
              <OrgReports />
            </ProtectedRoute>
          } />
          <Route path="reports/petty-cash" element={
            <ProtectedRoute requiredPermissions={["view_department_reports", "view_own_history"]}>
              <OrgPettyCashReport />
            </ProtectedRoute>
          } />
          <Route path="reports/bulk-payments" element={
            <ProtectedRoute requiredPermissions={["view_department_reports", "view_own_history"]}>
              <OrgBulkPaymentsReport />
            </ProtectedRoute>
          } />
          <Route path="reports/collections" element={
            <ProtectedRoute requiredPermissions={["view_department_reports", "view_own_history"]}>
              <OrgCollectionsReport />
            </ProtectedRoute>
          } />
          <Route path="account" element={<OrgAccount />} />
          <Route path="settings" element={<OrgSettings />} />
          <Route path="users" element={
            <ProtectedRoute requiredPermissions={["manage_team"]}>
              <OrgUsers />
            </ProtectedRoute>
          } />
          <Route path="pay-bills" element={<PayBills />} />
        </Route>

        {/* Redirect authenticated users to appropriate dashboard */}
        <Route path="/dashboard" element={
          isAuthenticated ? (
            (user?.role === 'admin' || user?.permissions?.includes('system_admin')) ?
              <Navigate to="/system/organizations" replace /> :
              <Navigate to="/org/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Legacy routes - redirect to new structure */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin-organizations" element={<Navigate to="/system/organizations" replace />} />
        <Route path="/admin-system-users" element={<Navigate to="/system/users" replace />} />
        <Route path="/admin-analytics" element={<Navigate to="/system/analytics" replace />} />
        <Route path="/admin-system-alerts" element={<Navigate to="/system/alerts" replace />} />
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
        <PWAInstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;