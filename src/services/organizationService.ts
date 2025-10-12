const API_BASE_URL = "https://bulksrv.almaredagencyuganda.com";

// Types based on the API documentation
export interface Staff {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  organization: {
    id: string;
    name: string;
    logo: string | null;
    address: string | null;
    company_reg_id: string | null;
    tin: string | null;
    created_at: string;
    updated_at: string;
  };
  role: "owner" | "manager" | "member" | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  company_reg_id: string | null;
  tin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  organization: Organization;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  balance: number | null;
  is_pin_set: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface WalletTransaction {
  id: string;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  wallet: {
    id: string;
    balance: number | null;
    is_pin_set: boolean;
    created_at: string;
    updated_at: string;
    organization: string;
    currency: number;
    updated_by: string | null;
  };
  type: "debit" | "credit" | null;
  amount: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface CreateStaffRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  organization: string;
  role?: "owner" | "manager" | "member";
}

export interface UpdateStaffRequest {
  role: "owner" | "manager" | "member";
}

export interface CreateOrganizationRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  org_name: string;
  address?: string;
  company_reg_id?: string;
  tin?: string;
  wallet_currency: number;
  wallet_pin: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  address?: string;
  company_reg_id?: string;
  tin?: string;
}

export interface UpdateWalletRequest {
  balance?: number;
  is_pin_set?: boolean;
  currency?: number;
  updated_by?: string;
}

class OrganizationService {
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  private checkAdminPermission(): boolean {
    const userStr = localStorage.getItem("user");
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.isSuperuser === true || user.role === 'admin';
    } catch {
      return false;
    }
  }

  // Staff Management
  async addStaff(staffData: CreateStaffRequest): Promise<CreateStaffRequest> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only admins can add staff to organizations");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/add_staff/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "";
        
        try {
          const errorData = JSON.parse(errorText);
          if (typeof errorData === 'object' && !errorData.message) {
            const errors = Object.entries(errorData)
              .map(([key, value]) => {
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
              })
              .join('; ');
            errorMessage = errors;
          } else {
            errorMessage = errorData.message || errorText;
          }
        } catch {
          if (errorText.includes('IntegrityError') || errorText.includes('duplicate key')) {
            const duplicateMatch = errorText.match(/duplicate key value violates unique constraint "([^"]+)"[^(]*\(([^)]+)\)/);
            if (duplicateMatch) {
              const field = duplicateMatch[1].replace('user_', '').replace('_key', '').replace(/_/g, ' ');
              const value = duplicateMatch[2].split('=')[1]?.replace(/\)/g, '');
              errorMessage = `A user with this ${field} (${value}) already exists. Please use a different ${field}.`;
            } else {
              errorMessage = "This user data already exists. Please check phone number, email, or username.";
            }
          } else if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = "Server error occurred. Please check all fields and try again.";
          } else {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Add staff error:", error);
      throw error;
    }
  }

  async updateStaffRole(staffId: string, roleData: UpdateStaffRequest): Promise<Staff> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/change_staff/${staffId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update staff role error:", error);
      throw error;
    }
  }

  async deleteStaff(staffId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/change_staff/${staffId}/`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Delete staff error:", error);
      throw error;
    }
  }

  async getStaffList(params?: {
    user?: string;
    organization?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: Staff[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.user) queryParams.append("user", params.user);
      if (params?.organization) queryParams.append("organization", params.organization);
      if (params?.role) queryParams.append("role", params.role);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/staff/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get staff list error:", error);
      throw error;
    }
  }

  async getStaff(staffId: string): Promise<Staff> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/staff/${staffId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get staff error:", error);
      throw error;
    }
  }

  // Organization Management
  async createOrganization(orgData: CreateOrganizationRequest): Promise<CreateOrganizationRequest & { logo: string | null }> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can create organizations");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/create_org/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "";
        
        try {
          // Try parsing as JSON first
          const errorData = JSON.parse(errorText);
          
          if (typeof errorData === 'object' && !errorData.message) {
            const errors = Object.entries(errorData)
              .map(([key, value]) => {
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
              })
              .join('; ');
            errorMessage = errors;
          } else {
            errorMessage = errorData.message || errorText;
          }
        } catch {
          // If not JSON, check if it's HTML error page
          if (errorText.includes('IntegrityError') || errorText.includes('duplicate key')) {
            // Extract meaningful error from HTML
            const duplicateMatch = errorText.match(/duplicate key value violates unique constraint "([^"]+)"[^(]*\(([^)]+)\)/);
            if (duplicateMatch) {
              const field = duplicateMatch[1].replace('user_', '').replace('_key', '').replace(/_/g, ' ');
              const value = duplicateMatch[2].split('=')[1]?.replace(/\)/g, '');
              errorMessage = `A user with this ${field} (${value}) already exists. Please use a different ${field}.`;
            } else {
              errorMessage = "This data already exists in the system. Please check your phone number, email, or username.";
            }
          } else if (errorText.includes('<!DOCTYPE html>')) {
            // Generic HTML error
            errorMessage = "Server error occurred. Please check all fields and try again.";
          } else {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Create organization error:", error);
      throw error;
    }
  }

  async getOrganizations(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: Organization[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/org/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get organizations error:", error);
      throw error;
    }
  }

  async getOrganization(orgId: string): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/org/${orgId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get organization error:", error);
      throw error;
    }
  }

  async updateOrganization(orgId: string, orgData: UpdateOrganizationRequest): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/org/${orgId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update organization error:", error);
      throw error;
    }
  }

  // Wallet Management
  async getWallets(params?: {
    organization?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: Wallet[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.organization) queryParams.append("organization", params.organization);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/wallet/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get wallets error:", error);
      throw error;
    }
  }

  async getWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/wallet/${walletId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get wallet error:", error);
      throw error;
    }
  }

  async updateWallet(walletId: string, walletData: UpdateWalletRequest): Promise<Wallet> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/update_wallet/${walletId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update wallet error:", error);
      throw error;
    }
  }

  // Wallet Transactions
  async getWalletTransactions(params?: {
    wallet?: string;
    type?: string;
    currency?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: WalletTransaction[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.wallet) queryParams.append("wallet", params.wallet);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/wallet_transaction/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get wallet transactions error:", error);
      throw error;
    }
  }

  async getWalletTransaction(transactionId: string): Promise<WalletTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/wallet_transaction/${transactionId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get wallet transaction error:", error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();
