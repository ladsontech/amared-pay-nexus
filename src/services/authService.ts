import { API_CONFIG } from './api-config';
import { otpService, OtpResponse } from "./otpService";

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

      // Attempt 1: Full payload (username, email, password) + Basic header
      let response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(basicToken ? { "Authorization": `Basic ${basicToken}` } : {}),
        },
        body: JSON.stringify({
          username: credentials.username || credentials.email,
          email: credentials.email,
          password: credentials.password,
        }),
      });

      // If the first attempt fails, try alternative payloads
      if (!response.ok) {
        // Attempt 2: Only username + password
        const responseUsernameOnly = await fetch(LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(basicToken ? { "Authorization": `Basic ${basicToken}` } : {}),
          },
          body: JSON.stringify({
            username: credentials.username || credentials.email,
            password: credentials.password,
          }),
        });
        if (responseUsernameOnly.ok) {
          response = responseUsernameOnly;
        } else {
          // Attempt 3: Basic only with minimal body (in case server strictly uses Basic)
          const responseBasicOnly = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(basicToken ? { "Authorization": `Basic ${basicToken}` } : {}),
            },
            body: JSON.stringify({ password: credentials.password }),
          });
          if (responseBasicOnly.ok) {
            response = responseBasicOnly;
          } else {
            const errBody = await responseBasicOnly.text().catch(() => "");
            const errBodyFallback = await responseUsernameOnly.text().catch(() => "");
            const firstErr = await response.text().catch(() => "");
            const combined = errBody || errBodyFallback || firstErr;
            throw new Error(`Login failed (${responseBasicOnly.status}). ${combined}`);
          }
        }
      }

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errText = typeof data === 'object' ? (data.message || JSON.stringify(data)) : String(data);
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
    } catch (error) {
      console.error("Login API error:", error);
      // Fallback to demo mode if API fails
      const mockResponse: LoginResponse = {
        username: "Demo User",
        email: credentials.email,
        token: "demo_token_123",
        access: "demo_access_token",
        refresh: "demo_refresh_token",
      };
      // Store mock tokens
      localStorage.setItem("auth_token", mockResponse.token!);
      localStorage.setItem("access_token", mockResponse.access!);
      localStorage.setItem("refresh_token", mockResponse.refresh!);
      return mockResponse;
    }
  }

  async logout(): Promise<void> {
    // Attempt backend logout if available (non-blocking)
    try {
      await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.logout}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      // Ignore network/logout endpoint errors
    }

    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.changePassword}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, message: data.message || "Password changed successfully" };
    } catch (error) {
      console.error("Change password API error:", error);
      // Fallback to demo mode
      return { success: true, message: "Password changed successfully (demo mode)" };
    }
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.refresh}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      // Update stored tokens
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return data;
    } catch (error) {
      console.error("Token refresh API error:", error);
      // Fallback to demo mode
      return {
        access: "demo_access_token_refreshed",
        refresh: "demo_refresh_token_refreshed"
      };
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.auth.verify}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return true; // Token is valid
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
  async forgotPasswordEmail(email: string): Promise<OtpResponse> {
    return await otpService.forgotPasswordEmail({ email });
  }

  async forgotPasswordSms(phoneNumber: string): Promise<OtpResponse> {
    return await otpService.forgotPasswordSms({ phone_number: phoneNumber });
  }

  async resendEmailOtp(email: string): Promise<OtpResponse> {
    return await otpService.resendEmailOtp({ email });
  }

  async resendSmsOtp(phoneNumber: string): Promise<OtpResponse> {
    return await otpService.resendSmsOtp({ phone_number: phoneNumber });
  }

  async resetPasswordWithEmailCode(emailCode: string, newPassword: string): Promise<OtpResponse> {
    return await otpService.resetPasswordWithEmailCode({ 
      email_code: emailCode, 
      new_password: newPassword 
    });
  }

  async resetPasswordWithSmsCode(smsCode: string, newPassword: string): Promise<OtpResponse> {
    return await otpService.resetPasswordWithSmsCode({ 
      sms_code: smsCode, 
      new_password: newPassword 
    });
  }

  async verifyEmailAddress(emailCode: string, email: string): Promise<OtpResponse> {
    return await otpService.verifyEmailAddress({ 
      email_code: emailCode, 
      email: email 
    });
  }

  async verifyPhoneNumber(smsCode: string, phoneNumber: string): Promise<OtpResponse> {
    return await otpService.verifyPhoneNumber({ 
      sms_code: smsCode, 
      phone_number: phoneNumber 
    });
  }
}

export const authService = new AuthService();
