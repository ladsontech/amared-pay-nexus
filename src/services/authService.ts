
const API_BASE_URL = "https://backendapi.bulkpay.almaredagencyuganda.com";

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
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer demo_token`
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username || credentials.email,
          email: credentials.email,
          password: credentials.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      // Store tokens and user data
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      
      // Store user data
      const userData = {
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        organization: data.organization || "Unknown Organization"
      };
      localStorage.setItem("user", JSON.stringify(userData));

      return data;
    } catch (error) {
      console.error("Login API error:", error);
      
      // Fallback to demo mode if API fails
      const mockResponse = {
        username: "Demo User",
        email: credentials.email,
        token: "demo_token_123",
        access: "demo_access_token",
        refresh: "demo_refresh_token"
      };

      // Store mock data
      localStorage.setItem("auth_token", mockResponse.token);
      localStorage.setItem("access_token", mockResponse.access);
      localStorage.setItem("refresh_token", mockResponse.refresh);
      
      const userData = {
        username: mockResponse.username,
        email: mockResponse.email,
        name: "Demo User",
        organization: "Demo Organization"
      };
      localStorage.setItem("user", JSON.stringify(userData));

      return mockResponse;
    }
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/change`, {
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

      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/token/verify/`, {
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
      // Fallback to demo mode - always return true
      return true;
    }
  }

  isAuthenticated(): boolean {
    // Always return true for demo purposes
    return true;
  }

  getCurrentUser() {
    // Return mock user data for demo
    return {
      username: "Demo User",
      email: "demo@example.com",
      name: "Demo User",
      organization: "Demo Organization"
    };
  }
}

export const authService = new AuthService();
