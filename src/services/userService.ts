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
  username?: string; // Optional per API docs
  password: string;
}

export interface UpdateSubAdminRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
  password?: string; // Optional for update
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
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  date_joined: string;
  last_login: string | null;
  permissions?: string;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
  groups?: number[];
}

class UserService {
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

  async listUsers(query?: UserQuery): Promise<UserResponse[]> {
    try {
      const response = await apiClient.get<{ results?: UserResponse[]; data?: UserResponse[] } | UserResponse[]>(
        API_CONFIG.endpoints.user.userList, 
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
      console.error('API call failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<UserResponse> {
    try {
      return await apiClient.get<UserResponse>(API_CONFIG.endpoints.user.userDetail(id));
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async createSubAdmin(payload: CreateSubAdminRequest): Promise<CreateSubAdminRequest & { avatar?: string }> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can create sub-admins");
    }

    // Validate required fields
    if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone_number || !payload.password) {
      throw new Error("All required fields must be provided");
    }

    // Validate password length
    if (payload.password.length < 8 || payload.password.length > 40) {
      throw new Error("Password must be between 8 and 40 characters");
    }

    // Validate phone number length
    if (payload.phone_number.length < 10) {
      throw new Error("Phone number must be at least 10 characters");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error("Please provide a valid email address");
    }

    // Prepare payload - only include username if provided
    const requestPayload: any = {
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      email: payload.email.trim(),
      phone_number: payload.phone_number.trim(),
      password: payload.password,
    };

    if (payload.username && payload.username.trim()) {
      requestPayload.username = payload.username.trim();
    }

    try {
      const response = await apiClient.post<CreateSubAdminRequest & { avatar?: string }>(
        API_CONFIG.endpoints.subAdmin.create, 
        requestPayload
      );
      return response;
    } catch (error: any) {
      console.error('Failed to create sub admin:', error);

      let errorMessage = "";

      // Extract meaningful error messages from the error details
      if (error.details) {
        const errorData = error.details;

        if (typeof errorData === 'string') {
          // Check if it's HTML error
          if (errorData.includes('IntegrityError') || errorData.includes('duplicate key')) {
            const duplicateMatch = errorData.match(/duplicate key value violates unique constraint "([^"]+)"[^(]*\(([^)]+)\)/);
            if (duplicateMatch) {
              const field = duplicateMatch[1].replace('user_', '').replace('_key', '').replace(/_/g, ' ');
              const value = duplicateMatch[2].split('=')[1]?.replace(/\)/g, '');
              errorMessage = `A user with this ${field} (${value}) already exists. Please use a different ${field}.`;
            } else {
              errorMessage = "This data already exists. Please check your phone number, email, or username.";
            }
          } else if (errorData.includes('<!DOCTYPE html>')) {
            errorMessage = "Server error occurred. Please check all fields and try again.";
          } else {
            errorMessage = errorData;
          }
        } else if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([key, value]) => {
              const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join('; ');
          errorMessage = errors;
        }
      }

      throw new Error(errorMessage || error.message || 'Failed to create sub admin');
    }
  }

  async listSubAdmins(query?: QueryParams): Promise<SubAdminResponse[]> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can list sub-admins");
    }

    try {
      const response = await apiClient.get<{ count: number; next: string | null; previous: string | null; results: SubAdminResponse[] }>(
        API_CONFIG.endpoints.subAdmin.list, 
        query
      );
      
      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response) {
        return response.results || [];
      }
      
      // Fallback for non-paginated response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch sub admins:', error);
      throw new Error('Failed to fetch sub admins');
    }
  }

  async searchSubAdmins(query?: QueryParams): Promise<SubAdminResponse[]> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can search sub-admins");
    }

    try {
      const response = await apiClient.get<{ count: number; next: string | null; previous: string | null; results: SubAdminResponse[] }>(
        API_CONFIG.endpoints.subAdmin.search, 
        query
      );
      
      if (response && typeof response === 'object' && 'results' in response) {
        return response.results || [];
      }
      
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to search sub admins:', error);
      throw new Error('Failed to search sub admins');
    }
  }

  async getSubAdmin(id: string): Promise<SubAdminResponse> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can view sub-admin details");
    }

    try {
      return await apiClient.get<SubAdminResponse>(API_CONFIG.endpoints.subAdmin.detail(id));
    } catch (error) {
      console.error(`Failed to fetch sub admin ${id}:`, error);
      throw new Error(`Failed to fetch sub admin ${id}`);
    }
  }

  async updateSubAdmin(id: string, payload: UpdateSubAdminRequest): Promise<UpdateSubAdminRequest & { avatar?: string }> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can update sub-admins");
    }

    // Validate password if provided
    if (payload.password !== undefined) {
      if (payload.password.length < 8 || payload.password.length > 40) {
        throw new Error("Password must be between 8 and 40 characters");
      }
    }

    // Validate phone number if provided
    if (payload.phone_number !== undefined && payload.phone_number.length < 10) {
      throw new Error("Phone number must be at least 10 characters");
    }

    // Validate email if provided
    if (payload.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new Error("Please provide a valid email address");
      }
    }

    // Prepare payload - only include fields that are provided
    const requestPayload: any = {};
    if (payload.first_name !== undefined) requestPayload.first_name = payload.first_name.trim();
    if (payload.last_name !== undefined) requestPayload.last_name = payload.last_name.trim();
    if (payload.email !== undefined) requestPayload.email = payload.email.trim();
    if (payload.phone_number !== undefined) requestPayload.phone_number = payload.phone_number.trim();
    if (payload.username !== undefined && payload.username.trim()) {
      requestPayload.username = payload.username.trim();
    }
    if (payload.password !== undefined) requestPayload.password = payload.password;

    try {
      return await apiClient.put<UpdateSubAdminRequest & { avatar?: string }>(
        API_CONFIG.endpoints.subAdmin.update(id), 
        requestPayload
      );
    } catch (error: any) {
      console.error(`Failed to update sub admin ${id}:`, error);
      
      let errorMessage = error.message || `Failed to update sub admin`;
      if (error.details) {
        if (typeof error.details === 'object') {
          const errors = Object.entries(error.details)
            .map(([key, value]) => {
              const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join('; ');
          errorMessage = errors || errorMessage;
        } else if (typeof error.details === 'string') {
          errorMessage = error.details;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async deleteSubAdmin(id: string): Promise<void> {
    if (!this.checkAdminPermission()) {
      throw new Error("Unauthorized: Only superusers can delete sub-admins");
    }

    try {
      await apiClient.delete<void>(API_CONFIG.endpoints.subAdmin.delete(id));
    } catch (error) {
      console.error(`Failed to delete sub admin ${id}:`, error);
      throw new Error(`Failed to delete sub admin ${id}`);
    }
  }
}

export const userService = new UserService();