const API_BASE_URL = "https://bulksrv.almaredagencyuganda.com";

// Types based on the API documentation
export interface Staff {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
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
  static_collection_link: string | null;
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
  petty_cash_wallet: string | null;
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
    petty_cash_wallet: string | null;
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
  // Function-specific roles
  permissions?: {
    petty_cash?: boolean;
    bulk_payments?: boolean;
    collections?: boolean;
    approvals?: boolean;
    users?: boolean;
    reports?: boolean;
  };
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
  address?: string | null;
  company_reg_id?: string | null;
  tin?: string | null;
  static_collection_link?: string | null;
}

export interface UpdateWalletRequest {
  balance?: number | null;
  is_pin_set?: boolean;
  currency?: number | null;
  petty_cash_wallet?: string | null;
  updated_by?: string | null;
}

// Bill Payment Types
export interface BillPayment {
  id: string;
  organization: Organization;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  wallet_transaction?: WalletTransaction;
  petty_cash_transaction?: PettyCashTransaction;
  biller_name: string;
  account_number: string;
  amount: number;
  status?: "pending" | "successful" | "failed";
  type?: "electricity" | "water" | "internet" | "airtime";
  wallet_type?: "main_wallet" | "petty_cash_wallet";
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBillPaymentRequest {
  organization?: string | { id: string; name?: string; address?: string; company_reg_id?: string; tin?: string; static_collection_link?: string };
  currency?: number | { id: number; name?: string; symbol?: string };
  wallet_transaction?: string | { currency?: any; wallet?: any; type?: string; amount?: number; title?: string; updated_by?: string };
  petty_cash_transaction?: string | { petty_cash_wallet?: any; currency?: any; updated_by?: any; type?: string; status?: string; amount?: number; title?: string };
  biller_name: string;
  account_number: string;
  amount: number;
  status?: "pending" | "successful" | "failed";
  type?: "electricity" | "water" | "internet" | "airtime" | null;
  wallet_type?: "main_wallet" | "petty_cash_wallet";
  reference?: string | null;
}

export interface UpdateBillPaymentRequest {
  organization?: string | { id: string; name?: string; address?: string; company_reg_id?: string; tin?: string; static_collection_link?: string };
  currency?: number | { id: number; name?: string; symbol?: string };
  wallet_transaction?: string | { currency?: any; wallet?: any; type?: string; amount?: number; title?: string; updated_by?: string };
  petty_cash_transaction?: string | { petty_cash_wallet?: any; currency?: any; updated_by?: any; type?: string; status?: string; amount?: number; title?: string };
  biller_name: string;
  account_number: string;
  amount: number;
  status?: "pending" | "successful" | "failed";
  type?: "electricity" | "water" | "internet" | "airtime" | null;
  wallet_type?: "main_wallet" | "petty_cash_wallet";
  reference?: string | null;
}

// Petty Cash Types
export interface PettyCashWallet {
  id: string;
  organization: Organization;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  updated_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  balance: number | null;
  created_at: string;
  updated_at: string;
}

export interface PettyCashTransaction {
  id: string;
  petty_cash_wallet: PettyCashWallet;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  updated_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  type?: "debit" | "credit";
  status?: "pending_approval" | "approved" | "rejected";
  amount: number;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface PettyCashExpense {
  id: string;
  petty_cash_wallet: PettyCashWallet;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  petty_cash_transaction?: PettyCashTransaction;
  approved_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  updated_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  category?: "office_supplies" | "travel" | "meals" | "entertainment" | "utilities" | "maintenance" | "emergency" | "other";
  amount: number;
  description?: string;
  receipt_number?: string;
  requestor_name?: string;
  requestor_phone_number?: string;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PettyCashFundRequest {
  id: string;
  petty_cash_wallet: PettyCashWallet;
  currency: {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
  };
  petty_cash_transaction?: PettyCashTransaction;
  approved_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  updated_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    groups: string[];
    is_email_verified: boolean;
    is_phone_verified: boolean;
    permissions: string;
  };
  amount: number;
  urgency_level?: "low" | "normal" | "high" | "urgent";
  reason?: string;
  requestor_name?: string;
  requestor_phone_number?: string;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
}

// OTP Types
export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
    };
    access_token: string;
    refresh_token: string;
  };
}

export interface ForgotPasswordRequest {
  email?: string;
  phone_number?: string;
}

export interface ResetPasswordRequest {
  email_code?: string;
  sms_code?: string;
  new_password: string;
}

export interface VerifyOTPRequest {
  email_code?: string;
  sms_code?: string;
  email?: string;
  phone_number?: string;
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

