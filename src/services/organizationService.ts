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

class OrganizationService {
  // Organizations
  createOrganization<T = any>(payload: CreateOrganizationRequest) {
    return apiClient.post<T>(API_CONFIG.endpoints.organizations.createWithOwner, payload);
  }
  listOrganizations<T = any>(query?: QueryParams) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.list, query);
  }
  getOrganization<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.detail(id));
  }
  updateOrganization<T = any>(id: string, payload: UpdateOrganizationRequest) {
    return apiClient.put<T>(API_CONFIG.endpoints.organizations.update(id), payload);
  }

  // Staff
  addStaff<T = any>(payload: AddStaffRequest) {
    return apiClient.post<T>(API_CONFIG.endpoints.organizations.addStaff, payload);
  }
  listStaff<T = any>(query?: QueryParams) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.staff, query);
  }
  getStaff<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.staffDetail(id));
  }
  updateStaffRole<T = any>(id: string, payload: { role: 'owner' | 'manager' | 'member' }) {
    return apiClient.put<T>(API_CONFIG.endpoints.organizations.changeStaff(id), payload);
  }
  removeStaff<T = any>(id: string) {
    return apiClient.delete<T>(API_CONFIG.endpoints.organizations.changeStaff(id));
  }

  // Wallets
  listWallets<T = any>(query?: QueryParams) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.wallets, query);
  }
  getWallet<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.walletDetail(id));
  }
  updateWallet<T = any>(id: string, payload: UpdateWalletRequest) {
    return apiClient.put<T>(API_CONFIG.endpoints.organizations.updateWallet(id), payload);
  }

  // Transactions
  listWalletTransactions<T = any>(query?: QueryParams) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.transactions, query);
  }
  getWalletTransaction<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.organizations.transactionDetail(id));
  }
}

export const organizationService = new OrganizationService();

