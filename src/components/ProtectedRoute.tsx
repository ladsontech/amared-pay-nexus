import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: string;
  fallbackRoute?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackRoute = '/login',
}) => {
  const { loading, isAuthenticated, hasAnyPermission, isRole, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return <Navigate to={fallbackRoute} replace state={{ from: location }} />;
  }

  // Role check
  if (requiredRole && !isRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Prevent superusers from accessing org payments pages by default
  const isSuperUser = user?.role === 'admin' || user?.permissions?.includes('system_admin') || user?.is_superuser;
  const isPaymentsPage = requiredPermissions.some((p) => [
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections',
    'access_bank_deposits',
    'approve_transactions',
    'approve_funding',
    'approve_bulk_payments',
    'approve_bank_deposits',
  ].includes(p as any));

  if (isSuperUser && isPaymentsPage) {
    return <Navigate to="/system/organizations" replace />;
  }

  // Permission check (any of provided)
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};