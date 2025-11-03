import { API_CONFIG } from './api-config';
import { otpService, OTPResponse } from "./otpService";

const API_BASE_URL = API_CONFIG.baseURL.replace(/\/$/, '');


export interface LoginRequest {
  username?: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  email: string;
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
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const usernameForBasic = (credentials.username || credentials.email || '').toString();
      const basicToken = typeof btoa === 'function' ? btoa(`${usernameForBasic}:${credentials.password}`) : '';

      const loginPath = API_CONFIG.endpoints.auth.login; // e.g. 'users/auth/login/'
      const LOGIN_URL = `${API_BASE_URL}/${loginPath}`;

      // Build payload per API docs: username, email, password (all can be non-empty)
      const payload: any = {
          password: credentials.password,
      };
      
      // Add username if provided
      if (credentials.username && credentials.username.trim()) {
        payload.username = credentials.username.trim();
      }
      
      // Add email if provided
      if (credentials.email && credentials.email.trim()) {
        payload.email = credentials.email.trim();
      }

      // Attempt login with Basic auth header
      let response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(basicToken ? { "Authorization": `Basic ${basicToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errText = typeof data === 'object' 
          ? (data.message || data.detail || data.error || JSON.stringify(data)) 
          : String(data);
        throw new Error(errText || `HTTP error! status: ${response.status}`);
      }

      // Store tokens (support multiple API shapes)
      const accessToken = data.access_token || data.access || data.token;
      const refreshToken = data.refresh_token || data.refresh;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        // Back-compat key used elsewhere in the app
        localStorage.setItem("auth_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Return enriched payload so AuthContext can derive roles and details
      return {
        username: data.username,
        email: data.email,
        token: accessToken,
        access: accessToken,
        refresh: refreshToken,
        user: data.user, // critical: nested user from API
        // passthrough fields used by AuthContext (if login returns them)
        is_superuser: data.is_superuser,
        is_staff: data.is_staff,
        groups: data.groups,
        permissions: data.permissions,
        organizationId: data.organization_id || data.organizationId,
        organization: data.organization,
        role: data.role,
      } as any;
    } catch (error: any) {
      console.error("Login API error:", error);
      // Do not fallback to demo login; enforce real authentication
      throw new Error(error?.message || "Invalid credentials");
    }
  }

  async logout(): Promise<void> {
    // Attempt backend logout - try POST first, then GET (per API docs both are supported)
    try {
      const logoutUrl = `${API_BASE_URL}/${API_CONFIG.endpoints.auth.logout}`;
      
      // Try POST first
      let response = await fetch(logoutUrl, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
      
      // If POST fails, try GET
      if (!response.ok && response.status !== 200 && response.status !== 201) {
        response = await fetch(logoutUrl, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
      }
    } catch (e) {
      // Ignore network/logout endpoint errors - still clear local storage
      console.warn('Logout API call failed, clearing local storage anyway:', e);
    }

    // Always clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("impersonating");
    localStorage.removeItem("original_admin");
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Validate password lengths per API docs
      if (passwordData.current_password.length < 8 || passwordData.current_password.length > 40) {
        throw new Error("Current password must be between 8 and 40 characters");
      }
      if (passwordData.new_password.length < 8 || passwordData.new_password.length > 40) {
        throw new Error("New password must be between 8 and 40 characters");
      }

      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.changePassword}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || data.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return { success: data.success !== false, message: data.message || "Password changed successfully" };
    } catch (error: any) {
      console.error("Change password API error:", error);
      throw new Error(error?.message || "Failed to change password");
    }
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken || refreshToken.trim() === '') {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.refresh}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || data.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Validate response has required fields
      if (!data.access) {
        throw new Error("Invalid refresh response: missing access token");
      }
      
      // Update stored tokens
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("auth_token", data.access); // Back-compat
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return { access: data.access, refresh: data.refresh || refreshToken };
    } catch (error: any) {
      console.error("Token refresh API error:", error);
      throw new Error(error?.message || "Failed to refresh token");
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      if (!token || token.trim() === '') {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.verify}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return false;
      }
      
      // API returns { token: "..." } if valid
      return data.token === token.trim() || data.token !== undefined;
    } catch (error) {
      console.error("Token verify API error:", error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem("access_token") || localStorage.getItem("auth_token");
    return Boolean(accessToken);
  }

  getCurrentUser() {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // OTP-related methods
  async forgotPasswordEmail(email: string): Promise<OTPResponse> {
    return await otpService.forgotPasswordEmail({ email });
  }

  async forgotPasswordSms(phoneNumber: string): Promise<OTPResponse> {
    return await otpService.forgotPasswordSms({ phone_number: phoneNumber });
  }

  async resendEmailOtp(email: string): Promise<OTPResponse> {
    return await otpService.resendEmailOtp({ email });
  }

  async resendSmsOtp(phoneNumber: string): Promise<OTPResponse> {
    return await otpService.resendSmsOtp({ phone_number: phoneNumber });
  }

  async resetPasswordWithEmailCode(emailCode: string, newPassword: string): Promise<OTPResponse> {
    return await otpService.resetPasswordWithEmailCode({ 
      email_code: emailCode, 
      new_password: newPassword 
    });
  }

  async resetPasswordWithSmsCode(smsCode: string, newPassword: string): Promise<OTPResponse> {
    return await otpService.resetPasswordWithSmsCode({ 
      sms_code: smsCode, 
      new_password: newPassword 
    });
  }

  async verifyEmailAddress(emailCode: string, email: string): Promise<OTPResponse> {
    return await otpService.verifyEmailAddress({ 
      email_code: emailCode, 
      email: email 
    });
  }

  async verifyPhoneNumber(smsCode: string, phoneNumber: string): Promise<OTPResponse> {
    return await otpService.verifyPhoneNumber({ 
      sms_code: smsCode, 
      phone_number: phoneNumber 
    });
  }
}

export const authService = new AuthService();
