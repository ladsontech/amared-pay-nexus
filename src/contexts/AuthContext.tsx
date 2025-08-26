import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission } from '@/types/auth';
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
    // Simulate loading user from localStorage or API
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
      
      // Convert LoginResponse to User type
      const user: User = {
        id: response.username || 'unknown',
        name: response.username || 'Unknown User',
        email: response.email,
        role: 'staff', // Default role, should come from API response
        organizationId: 'default-org',
        organization: {
          id: 'default-org',
          name: 'Default Organization',
          description: 'Default organization',
          industry: 'Finance'
        },
        permissions: ['access_petty_cash', 'access_bulk_payments', 'access_collections'],
        position: 'Staff Member'
      };
      
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
