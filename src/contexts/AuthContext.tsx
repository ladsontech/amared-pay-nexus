import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission, rolePermissions } from '@/types/auth';
import { demoUsers } from '@/data/demoData';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
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

  const login = async (identity: string, password: string) => {
    try {
      const isEmail = identity.includes('@');
      const response = await authService.login({ 
        email: isEmail ? identity : '', 
        username: isEmail ? undefined : identity,
        password 
      });

      // Get base user from login response, then fetch full profile to get is_superuser/is_staff
      const baseUser = (response as any).user || {};
      let profile: any = baseUser;
      if (baseUser?.id) {
        try {
          profile = await userService.getUser(baseUser.id);
        } catch (e) {
          console.warn('Failed to fetch full user profile; using base user from login response', e);
        }
      }

      // Determine superuser/admin
      const isSuperuser = profile?.is_superuser === true;

      // For non-superusers, fetch their organization and staff details
      let organizationId = 'default-org';
      let organizationName = 'Default Organization';
      let staffRole: 'owner' | 'manager' | 'member' = 'member';
      
      if (!isSuperuser && baseUser?.id) {
        try {
          // Import organizationService dynamically to avoid circular dependency
          const { organizationService } = await import('@/services/organizationService');
          
          // Fetch staff list for this user
          const staffResponse = await organizationService.getStaffList({ user: baseUser.id });
          if (staffResponse.results && staffResponse.results.length > 0) {
            const staffRecord = staffResponse.results[0];
            organizationId = staffRecord.organization.id;
            organizationName = staffRecord.organization.name;
            staffRole = staffRecord.role || 'member';
          }
        } catch (e) {
          console.warn('Failed to fetch user organization data', e);
        }
      }

      // Determine role
      let userRole: import('@/types/auth').UserRole = 'staff';
      if (isSuperuser) {
        userRole = 'admin';
      } else if (staffRole === 'owner' || staffRole === 'manager') {
        userRole = staffRole;
      } else {
        userRole = 'staff';
      }

      // Names
      const username = profile?.username || baseUser?.username || '';
      const nameParts = username.split('.');
      const firstName = profile?.first_name || nameParts[0] || username || '';
      const lastName = profile?.last_name || nameParts[1] || '';

      const user: User = {
        id: profile?.id || baseUser?.id || 'unknown',
        name: `${firstName} ${lastName}`.trim() || username || 'Unknown User',
        email: profile?.email || baseUser?.email || (isEmail ? identity : ''),
        role: userRole,
        organizationId,
        organization: {
          id: organizationId,
          name: organizationName,
          description: organizationName,
          industry: 'Finance'
        },
        permissions: isSuperuser
          ? (['system_admin', ...rolePermissions.admin] as Permission[])
          : (staffRole === 'owner' 
            ? rolePermissions.manager 
            : rolePermissions[userRole]),
        position: isSuperuser ? 'System Administrator' : (staffRole || 'Staff Member'),
        firstName: firstName,
        lastName: lastName,
        phoneNumber: profile?.phone_number || baseUser?.phone_number,
        avatar: profile?.avatar || baseUser?.avatar,
        isEmailVerified: profile?.is_email_verified ?? baseUser?.is_email_verified,
        isPhoneVerified: profile?.is_phone_verified ?? baseUser?.is_phone_verified,
        isSuperuser: isSuperuser,
        isStaff: profile?.is_staff ?? baseUser?.is_staff,
      };

      console.log('User logged in:', { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isSuperuser,
        organizationId: user.organizationId,
        organizationName: user.organization.name
      });

      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
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
