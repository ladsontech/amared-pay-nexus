import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    const mockUsers: Record<string, User> = {
      'admin@almaredpay.com': {
        id: '1',
        name: 'John Admin',
        email: 'admin@almaredpay.com',
        role: 'admin',
        permissions: ['system_admin', 'manage_organizations', 'manage_system_users', 'view_system_analytics'],
      },
      'manager@organization.com': {
        id: '2',
        name: 'Jane Manager',
        email: 'manager@organization.com',
        role: 'manager',
        organizationId: 'org-1',
        department: 'Finance',
        permissions: ['approve_transactions', 'approve_funding', 'view_department_reports', 'access_petty_cash'],
      },
      'staff@organization.com': {
        id: '3',
        name: 'Bob Staff',
        email: 'staff@organization.com',
        role: 'staff',
        organizationId: 'org-1',
        department: 'Operations',
        permissions: ['submit_transactions', 'request_funding', 'view_own_history', 'access_petty_cash'],
      },
    };

    const user = mockUsers[email];
    if (user && password === 'password') {
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const hasPermission = (permission: Permission): boolean => {
    return authState.user?.permissions.includes(permission) || false;
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
        logout,
        hasPermission,
        hasAnyPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};