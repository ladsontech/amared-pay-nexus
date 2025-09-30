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
  const { loading, isAuthenticated, hasAnyPermission, isRole } = useAuth();
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

  // Permission check (any of provided)
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};