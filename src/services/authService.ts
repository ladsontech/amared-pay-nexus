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
    // Construct payload according to API documentation
    const payload = {
      username: credentials.username || credentials.email.split('@')[0],
      email: credentials.email,
      password: credentials.password
    };

    console.log('Login attempt:', { payload: { ...payload, password: '***' } });

    try {
      const loginResponse = await apiClient.post<LoginResponse>(API_CONFIG.endpoints.auth.login, payload);
      
      console.log('Login response:', loginResponse);
      
      // The API returns user data directly in login response
      const accessToken = loginResponse.access || loginResponse.token;
      const refreshToken = loginResponse.refresh;
      
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Store user profile from login response
      if (loginResponse.user) {
        await this.storeUserProfile(loginResponse.user, accessToken);
      } else {
        // Fallback: fetch user details using token
        await this.fetchAndStoreUserProfile(accessToken);
      }
      
      return loginResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  private async storeUserProfile(userData: any, token: string): Promise<void> {
    try {
      // Determine role based on user flags and permissions
      let role: 'admin' | 'manager' | 'staff' = 'staff';
      if (userData.is_superuser || userData.is_staff) {
        role = 'admin';
      } else if (userData.permissions && (
        userData.permissions.includes('manage_team') || 
        userData.permissions.includes('approve_transactions') ||
        typeof userData.permissions === 'string' && userData.permissions.includes('manage_team')
      )) {
        role = 'manager';
      }

      // Get organization info if available
      let organizationInfo = {
        id: 'default-org',
        name: 'Organization',
        description: '',
        industry: ''
      };
      
      if (userData.organization) {
        organizationInfo = {
          id: userData.organization.id || 'default-org',
          name: userData.organization.name || 'Organization',
          description: userData.organization.description || '',
          industry: userData.organization.industry || ''
        };
      }

      // Build complete user profile
      const userProfile = {
        id: userData.id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'User',
        email: userData.email,
        role,
        organizationId: organizationInfo.id,
        organization: organizationInfo,
        position: userData.is_superuser ? 'System Administrator' : (userData.position || 'Member'),
        department: userData.is_superuser ? 'System' : (userData.department || undefined),
        avatar: userData.avatar,
        permissions: this.parsePermissions(userData.permissions, role)
      };

      localStorage.setItem("user", JSON.stringify(userProfile));
      console.log('User profile stored:', userProfile);
      
    } catch (error) {
      console.error('Failed to store user profile:', error);
      throw error;
    }
  }

  private hasManagerPermissions(permissions: any): boolean {
    const permissionList = this.parsePermissions(permissions, 'staff');
    const managerPerms = ['approve_transactions', 'manage_team', 'view_department_reports'];
    return managerPerms.some(perm => permissionList.includes(perm as any));
  }

  private getPositionByRole(role: 'admin' | 'manager' | 'staff'): string {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'manager': return 'Department Manager';
      case 'staff': return 'Staff Member';
      default: return 'Member';
    }
  }

  private getDepartmentByRole(role: 'admin' | 'manager' | 'staff'): string {
    switch (role) {
      case 'admin': return 'System';
      case 'manager': return 'Management';
      case 'staff': return 'Operations';
      default: return 'General';
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
      const userResponse = await fetch(`${API_CONFIG.baseURL}user/${userId}/`, {
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
      await this.storeUserProfile(userData, token);
      
    } catch (error) {
      console.error('Failed to fetch user profile, using fallback:', error);
      
      // Fallback user profile
      const fallbackProfile = {
        id: 'fallback-user',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'staff' as const,
        organizationId: 'default-org',
        organization: {
          id: 'default-org',
          name: 'Organization',
          description: '',
          industry: ''
        },
        position: 'Member',
        department: 'Operations',
        permissions: rolePermissions.staff
      };
      
      localStorage.setItem("user", JSON.stringify(fallbackProfile));
    }
  }

  private parsePermissions(permissionsString: any, role: 'admin' | 'manager' | 'staff'): import('@/types/auth').Permission[] {
    try {
      // If permissions is a string, try to parse it
      if (typeof permissionsString === 'string' && permissionsString.length > 0) {
        // Handle comma-separated permissions
        if (permissionsString.includes(',')) {
          return permissionsString.split(',').map(p => p.trim()) as import('@/types/auth').Permission[];
        }
        // Handle JSON array string
        if (permissionsString.startsWith('[')) {
          return JSON.parse(permissionsString) as import('@/types/auth').Permission[];
        }
      }
      // If permissions is already an array
      if (Array.isArray(permissionsString)) {
        return permissionsString as import('@/types/auth').Permission[];
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