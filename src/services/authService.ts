
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
    // Mock login for demo purposes
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

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    // Mock response for demo
    return { success: true, message: "Password changed successfully" };
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
    // Mock token refresh for demo
    return {
      access: "demo_access_token_refreshed",
      refresh: "demo_refresh_token_refreshed"
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    // Always return true for demo purposes
    return true;
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