  private checkOwnerPermission(): boolean {
    const userStr = localStorage.getItem("user");
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.isSuperuser === true || user.role === 'admin' || user.role === 'owner';
    } catch {
      return false;
    }
  }

  // Staff Management
  async addStaff(staffData: CreateStaffRequest): Promise<CreateStaffRequest> {
    if (!this.checkOwnerPermission()) {
      throw new Error("Unauthorized: Only organization owners and admins can add staff");
    }

    // Validate required fields
    if (!staffData.username || !staffData.password || !staffData.first_name ||
        !staffData.last_name || !staffData.email || !staffData.phone_number) {
      throw new Error("All required fields must be provided");
    }

    // Validate organization field
    if (!staffData.organization) {
      throw new Error("Organization ID is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffData.email)) {
      throw new Error("Please provide a valid email address");
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(staffData.phone_number)) {
      throw new Error("Please provide a valid phone number");
    }

    // Validate password length
    if (staffData.password.length < 8 || staffData.password.length > 40) {
      throw new Error("Password must be between 8 and 40 characters");
    }

    // Validate phone number length
    if (staffData.phone_number.length < 10) {
      throw new Error("Phone number must be at least 10 characters");
    }

    try {
      // Prepare payload with only fields accepted by the API
      const payload = {
        username: staffData.username,
        password: staffData.password,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        email: staffData.email,
        phone_number: staffData.phone_number,
        organization: staffData.organization,
        ...(staffData.role && { role: staffData.role }), // Only include role if provided
      };

      console.log('Adding staff with data:', {
        ...payload,
        password: '[HIDDEN]' // Don't log password
      });
      
      const response = await fetch(`${API_BASE_URL}/organizations/add_staff/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      console.log('Staff addition response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Staff addition error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) // Log first 500 chars
        });

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
            errorMessage = `Server error (${response.status}): The server returned an HTML page instead of JSON. This usually indicates a server-side error. Please try again or contact support.`;
          } else if (response.status === 400) {
            errorMessage = "Bad Request: Please check all fields and ensure they are valid.";
          } else if (response.status === 401) {
            errorMessage = "Unauthorized: Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "Forbidden: You don't have permission to add staff members.";
          } else if (response.status === 500) {
            errorMessage = "Internal Server Error: The server encountered an error. Please try again later.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Staff added successfully:', result);
      return result;
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/organizations/org/?${queryString}`
        : `${API_BASE_URL}/organizations/org/`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || `HTTP error! status: ${response.status}`;
        } catch {
          // If response is HTML or not JSON
          if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = `Server error (${response.status}): The server returned an HTML page instead of JSON. This usually indicates a server-side error.`;
          } else if (response.status === 401) {
            errorMessage = "Unauthorized: Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "Forbidden: You don't have permission to view organizations.";
          } else if (response.status === 500) {
            errorMessage = "Internal Server Error: The server encountered an error.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Ensure we always return the expected structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format from server");
      }

      // Handle case where response might not have results array
      if (!Array.isArray(data.results)) {
        console.warn("API response missing results array, returning empty array:", data);
        return {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
      }

      return data;
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

  async updateOrganization(orgId: string, orgData: UpdateOrganizationRequest | FormData): Promise<Organization> {
    try {
      const isFormData = orgData instanceof FormData;
      const accessToken = localStorage.getItem("access_token");
      
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      
      // Only add Content-Type for JSON, let browser set it for FormData
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      // API spec requires PUT method
      const response = await fetch(`${API_BASE_URL}/organizations/org/${orgId}/`, {
        method: "PUT",
        headers,
        body: isFormData ? orgData : JSON.stringify(orgData),
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

  // Bill Payment Management
  async getBillPayments(params?: {
    organization?: string;
    status?: string;
    type?: string;
    wallet_type?: string;
    currency?: string;
    petty_cash_transaction?: string;
    reference?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: BillPayment[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.organization) queryParams.append("organization", params.organization);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.wallet_type) queryParams.append("wallet_type", params.wallet_type);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.petty_cash_transaction) queryParams.append("petty_cash_transaction", params.petty_cash_transaction);
      if (params?.reference) queryParams.append("reference", params.reference);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/bill_payment/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get bill payments error:", error);
      throw error;
    }
  }

  async createBillPayment(billData: CreateBillPaymentRequest): Promise<BillPayment> {
    try {
      // Prepare payload - send IDs where provided, or minimal objects
      const payload: any = {
        biller_name: billData.biller_name,
        account_number: billData.account_number,
        amount: billData.amount,
      };

      // Add optional fields
      if (billData.status) payload.status = billData.status;
      if (billData.type) payload.type = billData.type;
      if (billData.wallet_type) payload.wallet_type = billData.wallet_type;
      if (billData.reference) payload.reference = billData.reference;

      // Handle organization - send ID if string, or object if provided
      if (billData.organization) {
        if (typeof billData.organization === 'string') {
          payload.organization = billData.organization;
        } else {
          payload.organization = billData.organization;
        }
      }

      // Handle currency - send ID if number, or object if provided
      if (billData.currency !== undefined) {
        if (typeof billData.currency === 'number') {
          payload.currency = billData.currency;
        } else {
          payload.currency = billData.currency;
        }
      }

      // Handle wallet_transaction if provided
      if (billData.wallet_transaction) {
        if (typeof billData.wallet_transaction === 'string') {
          payload.wallet_transaction = billData.wallet_transaction;
        } else {
          payload.wallet_transaction = billData.wallet_transaction;
        }
      }

      // Handle petty_cash_transaction if provided
      if (billData.petty_cash_transaction) {
        if (typeof billData.petty_cash_transaction === 'string') {
          payload.petty_cash_transaction = billData.petty_cash_transaction;
        } else {
          payload.petty_cash_transaction = billData.petty_cash_transaction;
        }
      }

      const response = await fetch(`${API_BASE_URL}/organizations/bill_payment/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "";
        try {
          const errorData = JSON.parse(errorText);
          if (typeof errorData === 'object') {
            const errors = Object.entries(errorData)
              .map(([key, value]) => {
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
              })
              .join('; ');
            errorMessage = errors || errorText;
          } else {
            errorMessage = errorData.message || errorText;
          }
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Create bill payment error:", error);
      throw error;
    }
  }

  async getBillPayment(billId: string): Promise<BillPayment> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/bill_payment/${billId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get bill payment error:", error);
      throw error;
    }
  }

  async updateBillPayment(billId: string, billData: UpdateBillPaymentRequest): Promise<BillPayment> {
    try {
      // Prepare payload similar to create
      const payload: any = {
        biller_name: billData.biller_name,
        account_number: billData.account_number,
        amount: billData.amount,
      };

      // Add optional fields
      if (billData.status) payload.status = billData.status;
      if (billData.type !== undefined) payload.type = billData.type;
      if (billData.wallet_type) payload.wallet_type = billData.wallet_type;
      if (billData.reference !== undefined) payload.reference = billData.reference;

      // Handle organization
      if (billData.organization) {
        if (typeof billData.organization === 'string') {
          payload.organization = billData.organization;
        } else {
          payload.organization = billData.organization;
        }
      }

      // Handle currency
      if (billData.currency !== undefined) {
        if (typeof billData.currency === 'number') {
          payload.currency = billData.currency;
        } else {
          payload.currency = billData.currency;
        }
      }

      // Handle wallet_transaction
      if (billData.wallet_transaction) {
        if (typeof billData.wallet_transaction === 'string') {
          payload.wallet_transaction = billData.wallet_transaction;
        } else {
          payload.wallet_transaction = billData.wallet_transaction;
        }
      }

      // Handle petty_cash_transaction
      if (billData.petty_cash_transaction) {
        if (typeof billData.petty_cash_transaction === 'string') {
          payload.petty_cash_transaction = billData.petty_cash_transaction;
        } else {
          payload.petty_cash_transaction = billData.petty_cash_transaction;
        }
      }

      const response = await fetch(`${API_BASE_URL}/organizations/bill_payment/${billId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "";
        try {
          const errorData = JSON.parse(errorText);
          if (typeof errorData === 'object') {
            const errors = Object.entries(errorData)
              .map(([key, value]) => {
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
              })
              .join('; ');
            errorMessage = errors || errorText;
          } else {
            errorMessage = errorData.message || errorText;
          }
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Update bill payment error:", error);
      throw error;
    }
  }

  // Petty Cash Wallet Management
  async getPettyCashWallets(params?: {
    organization?: string;
    currency?: string;
    updated_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: PettyCashWallet[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.organization) queryParams.append("organization", params.organization);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.updated_by) queryParams.append("updated_by", params.updated_by);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_wallet/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash wallets error:", error);
      throw error;
    }
  }

  async getPettyCashWallet(walletId: string): Promise<PettyCashWallet> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_wallet/${walletId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash wallet error:", error);
      throw error;
    }
  }

  // Petty Cash Transaction Management
  async getPettyCashTransactions(params?: {
    petty_cash_wallet?: string;
    type?: string;
    status?: string;
    currency?: string;
    updated_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: PettyCashTransaction[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petty_cash_wallet) queryParams.append("petty_cash_wallet", params.petty_cash_wallet);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.updated_by) queryParams.append("updated_by", params.updated_by);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_transaction/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash transactions error:", error);
      throw error;
    }
  }

  async createPettyCashTransaction(transactionData: {
    petty_cash_wallet: string;
    currency: number;
    updated_by: string;
    type?: "debit" | "credit";
    status?: "pending_approval" | "approved" | "rejected";
    amount: number;
    title?: string;
  }): Promise<PettyCashTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_transaction/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Create petty cash transaction error:", error);
      throw error;
    }
  }

  async getPettyCashTransaction(transactionId: string): Promise<PettyCashTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_transaction/${transactionId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash transaction error:", error);
      throw error;
    }
  }

  // Petty Cash Expense Management
  async getPettyCashExpenses(params?: {
    petty_cash_wallet?: string;
    petty_cash_transaction?: string;
    currency?: string;
    approved_by?: string;
    updated_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: PettyCashExpense[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petty_cash_wallet) queryParams.append("petty_cash_wallet", params.petty_cash_wallet);
      if (params?.petty_cash_transaction) queryParams.append("petty_cash_transaction", params.petty_cash_transaction);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.approved_by) queryParams.append("approved_by", params.approved_by);
      if (params?.updated_by) queryParams.append("updated_by", params.updated_by);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_expense/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash expenses error:", error);
      throw error;
    }
  }

  async createPettyCashExpense(expenseData: {
    petty_cash_wallet: string;
    currency: number;
    petty_cash_transaction?: string;
    approved_by?: string;
    updated_by?: string;
    category?: "office_supplies" | "travel" | "meals" | "entertainment" | "utilities" | "maintenance" | "emergency" | "other";
    amount: number;
    description?: string;
    receipt_number?: string;
    requestor_name?: string;
    requestor_phone_number?: string;
    is_approved?: boolean;
  }): Promise<PettyCashExpense> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_expense/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Create petty cash expense error:", error);
      throw error;
    }
  }

  async getPettyCashExpense(expenseId: string): Promise<PettyCashExpense> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_expense/${expenseId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash expense error:", error);
      throw error;
    }
  }

  async updatePettyCashExpense(expenseId: string, expenseData: {
    petty_cash_wallet?: string;
    currency?: number;
    petty_cash_transaction?: string;
    approved_by?: string;
    updated_by?: string;
    category?: "office_supplies" | "travel" | "meals" | "entertainment" | "utilities" | "maintenance" | "emergency" | "other";
    amount: number;
    description?: string;
    receipt_number?: string;
    requestor_name?: string;
    requestor_phone_number?: string;
    is_approved?: boolean;
  }): Promise<PettyCashExpense> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_expense/${expenseId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update petty cash expense error:", error);
      throw error;
    }
  }

  // Petty Cash Fund Request Management
  async getPettyCashFundRequests(params?: {
    petty_cash_wallet?: string;
    petty_cash_transaction?: string;
    currency?: string;
    approved_by?: string;
    updated_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: PettyCashFundRequest[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petty_cash_wallet) queryParams.append("petty_cash_wallet", params.petty_cash_wallet);
      if (params?.petty_cash_transaction) queryParams.append("petty_cash_transaction", params.petty_cash_transaction);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.approved_by) queryParams.append("approved_by", params.approved_by);
      if (params?.updated_by) queryParams.append("updated_by", params.updated_by);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_fund_request/?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash fund requests error:", error);
      throw error;
    }
  }

  async createPettyCashFundRequest(fundRequestData: {
    petty_cash_wallet: string;
    currency: number;
    petty_cash_transaction?: string;
    approved_by?: string;
    updated_by?: string;
    amount: number;
    urgency_level?: "low" | "normal" | "high" | "urgent";
    reason?: string;
    requestor_name?: string;
    requestor_phone_number?: string;
    is_approved?: boolean;
  }): Promise<PettyCashFundRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_fund_request/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(fundRequestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Create petty cash fund request error:", error);
      throw error;
    }
  }

  async getPettyCashFundRequest(fundRequestId: string): Promise<PettyCashFundRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_fund_request/${fundRequestId}/`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get petty cash fund request error:", error);
      throw error;
    }
  }

  async updatePettyCashFundRequest(fundRequestId: string, fundRequestData: {
    petty_cash_wallet?: string;
    currency?: number;
    petty_cash_transaction?: string;
    approved_by?: string;
    updated_by?: string;
    amount: number;
    urgency_level?: "low" | "normal" | "high" | "urgent";
    reason?: string;
    requestor_name?: string;
    requestor_phone_number?: string;
    is_approved?: boolean;
  }): Promise<PettyCashFundRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/petty_cash_fund_request/${fundRequestId}/`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(fundRequestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update petty cash fund request error:", error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();
