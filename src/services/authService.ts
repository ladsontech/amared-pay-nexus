import { API_CONFIG } from './api-config';
import { apiClient } from './apiClient';
import { rolePermissions } from '@/types/auth';

export interface LoginRequest {
  username?: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  username?: string;
  email?: string;
  token?: string;
  access?: string;
  refresh?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
    organization?: {
      id: string;
      name: string;
    };
    permissions?: string[];
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenVerifyRequest {
  token: string;
}

class AuthService {
  private decodeJwt(token: string): any | null {
    try {
      const [, payload] = token.split('.');
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '='));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private encodeBase64(input: string) {
    try {
      return btoa(input);
    } catch {
      // Fallback for non-ASCII
      return btoa(unescape(encodeURIComponent(input)));
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const identity = credentials.username || credentials.email;
    
    // Construct payload including both username and email to satisfy backend schema
    const payload = {
      username: credentials.username || credentials.email || '',
      email: credentials.email || credentials.username || '',
      password: credentials.password
    };

    console.log('Login attempt:', { identity, payload: { ...payload, password: '***' } });

    try {
      const response = await apiClient.post<LoginResponse>(API_CONFIG.endpoints.auth.login, payload);
      
      // Handle successful login response
      const accessToken = response.access || response.token || "";
      const refreshToken = response.refresh || "";
      
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Build user profile from response
      let userProfile;
      if (response.user) {
        // Use user data from response
        const user = response.user;
        const role = user.role?.toLowerCase() || 'staff';
        const validRole = (['admin', 'manager', 'staff'] as const).includes(role as any) ? role : 'staff';
        
        userProfile = {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          role: validRole,
          organizationId: user.organization?.id || 'default-org',
          organization: {
            id: user.organization?.id || 'default-org',
            name: user.organization?.name || 'Organization',
            description: '',
            industry: ''
          },
          position: 'Member',
          permissions: Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : rolePermissions[validRole as keyof typeof rolePermissions]
        };
      } else {
        // Fallback: derive from token or use defaults
        const claims = accessToken ? this.decodeJwt(accessToken) : null;
        const derivedRole = (claims?.role?.toLowerCase?.()) || 'staff';
        const role = (['admin', 'manager', 'staff'] as const).includes(derivedRole) ? derivedRole : 'staff';

        userProfile = {
          id: response.email || identity,
          name: claims?.name || response.username || identity,
          email: claims?.email || response.email || credentials.email,
          role,
          organizationId: claims?.organizationId || 'default-org',
          organization: {
            id: claims?.organizationId || 'default-org',
            name: claims?.organizationName || 'Organization',
            description: '',
            industry: ''
          },
          position: claims?.position || 'Member',
          permissions: Array.isArray(claims?.permissions) && claims.permissions.length > 0
            ? claims.permissions
            : rolePermissions[role as keyof typeof rolePermissions]
        };
      }

      localStorage.setItem("user", JSON.stringify(userProfile));
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('Logout attempt...');
    
    try {
      await apiClient.post(API_CONFIG.endpoints.auth.logout);
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }

    // Always clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("basic_auth");
    localStorage.removeItem("user");
    
    console.log('Logout completed - local storage cleared');
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    console.log('Password change attempt...');
    
    try {
      const response = await apiClient.post(API_CONFIG.endpoints.auth.changePassword, passwordData);
      console.log('Password change success:', response);
      return { success: true, message: "Password changed successfully" };
    } catch (error: any) {
      console.error('Password change failed:', error);
      return { 
        success: false, 
        message: error.details?.message || error.message || "Password change failed" 
      };
    }
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refresh = localStorage.getItem("refresh_token") || "";
    const body: TokenRefreshRequest = { refresh };
    
    console.log('Token refresh attempt...');
    
    try {
      const data = await apiClient.post<{ access: string; refresh: string }>(
        API_CONFIG.endpoints.auth.refresh, 
        body
      );
      
      console.log('Token refresh success:', data);
      
      if (data?.access) {
        localStorage.setItem("auth_token", data.access);
        localStorage.setItem("access_token", data.access);
      }
      if (data?.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    const body: TokenVerifyRequest = { token };
    
    console.log('Token verify attempt...');
    
    try {
      await apiClient.post(API_CONFIG.endpoints.auth.verify, body);
      console.log('Token verify success');
      return true;
    } catch (error) {
      console.error('Token verify failed:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
    return Boolean(token);
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();