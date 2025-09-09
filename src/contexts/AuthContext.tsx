import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission } from '@/types/auth';
import { demoUsers } from '@/data/demoData';
import { authService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (identity: string, password: string) => Promise<void>;
  loginAsUser: (userId: string) => void;
  logout: () => Promise<void>;
  changePassword: (current_password: string, new_password: string) => Promise<{ success: boolean; message: string }>;
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
  
  // Auto-logout timer (15 minutes)
  const timeoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (authState.isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, timeoutDuration);
    }
  };

  // Reset timer on user activity
  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const resetActivity = () => {
      if (authState.isAuthenticated) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, resetActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authState.isAuthenticated]);

  useEffect(() => {
    // Load user from localStorage or API
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Ensure user has permissions array
        if (user && user.permissions && Array.isArray(user.permissions) && token) {
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          // Invalid user data, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('access_token');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        // Invalid JSON, clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const loginAsUser = (userId: string) => {
    const user = demoUsers.find(u => u.id === userId);
    if (user) {
      // Store auth token for demo user
      localStorage.setItem('auth_token', `demo-token-${userId}`);
      localStorage.setItem('access_token', `demo-token-${userId}`);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
      resetTimer(); // Start auto-logout timer
    }
  };

  const login = async (identity: string, password: string) => {
    // Accept either email or username for login, send both fields to satisfy backend
    const isEmail = identity.includes('@');
    const loginResponse = await authService.login(
      isEmail
        ? { email: identity, username: identity.split('@')[0], password }
        : { username: identity, email: identity, password }
    );
    
    // Get the stored user profile
    const raw = localStorage.getItem('user');
    if (!raw) throw new Error('Login succeeded but user profile missing');
    const user: User = JSON.parse(raw);
    
    console.log('Setting auth state with user:', user);
    setAuthState({ user, isAuthenticated: true, loading: false });
    resetTimer(); // Start auto-logout timer
  };

  const logout = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    setAuthState({ user: null, isAuthenticated: false, loading: false });
  };

  const changePassword = (current_password: string, new_password: string) => {
    return authService.changePassword({ current_password, new_password });
  };

  const refreshToken = () => authService.refreshToken();

  const verifyToken = (token: string) => authService.verifyToken(token);

  const hasPermission = (permission: Permission): boolean => {
    // Temporarily allow all permissions
    return true;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    // Temporarily allow all permissions
    return true;
  };

  const isRole = (role: string): boolean => {
    // Temporarily allow all roles
    return true;
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