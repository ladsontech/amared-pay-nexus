import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission, rolePermissions } from '@/types/auth';
import { demoUsers } from '@/data/demoData';
import { authService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginAsUser: (userId: string) => void;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<{ access: string; refresh: string }>;
  verifyToken: (token: string) => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Ensure user has permissions array
        if (user && user.permissions && Array.isArray(user.permissions)) {
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          // Invalid user data, clear localStorage
          localStorage.removeItem('user');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        // Invalid JSON, clear localStorage
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const loginAsUser = (userId: string) => {
    const user = demoUsers.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // API returns user data in a nested 'user' object
      const apiData = (response as any).user || response;
      
      // Check if user is superuser (system admin)
      const isSuperuser = apiData.is_superuser === true;
      
      // Determine role based on is_superuser field and groups
      let userRole: import('@/types/auth').UserRole = 'staff';
      if (isSuperuser) {
        userRole = 'admin'; // System admin
      } else if (apiData.role === 'manager' || (apiData.groups && apiData.groups.includes('manager'))) {
        userRole = 'manager';
      } else {
        userRole = apiData.role || 'staff';
      }
      
      const organizationId = apiData.organizationId || apiData.organization_id || 'default-org';
      const organizationName = apiData.organization?.name || apiData.organization || 'Default Organization';

      // Split username into first and last name if no first_name/last_name provided
      const username = apiData.username || '';
      const nameParts = username.split('.');
      const firstName = apiData.first_name || nameParts[0] || username;
      const lastName = apiData.last_name || nameParts[1] || '';

      const user: User = {
        id: apiData.id || 'unknown',
        name: `${firstName} ${lastName}`.trim() || username || 'Unknown User',
        email: apiData.email || email,
        role: userRole,
        organizationId,
        organization: {
          id: organizationId,
          name: organizationName,
          description: organizationName,
          industry: 'Finance'
        },
        permissions: isSuperuser 
          ? ['system_admin', ...rolePermissions.admin] as Permission[] 
          : apiData.permissions && apiData.permissions.length > 0
            ? apiData.permissions
            : rolePermissions[userRole],
        position: isSuperuser ? 'System Administrator' : (apiData.role || 'Staff Member'),
        // Store additional user data
        firstName: firstName,
        lastName: lastName,
        phoneNumber: apiData.phone_number,
        avatar: apiData.avatar,
        isEmailVerified: apiData.is_email_verified,
        isPhoneVerified: apiData.is_phone_verified,
        isSuperuser: isSuperuser,
        isStaff: apiData.is_staff
      };
      
      console.log('User logged in:', { id: user.id, name: user.name, email: user.email, role: user.role });
      
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await authService.changePassword({ 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    return response;
  };

  const refreshToken = async () => {
    const tokens = await authService.refreshToken();
    return tokens;
  };

  const verifyToken = async (token: string) => {
    const isValid = await authService.verifyToken(token);
    return isValid;
  };

  const hasPermission = (permission: Permission): boolean => {
    return authState.user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const isRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginAsUser,
        logout,
        changePassword,
        refreshToken,
        verifyToken,
        hasPermission,
        hasAnyPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
