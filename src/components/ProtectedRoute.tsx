import React from 'react';
import { Navigate } from 'react-router-dom';
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
  const { isAuthenticated, hasAnyPermission, isRole, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackRoute} replace />;
  }

  if (requiredRole && !isRole(requiredRole)) {
    console.log('Role check failed:', { userRole: user?.role, requiredRole });
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    console.log('Permission check failed:', { 
      userPermissions: user?.permissions, 
      requiredPermissions,
      hasAny: hasAnyPermission(requiredPermissions)
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};