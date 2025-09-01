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

  private getJsonHeaders() {
    return { "Content-Type": "application/json" } as Record<string, string>;
  }

  private getBasicHeaders() {
    const basic = localStorage.getItem("basic_auth");
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    if (basic) headers["Authorization"] = `Basic ${basic}`;
    return headers;
  }

  private getBasicHeadersFromCredentials(emailOrUsername: string, password: string) {
    const basic = this.encodeBase64(`${emailOrUsername}:${password}`);
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${basic}`
    } as Record<string, string>;
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

    // First attempt: without Authorization header (common case)
    const baseHeaders: Record<string, string> = { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    
    try {
      let response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      // If unauthorized/forbidden, retry with Basic Auth as per API docs
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.log('Retrying with Basic Auth...');
        const basicHeaders = this.getBasicHeadersFromCredentials(identity, credentials.password);
        response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
          method: "POST",
          headers: basicHeaders,
          body: JSON.stringify(payload),
          mode: 'cors'
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Login failed");
        console.error('Login error:', response.status, errorText);
        throw new Error(errorText || `Login failed (${response.status})`);
      }

      const data: LoginResponse = await response.json().catch(() => ({} as LoginResponse));

      // Persist tokens in a way that existing code expects
      const accessToken = data.access || data.token || "";
      const refreshToken = data.refresh || "";
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      // Persist Basic credential for subsequent Basic-protected endpoints in this API
      const basic = this.encodeBase64(`${identity}:${credentials.password}`);
      localStorage.setItem("basic_auth", basic);

      // Derive role from token if available; fallback to staff
      const claims = accessToken ? this.decodeJwt(accessToken) : null;
      const derivedRole = (claims?.role?.toLowerCase?.()) || 'staff';
      const role = (['admin', 'manager', 'staff'] as const).includes(derivedRole) ? derivedRole : 'staff';

      // Build user profile with permissions by role
      const userProfile = {
        id: data.email || identity,
        name: claims?.name || data.username || identity,
        email: claims?.email || data.email || credentials.email,
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
      } as any;
      localStorage.setItem("user", JSON.stringify(userProfile));

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('Logout attempt...');
    
    try {
      // Try GET logout
      const getResponse = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
        method: "GET",
        headers: {
          ...this.getBasicHeaders(),
          "Accept": "application/json"
        },
        mode: 'cors'
      });
      console.log('GET logout response:', getResponse.status);
    } catch (error) {
      console.error('GET logout failed:', error);
    }

    try {
      // Fallback POST logout
      const postResponse = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
        method: "POST",
        headers: {
          ...this.getBasicHeaders(),
          "Accept": "application/json"
        },
        mode: 'cors'
      });
      console.log('POST logout response:', postResponse.status);
    } catch (error) {
      console.error('POST logout failed:', error);
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
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.changePassword}`, {
        method: "POST",
        headers: {
          ...this.getBasicHeaders(),
          "Accept": "application/json"
        },
        body: JSON.stringify(passwordData),
        mode: 'cors'
      });
      
      console.log('Password change response:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Password change failed" }));
        console.error('Password change error:', errorData);
        return { success: false, message: (errorData as any).message || "Password change failed" };
      }
      
      const data = await response.json().catch(() => ({ success: true, message: "Password changed successfully" }));
      console.log('Password change success:', data);
      return { success: !!(data as any).success, message: (data as any).message || "Password changed successfully" };
    } catch (e) {
      console.error('Password change exception:', e);
      return { success: false, message: e instanceof Error ? e.message : "Password change failed" };
    }
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refresh = localStorage.getItem("refresh_token") || "";
    const body: TokenRefreshRequest = { refresh };
    
    console.log('Token refresh attempt...');
    
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`, {
      method: "POST",
      headers: {
        ...this.getBasicHeaders(),
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      mode: 'cors'
    });
    
    console.log('Token refresh response:', response.status);
    
    if (!response.ok) {
      const err = await response.text().catch(() => "Token refresh failed");
      console.error('Token refresh error:', err);
      throw new Error(err || `Token refresh failed (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Token refresh success:', data);
    
    if (data?.access) {
      localStorage.setItem("auth_token", data.access);
      localStorage.setItem("access_token", data.access);
    }
    if (data?.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }
    return data;
  }

  async verifyToken(token: string): Promise<boolean> {
    const body: TokenVerifyRequest = { token };
    
    console.log('Token verify attempt...');
    
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.verify}`, {
        method: "POST",
        headers: {
          ...this.getBasicHeaders(),
          "Accept": "application/json"
        },
        body: JSON.stringify(body),
        mode: 'cors'
      });
      
      console.log('Token verify response:', response.status);
      return response.ok;
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