import { Organization, DemoUser, Permission } from '@/types/auth';

export const demoOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider',
    industry: 'Technology'
  },
  {
    id: 'org-2', 
    name: 'Global Retail Chain',
    description: 'International retail and e-commerce company',
    industry: 'Retail'
  }
];

export const demoUsers: DemoUser[] = [
  // TechCorp Solutions Users
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    role: 'manager',
    organizationId: 'org-1',
    organization: demoOrganizations[0],
    position: 'Finance Manager',
    department: 'Finance',
    description: 'Finance Manager with full access to all payment systems and approval rights',
    permissions: [
      'approve_transactions',
      'approve_funding',
      'approve_bulk_payments',
      'view_department_reports',
      'manage_team',
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash',
      'access_bulk_payments',
      'access_collections'
    ]
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    email: 'mike.chen@techcorp.com',
    role: 'staff',
    organizationId: 'org-1',
    organization: demoOrganizations[0],
    position: 'Petty Cash Officer',
    department: 'Finance',
    description: 'Staff member with petty cash access and approval rights',
    permissions: [
      'approve_transactions',
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash'
    ]
  },
  {
    id: 'user-3',
    name: 'Lisa Park',
    email: 'lisa.park@techcorp.com',
    role: 'staff',
    organizationId: 'org-1',
    organization: demoOrganizations[0],
    position: 'Payment Specialist',
    department: 'Finance',
    description: 'Staff member with both petty cash and bulk payment access',
    permissions: [
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash',
      'access_bulk_payments'
    ]
  },
  {
    id: 'user-4',
    name: 'David Kumar',
    email: 'david.kumar@techcorp.com',
    role: 'staff',
    organizationId: 'org-1',
    organization: demoOrganizations[0],
    position: 'Junior Accountant',
    department: 'Finance',
    description: 'Staff member with basic petty cash access only',
    permissions: [
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash'
    ]
  },

  // Global Retail Chain Users
  {
    id: 'user-5',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@globalretail.com',
    role: 'manager',
    organizationId: 'org-2',
    organization: demoOrganizations[1],
    position: 'Operations Manager',
    department: 'Operations',
    description: 'Operations Manager with comprehensive payment management access',
    permissions: [
      'approve_transactions',
      'approve_funding',
      'approve_bulk_payments',
      'view_department_reports',
      'manage_team',
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash',
      'access_bulk_payments',
      'access_collections'
    ]
  },
  {
    id: 'user-6',
    name: 'James Wilson',
    email: 'james.wilson@globalretail.com',
    role: 'staff',
    organizationId: 'org-2',
    organization: demoOrganizations[1],
    position: 'Store Manager',
    department: 'Retail Operations',
    description: 'Store Manager with approval rights for transactions and collections',
    permissions: [
      'approve_transactions',
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash',
      'access_collections'
    ]
  },
  {
    id: 'user-7',
    name: 'Anna Thompson',
    email: 'anna.thompson@globalretail.com',
    role: 'staff',
    organizationId: 'org-2',
    organization: demoOrganizations[1],
    position: 'Cashier Supervisor',
    department: 'Retail Operations',
    description: 'Supervisor with petty cash and bulk payment processing rights',
    permissions: [
      'submit_transactions',
      'request_funding',
      'view_own_history',
      'access_petty_cash',
      'access_bulk_payments'
    ]
  },
  {
    id: 'user-8',
    name: 'Robert Lee',
    email: 'robert.lee@globalretail.com',
    role: 'staff',
    organizationId: 'org-2',
    organization: demoOrganizations[1],
    position: 'Cashier',
    department: 'Retail Operations',
    description: 'Basic cashier with petty cash access only',
    permissions: [
      'submit_transactions',
      'view_own_history',
      'access_petty_cash'
    ]
  }
];