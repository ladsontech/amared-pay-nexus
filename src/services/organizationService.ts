import { API_CONFIG } from './api-config';
import { apiClient, QueryParams } from './apiClient';

export interface CreateOrganizationRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  org_name: string;
  address: string;
  company_reg_id: string;
  tin: string;
  wallet_currency: number;
  wallet_pin: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  address: string;
  company_reg_id: string;
  tin: string;
}

export interface AddStaffRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  organization: string; // UUID
  role: 'owner' | 'manager' | 'member';
}

export interface UpdateWalletRequest {
  balance: number;
  is_pin_set: boolean;
  currency: number;
  updated_by: string; // UUID
}

export interface OrganizationResponse {
  id: string;
  name: string;
  address: string;
  company_reg_id: string;
  tin: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  wallet?: {
    id: string;
    balance: number;
    currency: {
      id: number;
      name: string;
      code: string;
    };
  };
  staff_count?: number;
}

export interface StaffResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: 'owner' | 'manager' | 'member';
  organization: {
    id: string;
    name: string;
  };
  is_active: boolean;
  date_joined: string;
}

export interface WalletResponse {
  id: string;
  balance: number;
  is_pin_set: boolean;
  currency: {
    id: number;
    name: string;
    code: string;
  };
  organization: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

class OrganizationService {
  // Organizations
  async createOrganization(payload: CreateOrganizationRequest): Promise<OrganizationResponse> {
    try {
      return await apiClient.post<OrganizationResponse>(API_CONFIG.endpoints.organizations.createWithOwner, payload);
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw new Error('Failed to create organization');
    }
  }

  async listOrganizations(query?: QueryParams): Promise<OrganizationResponse[]> {
    try {
      const response = await apiClient.get<{ results?: OrganizationResponse[]; data?: OrganizationResponse[] } | OrganizationResponse[]>(
        API_CONFIG.endpoints.organizations.list, 
        query
      );
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.results) {
        return response.results;
      } else if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      throw new Error('Failed to fetch organizations');
    }
  }

  async getOrganization(id: string): Promise<OrganizationResponse> {
    try {
      return await apiClient.get<OrganizationResponse>(API_CONFIG.endpoints.organizations.detail(id));
    } catch (error) {
      console.error(`Failed to fetch organization ${id}:`, error);
      throw new Error(`Failed to fetch organization ${id}`);
    }
  }

  async updateOrganization(id: string, payload: UpdateOrganizationRequest): Promise<OrganizationResponse> {
    try {
      return await apiClient.put<OrganizationResponse>(API_CONFIG.endpoints.organizations.update(id), payload);
    } catch (error) {
      console.error(`Failed to update organization ${id}:`, error);
      throw new Error(`Failed to update organization ${id}`);
    }
  }

  // Staff
  async addStaff(payload: AddStaffRequest): Promise<StaffResponse> {
    try {
      return await apiClient.post<StaffResponse>(API_CONFIG.endpoints.organizations.addStaff, payload);
    } catch (error) {
      console.error('Failed to add staff:', error);
      throw new Error('Failed to add staff');
    }
  }

  async listStaff(query?: QueryParams): Promise<StaffResponse[]> {
    try {
      const response = await apiClient.get<{ results?: StaffResponse[]; data?: StaffResponse[] } | StaffResponse[]>(
        API_CONFIG.endpoints.organizations.staff, 
        query
      );
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.results) {
        return response.results;
      } else if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      throw new Error('Failed to fetch staff');
    }
  }

  async getStaff(id: string): Promise<StaffResponse> {
    try {
      return await apiClient.get<StaffResponse>(API_CONFIG.endpoints.organizations.staffDetail(id));
    } catch (error) {
      console.error(`Failed to fetch staff ${id}:`, error);
      throw new Error(`Failed to fetch staff ${id}`);
    }
  }

  async updateStaffRole(id: string, payload: { role: 'owner' | 'manager' | 'member' }): Promise<StaffResponse> {
    try {
      return await apiClient.put<StaffResponse>(API_CONFIG.endpoints.organizations.changeStaff(id), payload);
    } catch (error) {
      console.error(`Failed to update staff role ${id}:`, error);
      throw new Error(`Failed to update staff role ${id}`);
    }
  }

  async removeStaff(id: string): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.endpoints.organizations.changeStaff(id));
    } catch (error) {
      console.error(`Failed to remove staff ${id}:`, error);
      throw new Error(`Failed to remove staff ${id}`);
    }
  }

  // Wallets
  async listWallets(query?: QueryParams): Promise<WalletResponse[]> {
    try {
      const response = await apiClient.get<{ results?: WalletResponse[]; data?: WalletResponse[] } | WalletResponse[]>(
        API_CONFIG.endpoints.organizations.wallets, 
        query
      );
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.results) {
        return response.results;
      } else if (response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      throw new Error('Failed to fetch wallets');
    }
  }

  async getWallet(id: string): Promise<WalletResponse> {
    try {
      return await apiClient.get<WalletResponse>(API_CONFIG.endpoints.organizations.walletDetail(id));
    } catch (error) {
      console.error(`Failed to fetch wallet ${id}:`, error);
      throw new Error(`Failed to fetch wallet ${id}`);
    }
  }

  async updateWallet(id: string, payload: UpdateWalletRequest): Promise<WalletResponse> {
    try {
      return await apiClient.put<WalletResponse>(API_CONFIG.endpoints.organizations.updateWallet(id), payload);
    } catch (error) {
      console.error(`Failed to update wallet ${id}:`, error);
      throw new Error(`Failed to update wallet ${id}`);
    }
  }

  // Transactions
  async listWalletTransactions(query?: QueryParams) {
    try {
      const response = await apiClient.get(API_CONFIG.endpoints.organizations.transactions, query);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if ((response as any).results) {
        return (response as any).results;
      } else if ((response as any).data) {
        return (response as any).data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch wallet transactions:', error);
      throw new Error('Failed to fetch wallet transactions');
    }
  }

  async getWalletTransaction(id: string) {
    try {
      return await apiClient.get(API_CONFIG.endpoints.organizations.transactionDetail(id));
    } catch (error) {
      console.error(`Failed to fetch wallet transaction ${id}:`, error);
      throw new Error(`Failed to fetch wallet transaction ${id}`);
    }
  }
}

export const organizationService = new OrganizationService();