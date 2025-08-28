import { API_CONFIG } from './api-config';
import { apiClient, QueryParams } from './apiClient';

export interface UserQuery extends QueryParams {
  phone_number?: string;
  email?: string;
  username?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSubAdminRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  password: string;
}

class UserService {
  listUsers<T = any>(query?: UserQuery) {
    return apiClient.get<T>(API_CONFIG.endpoints.user.list, query);
  }

  getUser<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.user.detail(id));
  }

  createSubAdmin<T = any>(payload: CreateSubAdminRequest) {
    return apiClient.post<T>(API_CONFIG.endpoints.subAdmin.create, payload);
  }

  listSubAdmins<T = any>(query?: QueryParams) {
    return apiClient.get<T>(API_CONFIG.endpoints.subAdmin.list, query);
  }

  getSubAdmin<T = any>(id: string) {
    return apiClient.get<T>(API_CONFIG.endpoints.subAdmin.detail(id));
  }

  updateSubAdmin<T = any>(id: string, payload: Partial<CreateSubAdminRequest>) {
    return apiClient.put<T>(API_CONFIG.endpoints.subAdmin.update(id), payload);
  }

  deleteSubAdmin<T = any>(id: string) {
    return apiClient.delete<T>(API_CONFIG.endpoints.subAdmin.delete(id));
  }
}

export const userService = new UserService();

