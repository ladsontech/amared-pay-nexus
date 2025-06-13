
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
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    if (data.access) {
      localStorage.setItem("access_token", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }
    
    // Store user data
    const userData = {
      username: data.username,
      email: data.email,
    };
    localStorage.setItem("user", JSON.stringify(userData));

    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/password/change`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Password change failed");
    }

    return await response.json();
  }

  async refreshToken(): Promise<{ access: string; refresh: string }> {
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

    if (!response.ok) {
      // If refresh fails, clear all tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    
    // Update stored tokens
    if (data.access) {
      localStorage.setItem("access_token", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }

    return data;
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

      return response.ok;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("access_token");
    return !!token;
  }

  getCurrentUser() {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }
}

export const authService = new AuthService();
