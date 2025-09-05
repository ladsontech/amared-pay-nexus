import { API_CONFIG } from './api-config';
import { apiClient, QueryParams } from './apiClient';
import { allDemoUsers } from '@/data/demoData';

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

export interface UpdateSubAdminRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  role?: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface SubAdminResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

class UserService {
  async listUsers(query?: UserQuery): Promise<UserResponse[]> {
    try {
      const response = await apiClient.get<{ results?: UserResponse[]; data?: UserResponse[] } | UserResponse[]>(
        API_CONFIG.endpoints.user.list, 
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
      console.warn('API call failed, using demo data:', error);
      // Fallback to demo data
      return allDemoUsers.map(user => ({
        id: user.id,
        username: user.email.split('@')[0],
        email: user.email,
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ')[1] || '',
        phone_number: '+256700000000',
        is_active: true,
        date_joined: new Date().toISOString()
      }));
    }
  }

  async getUser(id: string): Promise<UserResponse> {
    try {
      return await apiClient.get<UserResponse>(API_CONFIG.endpoints.user.detail(id));
    } catch (error) {
      console.warn('API call failed, using demo data:', error);
      // Fallback to demo data
      const demoUser = allDemoUsers.find(u => u.id === id);
      if (demoUser) {
        return {
          id: demoUser.id,
          username: demoUser.email.split('@')[0],
          email: demoUser.email,
          first_name: demoUser.name.split(' ')[0],
          last_name: demoUser.name.split(' ')[1] || '',
          phone_number: '+256700000000',
          is_active: true,
          date_joined: new Date().toISOString()
        };
      }
      throw new Error('User not found');
    }
  }

  async createSubAdmin(payload: CreateSubAdminRequest): Promise<SubAdminResponse> {
    try {
      return await apiClient.post<SubAdminResponse>(API_CONFIG.endpoints.subAdmin.create, payload);
    } catch (error) {
      console.error('Failed to create sub admin:', error);
      throw new Error('Failed to create sub admin');
    }
  }

  async listSubAdmins(query?: QueryParams): Promise<SubAdminResponse[]> {
    try {
      const response = await apiClient.get<{ results?: SubAdminResponse[]; data?: SubAdminResponse[] } | SubAdminResponse[]>(
        API_CONFIG.endpoints.subAdmin.list, 
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
      console.error('Failed to fetch sub admins:', error);
      throw new Error('Failed to fetch sub admins');
    }
  }

  async getSubAdmin(id: string): Promise<SubAdminResponse> {
    try {
      return await apiClient.get<SubAdminResponse>(API_CONFIG.endpoints.subAdmin.detail(id));
    } catch (error) {
      console.error(`Failed to fetch sub admin ${id}:`, error);
      throw new Error(`Failed to fetch sub admin ${id}`);
    }
  }

  async updateSubAdmin(id: string, payload: UpdateSubAdminRequest): Promise<SubAdminResponse> {
    try {
      return await apiClient.put<SubAdminResponse>(API_CONFIG.endpoints.subAdmin.update(id), payload);
    } catch (error) {
      console.error(`Failed to update sub admin ${id}:`, error);
      throw new Error(`Failed to update sub admin ${id}`);
    }
  }

  async deleteSubAdmin(id: string): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.endpoints.subAdmin.delete(id));
    } catch (error) {
      console.error(`Failed to delete sub admin ${id}:`, error);
      throw new Error(`Failed to delete sub admin ${id}`);
    }
  }
}

export const userService = new UserService();