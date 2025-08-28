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
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (basic) headers["Authorization"] = `Basic ${basic}`;
    return headers;
  }

  private getBasicHeadersFromCredentials(emailOrUsername: string, password: string) {
    const basic = this.encodeBase64(`${emailOrUsername}:${password}`);
    return {
      "Content-Type": "application/json",
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

    // First attempt: without Authorization header (common case)
    const baseHeaders: Record<string, string> = { "Content-Type": "application/json" };
    let response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(payload)
    });

    // If unauthorized/forbidden, retry with Basic Auth as per API docs
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      const basicHeaders = this.getBasicHeadersFromCredentials(identity, credentials.password);
      response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
        method: "POST",
        headers: basicHeaders,
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Login failed");
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
  }

  async logout(): Promise<void> {
    try {
      // Try GET logout
      await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
        method: "GET",
        headers: this.getBasicHeaders()
      });
    } catch { /* ignore */ }

    try {
      // Fallback POST logout
      await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.logout}`, {
        method: "POST",
        headers: this.getBasicHeaders()
      });
    } catch { /* ignore */ }

    // Always clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("basic_auth");
    localStorage.removeItem("user");
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.changePassword}`, {
        method: "POST",
        headers: this.getBasicHeaders(),
        body: JSON.stringify(passwordData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Password change failed" }));
        return { success: false, message: (errorData as any).message || "Password change failed" };
      }
      const data = await response.json().catch(() => ({ success: true, message: "Password changed successfully" }));
      return { success: !!(data as any).success, message: (data as any).message || "Password changed successfully" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : "Password change failed" };
    }
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    const refresh = localStorage.getItem("refresh_token") || "";
    const body: TokenRefreshRequest = { refresh };
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const err = await response.text().catch(() => "Token refresh failed");
      throw new Error(err || `Token refresh failed (${response.status})`);
    }
    const data = await response.json();
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
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.verify}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
      body: JSON.stringify(body)
    });
    return response.ok;
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
