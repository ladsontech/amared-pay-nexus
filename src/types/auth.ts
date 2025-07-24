export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  permissions: Permission[];
  department?: string;
  avatar?: string;
}

export type UserRole = 'admin' | 'manager' | 'staff';

export type Permission = 
  // Admin permissions
  | 'system_admin'
  | 'manage_organizations'
  | 'manage_system_users'
  | 'view_system_analytics'
  
  // Manager permissions
  | 'approve_transactions'
  | 'approve_funding'
  | 'view_department_reports'
  | 'manage_team'
  
  // Staff permissions
  | 'submit_transactions'
  | 'request_funding'
  | 'view_own_history'
  
  // Common permissions
  | 'access_petty_cash'
  | 'access_bulk_payments'
  | 'access_collections';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'system_admin',
    'manage_organizations',
    'manage_system_users',
    'view_system_analytics',
    'approve_transactions',
    'approve_funding',
    'view_department_reports',
    'manage_team',
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections'
  ],
  manager: [
    'approve_transactions',
    'approve_funding',
    'view_department_reports',
    'manage_team',
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections'
  ],
  staff: [
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections'
  ]
};