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
    
    // Construct payload with proper field mapping
    const payload = {
      username: identity,
      email: credentials.email,
      password: credentials.password
    };

    console.log('Login attempt:', { identity, payload: { ...payload, password: '***' } });

    try {
      // Make login request without existing auth headers
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'AlmaPay-Web/1.0'
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        throw new Error(`Authentication failed (${response.status})`);
      }

      const loginResponse: LoginResponse = await response.json();
      
      // Handle successful login response
      const accessToken = loginResponse.access || loginResponse.token || "";
      const refreshToken = loginResponse.refresh || "";
      
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Fetch complete user details from API
      await this.fetchAndStoreUserProfile(accessToken);
      
      return loginResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  private async fetchAndStoreUserProfile(token: string): Promise<void> {
    try {
      // Decode token to get user ID
      const claims = this.decodeJwt(token);
      const userId = claims?.user_id || claims?.sub || claims?.id;
      
      if (!userId) {
        throw new Error('No user ID found in token');
      }

      // Fetch complete user details
      const userResponse = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.user.detail(userId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user details: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      
      // Determine role based on user data
      let role: 'admin' | 'manager' | 'staff' = 'staff';
      if (userData.is_superuser || userData.is_staff) {
        role = 'admin';
      } else if (userData.permissions && userData.permissions.includes('manage_team')) {
        role = 'manager';
      }

      // Build complete user profile
      const userProfile = {
        id: userData.id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
        email: userData.email,
        role,
        organizationId: 'default-org', // Will be updated when we fetch organization data
        organization: {
          id: 'default-org',
          name: 'Organization',
          description: '',
          industry: ''
        },
        position: userData.is_superuser ? 'System Administrator' : 'Member',
        department: userData.is_superuser ? 'System' : undefined,
        avatar: userData.avatar,
        permissions: this.parsePermissions(userData.permissions, role)
      };

      localStorage.setItem("user", JSON.stringify(userProfile));
      console.log('User profile stored:', userProfile);
      
    } catch (error) {
      console.error('Failed to fetch user profile, using fallback:', error);
      
      // Fallback user profile
      const fallbackProfile = {
        id: 'fallback-user',
        name: 'User',
        email: 'user@example.com',
        role: 'staff' as const,
        organizationId: 'default-org',
        organization: {
          id: 'default-org',
          name: 'Organization',
          description: '',
          industry: ''
        },
        position: 'Member',
        permissions: rolePermissions.staff
      };
      
      localStorage.setItem("user", JSON.stringify(fallbackProfile));
    }
  }

  private parsePermissions(permissionsString: string, role: 'admin' | 'manager' | 'staff'): Permission[] {
    try {
      // If permissions is a string, try to parse it
      if (typeof permissionsString === 'string' && permissionsString.length > 0) {
        // Handle comma-separated permissions
        if (permissionsString.includes(',')) {
          return permissionsString.split(',').map(p => p.trim()) as Permission[];
        }
        // Handle JSON array string
        if (permissionsString.startsWith('[')) {
          return JSON.parse(permissionsString) as Permission[];
        }
      }
    } catch (error) {
      console.warn('Failed to parse permissions string:', error);
    }
    
    // Fallback to role-based permissions
    return rolePermissions[role];
  }
  async logout(): Promise<void> {
    console.log('Logout attempt...');
    
    // Only make API call if user is actually authenticated
    const token = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
    if (token) {
      try {
        await apiClient.post(API_CONFIG.endpoints.auth.logout);
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local cleanup even if API call fails
      }
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