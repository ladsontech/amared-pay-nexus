export interface Organization {
  id: string;
  name: string;
  description: string;
  industry: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organization: Organization;
  permissions: Permission[];
  department?: string;
  avatar?: string;
  position: string;
  // Additional fields from API
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isSuperuser?: boolean;
  isStaff?: boolean;
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
  | 'approve_bulk_payments'
  | 'approve_bank_deposits'
  | 'view_department_reports'
  | 'manage_team'
  
  // Staff permissions
  | 'submit_transactions'
  | 'request_funding'
  | 'view_own_history'
  
  // Common permissions
  | 'access_petty_cash'
  | 'access_bulk_payments'
  | 'access_collections'
  | 'access_bank_deposits';

export interface DemoUser extends User {
  description: string;
}

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
    'approve_bulk_payments',
    'approve_bank_deposits',
    'view_department_reports',
    'manage_team',
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections',
    'access_bank_deposits'
  ],
  manager: [
    'approve_transactions',
    'approve_funding',
    'approve_bulk_payments',
    'approve_bank_deposits',
    'view_department_reports',
    'manage_team',
    'submit_transactions',
    'request_funding',
    'view_own_history',
    'access_petty_cash',
    'access_bulk_payments',
    'access_collections',
    'access_bank_deposits'
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