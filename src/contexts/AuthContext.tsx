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
  forgotPasswordEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  resendEmailOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmailAddress: (email_code: string, email: string) => Promise<boolean>;
  resetPasswordWithEmailCode: (email_code: string, new_password: string) => Promise<{ success: boolean; message: string }>;
  forgotPasswordSms: (phone_number: string) => Promise<{ success: boolean; message: string }>;
  resendSmsOtp: (phone_number: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneNumber: (sms_code: string, phone_number: string) => Promise<boolean>;
  resetPasswordWithSmsCode: (sms_code: string, new_password: string) => Promise<{ success: boolean; message: string }>;
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
  
  // Auto-logout timer (configurable, default 15 minutes)
  const timeoutMinutes = Number((import.meta as any).env?.VITE_AUTH_IDLE_TIMEOUT_MINUTES ?? 15);
  const timeoutDuration = timeoutMinutes * 60 * 1000;
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // OTP email flows
  const forgotPasswordEmail = (email: string) => authService.sendForgotPasswordEmail(email);
  const resendEmailOtp = (email: string) => authService.resendEmailOtp(email);
  const verifyEmailAddress = async (email_code: string, email: string) => {
    const result = await authService.verifyEmailAddress({ email_code, email });
    if (result?.success) {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          const user = JSON.parse(raw);
          setAuthState({ user, isAuthenticated: true, loading: false });
          resetTimer();
        } catch {
          // ignore
        }
      }
    }
    return !!result?.success;
  };
  const resetPasswordWithEmailCode = (email_code: string, new_password: string) => authService.resetPasswordWithEmailCode({ email_code, new_password });

  // OTP sms flows
  const forgotPasswordSms = (phone_number: string) => authService.sendForgotPasswordSms(phone_number);
  const resendSmsOtp = (phone_number: string) => authService.resendSmsOtp(phone_number);
  const verifyPhoneNumber = async (sms_code: string, phone_number: string) => {
    const result = await authService.verifyPhoneNumber({ sms_code, phone_number });
    if (result?.success) {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          const user = JSON.parse(raw);
          setAuthState({ user, isAuthenticated: true, loading: false });
          resetTimer();
        } catch {
          // ignore
        }
      }
    }
    return !!result?.success;
  };
  const resetPasswordWithSmsCode = (sms_code: string, new_password: string) => authService.resetPasswordWithSmsCode({ sms_code, new_password });

  const hasPermission = (permission: Permission): boolean => {
    const currentUser = authState.user;
    if (!authState.isAuthenticated || !currentUser) return false;
    return Array.isArray(currentUser.permissions) && currentUser.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const currentUser = authState.user;
    if (!authState.isAuthenticated || !currentUser) return false;
    if (!Array.isArray(currentUser.permissions)) return false;
    return permissions.some(p => currentUser.permissions.includes(p));
  };

  const isRole = (role: string): boolean => {
    const currentUser = authState.user;
    if (!authState.isAuthenticated || !currentUser) return false;
    return currentUser.role === role;
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
        forgotPasswordEmail,
        resendEmailOtp,
        verifyEmailAddress,
        resetPasswordWithEmailCode,
        forgotPasswordSms,
        resendSmsOtp,
        verifyPhoneNumber,
        resetPasswordWithSmsCode,
        hasPermission,
        hasAnyPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};